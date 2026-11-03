import type { BuildCommand, BuildEnvelope, BuildReply, BuildStageName } from "./BuildMode.types";

/** Name of the highlight that hides the letters not typed yet. */
const HIDDEN = "build-hidden";
/** What counts as an icon or image: appears whole, in its turn among the letters. */
const MEDIA = "img, svg, canvas, video";
/** An icon takes as long to "type" as this many letters. */
const MEDIA_UNITS = 6;
/** Larger than this (px) and media renders in with a scan instead of popping in. */
const SCAN_ABOVE = 160;
/** Most boxes outlined per block — enough for the visible frame. */
const MAX_BOXES = 400;
/** The colour sweep's run from the top of the viewport to the bottom. */
const SWEEP_MS = 900;

type Item = { node: Text; units: number } | { node: Element; units: number };

/**
 * The preview side of build mode, running inside the studio's iframe. It strips
 * the page back to nothing and rebuilds one block at a time as the studio's
 * code reaches it, a piece at a time: boxes outline one by one, letters and
 * icons appear in reading order, colour sweeps down, the images scan in. All
 * of it is attributes and CSS (see `.build-stage` in globals.css) plus a
 * highlight over the untyped letters, so React's DOM is never rewritten.
 */
export function startBuildStage() {
  const html = document.documentElement;
  html.classList.add("build-stage");
  html.style.scrollBehavior = "smooth";
  const style = document.createElement("style");
  style.textContent = `::highlight(${HIDDEN}) { color: transparent; }`;
  document.head.append(style);

  const stages: BuildStageName[] = [];
  let target = 0;
  let boxes: Element[] = [];
  let items: Item[] = [];
  let itemTotal = 0;
  let focused: Element | null = null;

  const reply = (msg: BuildReply) => {
    const envelope: BuildEnvelope<BuildReply> = { efface: "build", msg };
    parent.postMessage(envelope, location.origin);
  };

  // Re-resolved on every command: some blocks swap their element after mount
  // (the phone layouts), and a stale handle would drop the stage.
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

  const paint = () =>
    groups().forEach((els, i) =>
      els.forEach((el) => {
        el.dataset.build = stages[i] ?? "done";
      })
    );

  /** On screen once the block has scrolled in (the scroll may still be running). */
  const inView = (r: DOMRect) => {
    const top = r.top + scrollY - target;
    return r.width > 0 && r.height > 0 && top > -r.height && top < innerHeight;
  };

  // The camera: the block holding the piece being built, sent whenever the
  // build moves into a new one. Nothing (pull back) for blocks too big to be
  // worth a close-up.
  const focusOn = (el: Element | null) => {
    if (el === focused) return;
    focused = el;
    const r = el?.getBoundingClientRect();
    const worth = r && r.width > 0 && r.width < innerWidth * 0.85 && r.height < innerHeight * 0.6;
    reply({ type: "focus", rect: worth ? { x: r.left, y: r.top, w: r.width, h: r.height } : null });
  };

  // ── Layout: the visible boxes, outlined in document order as the code goes in.
  const collectBoxes = (els: HTMLElement[]) => {
    boxes = [];
    for (const root of els)
      for (const el of [root, ...root.querySelectorAll("*")]) {
        if (boxes.length >= MAX_BOXES) break;
        if (el.closest("svg") || /^(SPAN|BR|SCRIPT|STYLE)$/.test(el.tagName)) continue;
        if (inView(el.getBoundingClientRect())) boxes.push(el);
      }
  };
  const outline = (p: number) => {
    const shown = Math.ceil(p * boxes.length);
    boxes.forEach((el, i) => el.toggleAttribute("data-build-box", i < shown));
  };

  // ── Text: letters and icons in reading order, each in its turn.
  const collectItems = (els: HTMLElement[]) => {
    items = [];
    for (const root of els) {
      const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          if (n.nodeType === Node.TEXT_NODE) return n.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          const el = n as Element;
          if (el.matches(MEDIA)) return NodeFilter.FILTER_ACCEPT;
          return el.closest("svg") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP;
        },
      });
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) {
          const range = document.createRange();
          range.selectNodeContents(n);
          if (inView(range.getBoundingClientRect())) items.push({ node: n as Text, units: (n as Text).length });
        } else {
          const el = n as Element;
          // An svg's own parts aren't walked into — the icon appears whole.
          if (el.tagName === "svg" || !el.closest("svg")) {
            if (inView(el.getBoundingClientRect())) items.push({ node: el, units: MEDIA_UNITS });
          }
        }
      }
    }
    itemTotal = items.reduce((sum, it) => sum + it.units, 0);
  };

  const showMedia = (el: Element) => {
    if (!el.hasAttribute("data-build-wait")) return;
    el.removeAttribute("data-build-wait");
    const r = el.getBoundingClientRect();
    el.setAttribute("data-build-in", r.width > SCAN_ABOVE || r.height > SCAN_ABOVE ? "scan" : "pop");
  };

  const reveal = (from: number) => {
    const ranges: Range[] = [];
    let seen = 0;
    let building: Item | undefined;
    for (const it of items) {
      const start = Math.max(0, Math.min(it.units, from - seen));
      seen += it.units;
      if (it.node instanceof Text) {
        if (start === it.units) continue;
        building ??= it;
        const range = document.createRange();
        range.setStart(it.node, start);
        range.setEnd(it.node, it.node.length);
        ranges.push(range);
      } else if (start === it.units) showMedia(it.node);
      else {
        building ??= it;
        if (!it.node.hasAttribute("data-build-in")) it.node.setAttribute("data-build-wait", "");
      }
    }
    if ("highlights" in CSS) CSS.highlights.set(HIDDEN, new Highlight(...ranges));
    const el = building && (building.node instanceof Text ? building.node.parentElement : building.node);
    focusOn(el?.closest("h1, h2, h3, h4, p, li, a, dt, dd, small, blockquote") ?? el ?? null);
  };

  /** Everything still waiting appears; the letter mask comes off. */
  const settle = () => {
    for (const it of items) if (!(it.node instanceof Text)) showMedia(it.node);
    items = [];
    itemTotal = 0;
    if ("highlights" in CSS) CSS.highlights.delete(HIDDEN);
  };

  // ── Colour: lands top to bottom, each element delayed by where it sits.
  const sweep = (els: HTMLElement[]) => {
    for (const root of els)
      for (const el of [root, ...root.querySelectorAll<HTMLElement | SVGElement>("*")]) {
        const r = el.getBoundingClientRect();
        if (!inView(r)) continue;
        const at = Math.max(0, Math.min(1, (r.top + scrollY - target) / innerHeight));
        el.style.setProperty("--build-delay", `${Math.round(at * SWEEP_MS)}ms`);
      }
  };

  const run = (msg: BuildCommand) => {
    switch (msg.type) {
      case "reset":
        groups().forEach((_, i) => (stages[i] = "blank"));
        settle();
        scrollTo({ top: 0, behavior: "instant" });
        break;
      case "enter": {
        const el = groups()[msg.sec]?.find((e) => e.tagName !== "HEADER");
        target = el ? Math.round(el.getBoundingClientRect().top + scrollY) : 0;
        scrollTo({ top: target });
        break;
      }
      case "stage": {
        const els = groups()[msg.sec] ?? [];
        stages[msg.sec] = msg.stage;
        els.forEach((el) => el.style.setProperty("--build-speed", String(msg.speed)));
        if (msg.stage === "layout") {
          collectBoxes(els);
          outline(0);
        } else if (msg.stage === "text") {
          outline(1);
          collectItems(els);
          reveal(0);
        } else {
          settle();
          // Colour and images land on the whole block: pull back to see them.
          focusOn(null);
          if (msg.stage === "color") sweep(els);
        }
        break;
      }
      case "layout":
        if (stages[msg.sec] === "layout") outline(msg.p);
        break;
      case "text":
        if (stages[msg.sec] === "text") reveal(Math.floor(msg.p * itemTotal));
        break;
      case "finish":
        groups().forEach((_, i) => (stages[i] = "done"));
        settle();
        focusOn(null);
        // Instant: a long smooth scroll back up stalls on the pinned scenes.
        scrollTo({ top: 0, behavior: "instant" });
        break;
    }
    paint();
  };

  addEventListener("message", (e: MessageEvent<BuildEnvelope<BuildCommand>>) => {
    if (e.source !== parent || e.origin !== location.origin || e.data?.efface !== "build") return;
    run(e.data.msg);
  });

  // Ready once the page has settled (phone layouts swap in on mount), wiped clean.
  const ready = () =>
    setTimeout(() => {
      run({ type: "reset" });
      reply({ type: "ready", sections: groups().length });
    }, 300);
  if (document.readyState === "complete") ready();
  else addEventListener("load", ready, { once: true });
}
