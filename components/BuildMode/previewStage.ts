import type { BuildCommand, BuildEnvelope, BuildPlanEntry, BuildReply, BuildStageName } from "./BuildMode.types";

/** Name of the highlight that hides the letters not typed yet. */
const HIDDEN = "build-hidden";
/** What counts as an icon or image: appears whole, in its turn among the letters. */
const MEDIA = "img, svg, canvas, video";
/** An icon takes as long to "type" as this many letters. */
const MEDIA_UNITS = 6;
/** Larger than this (px) and media unveils instead of popping in. */
const SCAN_ABOVE = 160;
/** Most boxes outlined per unit — enough for what's on screen. */
const MAX_BOXES = 500;
/** The colour sweep's run from the top of the viewport to the bottom. */
const SWEEP_MS = 900;
/** Jumps further than this many screens cut (a quick dip) instead of scrolling:
 *  scrolling past the pinned scenes would run their per-frame work all the way. */
const CUT_BEYOND = 1.5;
const CUT_MS = 220;
/** Longest a pinned region waits for its scroll to land. */
const ARRIVE_MS = 1500;
/** How long a detail view's follow-on scroll glides. */
const FOLLOW_MS = 450;
/** Longest wait for the hero's 3D scene before reporting ready anyway. */
const SCENE_WAIT_MS = 5000;
/** A region's share of its span spent on each step: outlines, letters, colour, then media.
 *  Media is short: its images have mostly appeared in their turn among the letters. */
const LAYOUT_END = 0.16;
const TEXT_END = 0.8;
const REGION_STEPS: [BuildStageName, number][] = [
  ["layout", LAYOUT_END],
  ["text", TEXT_END],
  ["color", 0.92],
  ["media", 1],
];

type Item = { node: Text; units: number; range: Range } | { node: Element; units: number; big: boolean };

/** What's being built right now: a whole block, a region of one, or a dialog. */
interface Unit {
  els: HTMLElement[];
  /** Whole blocks only build what's on screen; a region builds all of itself as it scrolls by. */
  onScreenOnly: boolean;
  stage: BuildStageName;
  boxes: Element[];
  boxesShown: number;
  items: Item[];
  itemTotal: number;
  /** First item not fully shown yet. */
  cursor: number;
  /** Region and detail units: the share of their file the letters phase spans. */
  span?: number;
  /** A detail view's own scroll box: it builds all of itself, scrolling to follow. */
  scroller?: HTMLElement;
  highlight: Highlight | null;
}

/**
 * The preview side of build mode, running inside the studio's iframe. It strips
 * the page back to nothing and rebuilds it as the studio's code reaches each
 * part: boxes outline one by one, letters and icons appear in reading order,
 * colour sweeps down, images unveil. Long blocks build region by region as the
 * page scrolls through them; animated pieces grow with their own file. All of
 * it is attributes and CSS (`.build-stage` in globals.css) plus a highlight
 * over the untyped letters, so React's DOM is never rewritten — and each frame
 * only touches what changed.
 */
export function startBuildStage() {
  const html = document.documentElement;
  html.classList.add("build-stage");
  html.style.scrollBehavior = "smooth";
  const style = document.createElement("style");
  style.textContent = `::highlight(${HIDDEN}) { color: transparent; }`;
  document.head.append(style);
  const hasHighlights = "highlights" in CSS;

  const stages: BuildStageName[] = [];
  let plan: BuildPlanEntry[] = [];
  let held = new Set<string>();
  let target = 0;
  let unit: Unit | null = null;
  /** Region mode: the file's regions and which one is building. */
  let regions: HTMLElement[] = [];
  let regionAt = -1;
  let focused: Element | null = null;
  /** Until when a detail view's scroll is still gliding. */
  let followUntil = 0;
  /** Whether the region being built holds a pinned scene. */
  let regionPinned = false;
  /** Latest a pinned region waits to be scrolled to before building anyway. */
  let arrivedBy = 0;
  /** Where a scroll-through runs, from and to, while it plays. */
  let scrubFrom: [number, number] | null = null;

  const reply = (msg: BuildReply) => {
    const envelope: BuildEnvelope<BuildReply> = { efface: "build", msg };
    parent.postMessage(envelope, location.origin);
  };

  // Re-resolved when needed: some blocks swap their element after mount (the
  // phone layouts), and a stale handle would drop the stage.
  const groups = (): HTMLElement[][] => {
    const sections = [...(document.querySelector("main")?.children ?? [])].filter(
      (el): el is HTMLElement => el.tagName === "SECTION"
    );
    const header = document.querySelector<HTMLElement>("body > header");
    const footer = document.querySelector<HTMLElement>("body > footer");
    const [hero, ...rest] = sections;
    return [
      [header, hero].filter((el): el is HTMLElement => !!el),
      ...rest.map((s) => [s]),
      footer ? [footer] : [],
    ];
  };

  /** Stage attributes on the blocks, and the animated pieces kept back. */
  const paint = () => {
    groups().forEach((els, i) =>
      els.forEach((el) => {
        const stage = stages[i] ?? "done";
        if (el.dataset.build !== stage) el.dataset.build = stage;
      })
    );
    for (const f of plan)
      if (f.grow && held.has(f.grow))
        document.querySelectorAll(f.grow).forEach((el) => el.setAttribute("data-build-hold", f.land ? "land" : "draw"));
  };

  const release = (sel: string) => {
    held.delete(sel);
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      el.removeAttribute("data-build-hold");
      el.style.removeProperty("--build-grow");
    });
  };

  /** Gets to `y`: a scroll when it's near, a cut when it's far (or when `cut`). */
  const go = (y: number, cut = false) => {
    const top = Math.max(0, y);
    if (!cut && Math.abs(top - scrollY) <= innerHeight * CUT_BEYOND) return void scrollTo({ top });
    html.style.transition = `opacity ${CUT_MS}ms ease`;
    html.style.opacity = "0";
    setTimeout(() => {
      scrollTo({ top, behavior: "instant" });
      requestAnimationFrame(() => (html.style.opacity = "1"));
    }, CUT_MS);
  };

  const onScreen = (r: DOMRect) => {
    const top = r.top + scrollY - target;
    return r.width > 0 && r.height > 0 && top > -r.height && top < innerHeight;
  };

  // Only what a viewer could see gets built piece by piece: not the copies a
  // marquee keeps off to the side, the cards of a sideways scroller, or what's
  // hidden. Those would take their turn with nothing changing on screen.
  // Faded-out copy is skipped too where the page stays put; a region scrolls
  // as it builds, and the page's own scroll scenes fade that copy in.
  const across = (r: DOMRect, u?: Unit) => {
    const box = u?.scroller?.getBoundingClientRect();
    return r.right > (box?.left ?? 0) && r.left < (box?.right ?? innerWidth);
  };
  const shows = (el: Element | null, faded: boolean) =>
    !el || !el.checkVisibility || el.checkVisibility({ visibilityProperty: true, opacityProperty: faded });
  /** Whether `r` shows through each box above `el` that clips its overflow — a
   *  shot lane, a strip — bar the unit's own scroll box, which scrolls to it. */
  const unclipped = (u: Unit, r: DOMRect, el: Element | null) => {
    for (let a = el?.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX === "visible" && cs.overflowY === "visible") continue;
      const b = a.getBoundingClientRect();
      if (cs.overflowX !== "visible" && (r.right <= b.left || r.left >= b.right)) return false;
      if (cs.overflowY !== "visible" && a !== u.scroller && (r.bottom <= b.top || r.top >= b.bottom)) return false;
    }
    return true;
  };
  const fits = (u: Unit, r: DOMRect, el: Element | null) =>
    across(r, u) && (!u.onScreenOnly || onScreen(r)) && shows(el, u.onScreenOnly) && unclipped(u, r, el);

  // The camera: the block holding the piece being built, sent whenever the
  // build moves into a new one. Nothing (pull back) for blocks too big to be
  // worth a close-up.
  const focusOn = (el: Element | null) => {
    if (el === focused) return;
    const r = el?.getBoundingClientRect();
    // Never to somewhere off screen: the camera would pan over nothing.
    if (r && !(across(r) && r.bottom > 0 && r.top < innerHeight)) return;
    focused = el;
    const worth = r && r.width > 0 && r.width < innerWidth * 0.85 && r.height < innerHeight * 0.6;
    reply({ type: "focus", rect: worth ? { x: r.left, y: r.top, w: r.width, h: r.height } : null });
  };

  // ── Layout: boxes outlined in document order as the code goes in.
  const collectBoxes = (u: Unit) => {
    const found: Element[] = [];
    for (const root of u.els)
      for (const el of [root, ...root.querySelectorAll("*")]) {
        if (found.length >= MAX_BOXES) break;
        if (/^(SPAN|BR|SCRIPT|STYLE)$/.test(el.tagName) || el.closest("svg, [data-build-hold]")) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 4 && r.height > 4 && fits(u, r, el)) found.push(el);
      }
    u.boxes = found;
    u.boxesShown = 0;
  };
  const outline = (u: Unit, p: number) => {
    const shown = Math.min(u.boxes.length, Math.ceil(p * u.boxes.length));
    for (let i = u.boxesShown; i < shown; i++) u.boxes[i].setAttribute("data-build-box", "");
    u.boxesShown = Math.max(u.boxesShown, shown);
  };

  // ── Text: letters and icons in reading order, each in its turn. Ranges and
  // sizes are read once here; each frame after only moves the cursor.
  const collectItems = (u: Unit) => {
    const items: Item[] = [];
    for (const root of u.els) {
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          if (n.nodeType === Node.TEXT_NODE) return n.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          const el = n as Element;
          if (el.hasAttribute("data-build-hold")) return NodeFilter.FILTER_REJECT;
          if (el.matches(MEDIA)) return NodeFilter.FILTER_ACCEPT;
          return el.closest("svg") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
        },
      });
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          range.selectNodeContents(n);
          if (fits(u, range.getBoundingClientRect(), n.parentElement))
            items.push({ node: n as Text, units: (n as Text).length, range });
        } else {
          const el = n as Element;
          // An svg's own parts aren't walked into — the icon appears whole.
          if (el.tagName !== "svg" && el.closest("svg")) continue;
          const r = el.getBoundingClientRect();
          if (fits(u, r, el)) items.push({ node: el, units: MEDIA_UNITS, big: r.width > SCAN_ABOVE || r.height > SCAN_ABOVE });
        }
      }
    }
    // Writes after all the reads: everything starts hidden. Images decode now,
    // off the main thread, so their turn doesn't stall on it.
    for (const it of items)
      if (!("range" in it)) {
        it.node.setAttribute("data-build-wait", "");
        if (it.node instanceof HTMLImageElement) it.node.decode().catch(() => {});
      }
    u.items = items;
    u.itemTotal = items.reduce((sum, it) => sum + it.units, 0);
    u.cursor = 0;
    u.highlight = hasHighlights ? new Highlight(...items.flatMap((it) => ("range" in it ? [it.range] : []))) : null;
    if (u.highlight) CSS.highlights.set(HIDDEN, u.highlight);
  };

  const showMedia = (el: Element, big: boolean) => {
    if (!el.hasAttribute("data-build-wait")) return;
    el.removeAttribute("data-build-wait");
    el.setAttribute("data-build-in", big ? "scan" : "pop");
  };

  const reveal = (u: Unit, p: number) => {
    const from = Math.floor(p * u.itemTotal);
    let seen = u.items.slice(0, u.cursor).reduce((sum, it) => sum + it.units, 0);
    let moved = false;
    while (u.cursor < u.items.length) {
      const it = u.items[u.cursor];
      const typed = from - seen;
      if (typed <= 0) break;
      if (typed < it.units) {
        // Partly typed: the mask now starts further into this text node.
        if ("range" in it) it.range.setStart(it.node, typed);
        moved = true;
        break;
      }
      if ("range" in it) u.highlight?.delete(it.range);
      else showMedia(it.node, it.big);
      seen += it.units;
      u.cursor++;
      moved = true;
    }
    if (!moved) return;
    // Re-registering repaints the highlight after its ranges moved.
    if (u.highlight) CSS.highlights.set(HIDDEN, u.highlight);
    const it = u.items[u.cursor];
    const el = it && ("range" in it ? it.node.parentElement : it.node);
    // While the dialog scrolls on, the camera pulls back; it closes in again after.
    if (u.scroller && el && follow(u.scroller, el)) return void focusOn(null);
    focusOn(el?.closest("h1, h2, h3, h4, p, li, a, dt, dd, small, blockquote") ?? el ?? null);
  };

  /** Scrolls a detail view on once the build nears its foot, leaving the piece a third of the way down. */
  const follow = (box: HTMLElement, el: Element) => {
    // One glide at a time: a new target every frame would keep restarting it.
    if (performance.now() < followUntil) return true;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.top > b.top + b.height * 0.15 && r.bottom < b.top + b.height * 0.8) return false;
    box.scrollTo({ top: box.scrollTop + r.top - (b.top + b.height / 3), behavior: "smooth" });
    followUntil = performance.now() + FOLLOW_MS;
    return true;
  };

  /** Everything still waiting appears; the letter mask comes off. */
  const settle = (u: Unit) => {
    for (const it of u.items) if (!("range" in it)) showMedia(it.node, it.big);
    u.items = [];
    u.itemTotal = 0;
    u.highlight = null;
    if (hasHighlights) CSS.highlights.delete(HIDDEN);
  };

  // ── Colour: lands top to bottom, each element delayed by where it sits.
  // All reads first, then all writes, so the browser lays out once.
  const sweep = (u: Unit) => {
    const marks: [HTMLElement | SVGElement, number][] = [];
    for (const root of u.els)
      for (const el of [root, ...root.querySelectorAll<HTMLElement | SVGElement>("*")]) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        marks.push([el, Math.max(0, Math.min(1, r.top / innerHeight))]);
      }
    for (const [el, at] of marks) el.style.setProperty("--build-delay", `${Math.round(at * SWEEP_MS)}ms`);
  };

  /** Moves a unit to its next stage — never back. */
  const stageUnit = (u: Unit, stage: BuildStageName, speed = 1) => {
    if (u.stage === stage) return;
    u.stage = stage;
    u.els.forEach((el) => {
      el.dataset.build = stage;
      el.style.setProperty("--build-speed", String(speed));
    });
    if (stage === "layout") {
      collectBoxes(u);
      outline(u, 0);
    } else if (stage === "text") {
      outline(u, 1);
      collectItems(u);
      reveal(u, 0);
      // The studio slows its typing to this phase's letters (see the player).
      reply({ type: "letters", units: u.itemTotal, span: u.span });
    } else if (stage !== "blank") {
      settle(u);
      // Colour and images land on the whole unit: pull back to see them.
      focusOn(null);
      if (stage === "color") sweep(u);
    }
  };

  const newUnit = (els: HTMLElement[], onScreenOnly: boolean, stage: BuildStageName = "blank"): Unit => ({
    els,
    onScreenOnly,
    stage,
    boxes: [],
    boxesShown: 0,
    items: [],
    itemTotal: 0,
    cursor: 0,
    highlight: null,
  });

  /** Region mode: the region for progress `p`, at its own step for where in its span `p` is. */
  const buildRegions = (p: number, speed: number) => {
    if (!regions.length) return;
    const at = Math.min(regions.length - 1, Math.floor(p * regions.length));
    const q = p * regions.length - at;
    const fresh = at !== regionAt;
    if (fresh) {
      if (unit) stageUnit(unit, "done", speed);
      regionAt = at;
      unit = newUnit([regions[at]], false);
      unit.span = (TEXT_END - LAYOUT_END) / regions.length;
    }
    if (!unit) return;
    const region = regions[at];
    // Tall regions (the project grid) scroll by as they build. A pinned scene
    // (a featured row) is built where its runway ends instead: held in place
    // with every cover in, the way it reads once scrolled through.
    const top = Math.round(region.getBoundingClientRect().top + scrollY);
    const run = Math.max(0, region.offsetHeight - innerHeight);
    if (fresh) regionPinned = [...region.children].some((c) => getComputedStyle(c).position === "sticky");
    const along = regionPinned ? 1 : Math.min(1, q / 0.95);
    const y = Math.min(
      html.scrollHeight - innerHeight,
      top + Math.round(along * run) - (run ? 0 : Math.max(0, (innerHeight - region.offsetHeight) / 3))
    );
    // A new region is reached by a scroll (or a cut); within one, the page
    // follows the build frame by frame.
    // (Larger gaps mean that scroll or cut is still under way — leave it be.)
    // A pinned row is cut to: a glide would play its scene on the way and land late.
    if (fresh) go(y, regionPinned);
    else if (Math.abs(scrollY - y) > 1 && Math.abs(scrollY - y) < 80) scrollTo({ top: Math.max(0, y), behavior: "instant" });
    // A pinned scene builds once it's there — what's in frame depends on where
    // it's scrolled to — or after a moment, should it never quite arrive.
    if (fresh) arrivedBy = performance.now() + ARRIVE_MS;
    if (regionPinned && Math.abs(scrollY - Math.max(0, y)) > 2 && performance.now() < arrivedBy) return;
    target = scrollY;
    let start = 0;
    for (const [stage, end] of REGION_STEPS) {
      if (q < end || stage === "media") {
        stageUnit(unit, stage, speed);
        const local = (q - start) / (end - start);
        if (stage === "layout") outline(unit, local);
        else if (stage === "text") reveal(unit, Math.min(1, local));
        break;
      }
      start = end;
    }
  };

  const entry = (file: number) => plan[file];

  /** A block's own scroll scene, played by scrolling through it as its code
   *  types — eased in and out, a frame at a time, so the scene paints every step. */
  const scrubThrough = (f: BuildPlanEntry, p: number) => {
    const el = (groups()[f.sec] ?? []).find((e) => e.tagName !== "HEADER");
    if (!el) return;
    if (!scrubFrom) {
      focusOn(null);
      const top = Math.round(el.getBoundingClientRect().top + scrollY);
      scrubFrom = [top, top + Math.max(0, el.offsetHeight - innerHeight)];
    }
    const [from, to] = scrubFrom;
    const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
    scrollTo({ top: Math.round(from + (to - from) * e), behavior: "instant" });
    target = scrollY;
  };

  const run = (msg: BuildCommand) => {
    switch (msg.type) {
      case "reset":
        groups().forEach((_, i) => (stages[i] = "blank"));
        if (unit) settle(unit);
        unit = null;
        scrollTo({ top: 0, behavior: "instant" });
        break;
      case "plan":
        plan = msg.files;
        held = new Set(plan.flatMap((f) => (f.grow ? [f.grow] : [])));
        break;
      case "enter": {
        const f = entry(msg.file);
        if (!f) break;
        const els = groups()[f.sec] ?? [];
        regions = [];
        regionAt = -1;
        if (f.grow) {
          // An animated piece: bring it into view and let it grow there.
          const el = document.querySelector<HTMLElement>(f.grow);
          if (el) go(el.getBoundingClientRect().top + scrollY - innerHeight * 0.25);
          focusOn(null);
        } else if (f.scrub) {
          // A scroll scene: the block is built; its code now plays it through.
          focusOn(null);
        } else if (f.detail) {
          // A detail view: open it the way a visitor would.
          document.querySelector<HTMLElement>(f.detail)?.click();
        } else if (f.regions) {
          // A long block: it shows, but each region waits for its turn.
          stages[f.sec] = "done";
          regions = [...(els[0]?.querySelectorAll<HTMLElement>(f.regions) ?? [])];
          regions.forEach((r) => (r.dataset.build = "blank"));
        } else {
          const el = els.find((e) => e.tagName !== "HEADER");
          target = el ? Math.round(el.getBoundingClientRect().top + scrollY) : 0;
          go(target);
          unit = newUnit(els, true, stages[f.sec]);
        }
        break;
      }
      case "stage": {
        const f = entry(msg.file);
        if (!f) break;
        stages[f.sec] = msg.stage;
        if (unit) stageUnit(unit, msg.stage, msg.speed);
        break;
      }
      case "layout":
        if (unit?.stage === "layout") outline(unit, msg.p);
        break;
      case "text":
        if (unit?.stage === "text") reveal(unit, msg.p);
        break;
      case "progress": {
        const f = entry(msg.file);
        if (!f) break;
        if (f.grow) {
          document.querySelectorAll<HTMLElement>(f.grow).forEach((el) => el.style.setProperty("--build-grow", msg.p.toFixed(3)));
        } else if (f.scrub) scrubThrough(f, msg.p);
        else if (f.regions) buildRegions(msg.p, msg.speed);
        else if (f.detail) {
          // The dialog mounts a beat after the click; build it once it's there.
          if (!unit) {
            const dialog = document.querySelector<HTMLElement>("dialog[open]");
            if (dialog) {
              // All of it, the dialog scrolling to follow (see `follow`).
              unit = newUnit([dialog], false);
              unit.scroller = dialog;
              unit.span = TEXT_END - LAYOUT_END;
              stageUnit(unit, "blank");
            }
          }
          if (unit) {
            regions = [unit.els[0]];
            if (regionAt < 0) regionAt = 0;
            let start = 0;
            for (const [stage, end] of REGION_STEPS) {
              if (msg.p < end || stage === "media") {
                stageUnit(unit, stage, msg.speed);
                const local = (msg.p - start) / (end - start);
                if (stage === "layout") outline(unit, local);
                else if (stage === "text") reveal(unit, Math.min(1, local));
                break;
              }
              start = end;
            }
          }
        }
        break;
      }
      case "fileDone": {
        const f = entry(msg.file);
        if (!f) break;
        scrubFrom = null;
        if (f.grow) release(f.grow);
        if (unit) stageUnit(unit, "done");
        if (f.detail) {
          const dialog = unit?.els[0];
          setTimeout(() => (dialog as HTMLDialogElement | undefined)?.close(), 600);
        }
        unit = null;
        regions = [];
        break;
      }
      case "finish":
        scrubFrom = null;
        groups().forEach((_, i) => (stages[i] = "done"));
        if (unit) settle(unit);
        unit = null;
        document.querySelectorAll("[data-build]").forEach((el) => el.setAttribute("data-build", "done"));
        [...held].forEach(release);
        document.querySelector<HTMLDialogElement>("dialog[open]")?.close();
        focusOn(null);
        // Instant: a long smooth scroll back up stalls on the pinned scenes.
        scrollTo({ top: 0, behavior: "instant" });
        break;
    }
    if (msg.type !== "layout" && msg.type !== "text" && msg.type !== "progress") paint();
  };

  addEventListener("message", (e: MessageEvent<BuildEnvelope<BuildCommand>>) => {
    if (e.source !== parent || e.origin !== location.origin || e.data?.efface !== "build") return;
    run(e.data.msg);
  });

  // Ready once the page has settled (phone layouts swap in on mount) and the
  // hero's 3D scene has compiled — that's the heaviest moment of the page, and
  // it belongs under the splash, not in the middle of the build. Wiped clean.
  const ready = () => {
    const since = performance.now();
    const check = () => {
      const scene = document.querySelector("main section canvas");
      if (!scene && performance.now() - since < SCENE_WAIT_MS) return void setTimeout(check, 150);
      setTimeout(() => {
        run({ type: "reset" });
        reply({ type: "ready", sections: groups().length });
      }, 600);
    };
    check();
  };
  if (document.readyState === "complete") ready();
  else addEventListener("load", ready, { once: true });
}
