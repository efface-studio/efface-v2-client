import { createSound } from "./sound";
import { snapshot } from "./snapshot";
import {
  SWARM_AGENTS,
  SWARM_COLORS,
  SWARM_CARRY_MAX_MS,
  SWARM_CARRY_REACH_MS,
  SWARM_DOOR_REACH,
  SWARM_DRAG_MS,
  SWARM_ENTER_MS,
  SWARM_EXIT_MS,
  SWARM_FADE_MS,
  SWARM_FAN_MS,
  SWARM_HOME_IDLE_MS,
  SWARM_REST_MS,
  SWARM_MAX_AGENTS,
  SWARM_MAX_CARRY,
  SWARM_FIRST_SHARE,
  SWARM_ORBIT_MS,
  SWARM_PACE_MAX,
  SWARM_PACE_MIN,
  SWARM_PACE_START,
  SWARM_REVEAL_MS,
  SWARM_RULER,
  SWARM_RULERS_FROM,
  SWARM_SWEEP_MS,
  SWARM_TOUR_FRONT,
  SWARM_TOUR_EMPTY,
  SWARM_TOUR_MAX,
  SWARM_TURN_MS,
  SWARM_TYPE_CPS,
  SWARM_TYPE_MAX_MS,
  SWARM_VIEW_BOTTOM,
  SWARM_VIEW_TOP,
} from "./swarm.constants";
import type { SwarmCursorMode, SwarmLayer, SwarmPhase, SwarmState } from "./swarm.types";

/** A task script: advanced once a frame with that frame's (speed-scaled) ms. */
type Script = Generator<void, void, number>;

interface Agent {
  el: HTMLDivElement;
  color: string;
  mode: SwarmCursorMode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Orbit: which flock, and where in it. */
  flock: number;
  slot: number;
  script: Script | null;
  /** The box it's working on, for the rulers' highlight. */
  sel: DOMRect | null;
  /** Home: when its turn at the door comes, and whether it's gone in. */
  homeAt?: number;
  inside?: boolean;
  /** Resting during the build: since when it's had nothing to do, and whether it's on its way in. */
  idleSince?: number;
  goingHome?: boolean;
  /** Stepping through the door: since when, and from where. Coming out: since when. */
  enterAt?: number;
  ex?: number;
  ey?: number;
  popAt?: number;
}

export interface SwarmOptions {
  /** The overlay's layers, inside its shadow root. */
  stage: HTMLElement;
  cover: HTMLElement;
  logo: HTMLElement;
  /** The little house the cursors go into when the pointer rests. */
  house: HTMLElement;
  rulerTop: HTMLCanvasElement;
  rulerLeft: HTMLCanvasElement;
  /** The page's blocks to rebuild, top to bottom (for the `page`th page of the run). */
  roots: (page: number) => Element[];
  /** Pages in the run; the engine moves on to the next through `turn`, which resolves once it's there. */
  pages: number;
  turn: (page: number) => Promise<void>;
  /** The whole run, splash included, from start to done (ms at 1×), and when it began (the click). */
  duration: number;
  startedAt: number;
  /** How long a stretch of the page should take, relative to its height (1: its fair share). */
  weigh: (block: Element, index: number, page: number) => number;
  /** Elements left out (the overlay itself, the nav's build button). */
  skip: (el: Element) => boolean;
  onState: (s: SwarmState) => void;
}

const HIDDEN = "swarm-hidden";
const PAGE_CSS = `
html.swarm-on body *{visibility:hidden!important}
html.swarm-on [data-swarm="on"],html.swarm-on [data-swarm="on"] *{visibility:visible!important}
html.swarm-on [data-swarm="wait"],html.swarm-on [data-swarm="wait"] *:not([data-swarm="on"]){visibility:hidden!important}
html.swarm-on body>[data-swarm-ui]{visibility:visible!important}
html.swarm-run{scroll-behavior:auto!important}
::highlight(${HIDDEN}){color:transparent}`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const rectOf = (el: Element) => el.getBoundingClientRect();

const cursorSvg = (mode: SwarmCursorMode, c: string) =>
  mode === "arrow"
    ? `<svg width="20" height="20" viewBox="0 0 20 20" style="transform:translate(-3px,-2px)"><path d="M3 2 17 8.4 10.2 10.2 8.4 17Z" fill="${c}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`
    : mode === "cross"
      ? `<svg width="20" height="20" viewBox="0 0 20 20" style="transform:translate(-10px,-10px)"><path d="M10 2v16M2 10h16" stroke="#fff" stroke-width="3.4"/><path d="M10 2v16M2 10h16" stroke="${c}" stroke-width="1.5"/></svg>`
      : `<svg width="14" height="22" viewBox="0 0 14 22" style="transform:translate(-7px,-11px)"><path d="M3 2h8M7 2v18M3 20h8" stroke="#fff" stroke-width="3.4" fill="none"/><path d="M3 2h8M7 2v18M3 20h8" stroke="${c}" stroke-width="1.5" fill="none"/></svg>`;

/**
 * Build 2: a swarm of multiplayer cursors wipes the page and builds it back,
 * live, on the real page — each layer stays hidden until a cursor draws its
 * box (crosshair drag, a W × H badge, a placeholder, then the real fill),
 * types its text with an I-beam, sweeps its image in, pens its line, or
 * ⌥-drags it off a repeated sibling. It follows the reader (or tours the page
 * itself), and when it's done the cursors flock to the pointer.
 */
export function createSwarm(o: SwarmOptions) {
  const sound = createSound();
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const style = document.createElement("style");
  style.textContent = PAGE_CSS;
  const hasHighlights = typeof CSS !== "undefined" && "highlights" in CSS;

  let layers: SwarmLayer[] = [];
  /** 0 waiting, 1 in hand, 3 drawn (its box is down; what's inside may start), 2 built. */
  let status = new Uint8Array(0);
  let front = 0;
  let built = 0;
  let ranges = new Map<Text, Range>();
  let highlight: Highlight | null = null;
  const agents: Agent[] = [];
  let phase: SwarmPhase = "scan";
  let phaseAt = 0;
  let speed = 1;
  /** Pacing: the run keeps to its time — each page to its deadline, sped up or eased off as it goes. */
  let pace = SWARM_PACE_START;
  let endAt = 0;
  let page = 0;
  let pageStart = 0;
  let pageEnd = 0;
  let tour = true;
  let raf = 0;
  let last = 0;
  let emitted = 0;
  let textTasks = 0;
  let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let mouseAt = 0;
  let stopped = false;
  let lastBuilt = 0;
  let idleUntil = 0;
  let guides = 0;
  let carryAt = 0;
  let stuckSince = 0;
  /** The letter mask changed this frame (re-registered once, after every agent's step). */
  let masked = false;

  // ── State out to the toolbar, a few times a second.
  const emit = (force = false) => {
    const now = performance.now();
    if (!force && now - emitted < 120) return;
    emitted = now;
    o.onState({ phase, agents: agents.length, done: built, total: layers.length, tour, speed, sound: sound.on });
  };

  // ── Cursors.
  const setMode = (a: Agent, mode: SwarmCursorMode) => {
    if (a.mode === mode) return;
    a.mode = mode;
    a.el.innerHTML = cursorSvg(mode, a.color);
  };
  const addAgent = (x: number, y: number) => {
    const el = document.createElement("div");
    el.className = "cursor";
    const color = SWARM_COLORS[agents.length % SWARM_COLORS.length];
    const a: Agent = { el, color, mode: "cross", x, y, vx: 0, vy: 0, flock: agents.length % 2, slot: Math.floor(agents.length / 2), script: null, sel: null };
    setMode(a, "arrow");
    o.stage.append(el);
    agents.push(a);
    return a;
  };
  const edgePoint = (i: number) => {
    const side = i % 4;
    const t = Math.random();
    return side === 0 ? [t * innerWidth, -30] : side === 1 ? [innerWidth + 30, t * innerHeight] : side === 2 ? [t * innerWidth, innerHeight + 30] : [-30, t * innerHeight];
  };
  const pan = (x: number) => (x / innerWidth) * 2 - 1;

  // ── Decorations: a selection box with handles and a size badge, a
  // placeholder fill, guides and measures — all in the overlay, following the
  // element live (pinned scenes move it).
  const deco = (cls: string) => {
    const d = document.createElement("div");
    d.className = cls;
    o.stage.prepend(d);
    return d;
  };
  const place = (d: HTMLElement, x: number, y: number, w: number, h: number) => {
    d.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`;
    d.style.width = `${Math.max(0, Math.round(w))}px`;
    d.style.height = `${Math.max(0, Math.round(h))}px`;
  };
  const selection = (fill: "none" | "box" | "media") => {
    const wrap = deco("sel");
    wrap.innerHTML = `${fill === "none" ? "" : `<i class="ph${fill === "media" ? " media" : ""}"></i>`}<b></b><b></b><b></b><b></b><em></em>`;
    const badge = wrap.querySelector("em")!;
    return {
      set(x: number, y: number, w: number, h: number) {
        place(wrap, x, y, w, h);
        badge.textContent = `${Math.round(w)} × ${Math.round(h)}`;
      },
      fade(k: number) {
        wrap.style.opacity = String(k);
      },
      plain() {
        wrap.classList.add("plain");
      },
      /** Held and moving: handles, no size badge. */
      moving() {
        wrap.classList.add("move");
      },
      remove: () => wrap.remove(),
    };
  };

  // ── Layers: hidden until built.
  const mark = (L: SwarmLayer, v: "wait" | "on") => L.el.setAttribute("data-swarm", v);
  const finish = (L: SwarmLayer) => {
    if (status[L.id] === 2) return;
    status[L.id] = 2;
    built++;
    mark(L, "on");
    if (L.text) {
      for (const t of L.text) {
        const r = ranges.get(t);
        if (r) highlight?.delete(r);
      }
      masked = true;
    }
  };
  const fadeIn = (el: Element, kind: SwarmLayer["kind"], side?: SwarmLayer["side"]) => {
    if (reduce) return;
    const ms = (kind === "media" ? SWARM_SWEEP_MS : SWARM_REVEAL_MS) / speed;
    const frames: Keyframe[] =
      kind === "media"
        ? [{ clipPath: "inset(0 0 100% 0)", opacity: 0.6 }, { clipPath: "inset(0 0 0% 0)", opacity: 1 }]
        : kind === "line"
          ? side === "left" || side === "right"
            ? [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)" }]
            : [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }]
          : [{ opacity: 0 }, { opacity: 1 }];
    el.animate(frames, { duration: ms, easing: "cubic-bezier(.22,1,.36,1)" });
  };

  // ── Task scripts.
  function* wait(ms: number): Script {
    for (let t = 0; t < ms; ) t += yield;
  }
  /** Flies to a (possibly moving) point on a slight arc. */
  function* fly(a: Agent, to: () => [number, number]): Script {
    const sx = a.x;
    const sy = a.y;
    const [tx0, ty0] = to();
    const dist = Math.hypot(tx0 - sx, ty0 - sy);
    const dur = reduce ? 0 : clamp(220 + dist * 0.45, 220, 720);
    const bow = (Math.random() - 0.5) * Math.min(120, dist * 0.25);
    for (let t = 0; t < dur; ) {
      t += yield;
      const k = ease(Math.min(1, t / dur));
      const [tx, ty] = to();
      const nx = -(ty - sy) / (dist || 1);
      const ny = (tx - sx) / (dist || 1);
      const arc = Math.sin(Math.PI * k) * bow;
      a.x = sx + (tx - sx) * k + nx * arc;
      a.y = sy + (ty - sy) * k + ny * arc;
    }
    [a.x, a.y] = to();
  }

  /** A box (or media): crosshair drag with a live size badge over a placeholder, then the real thing. */
  function* drawBox(a: Agent, L: SwarmLayer): Script {
    setMode(a, "cross");
    yield* fly(a, () => {
      const r = rectOf(L.el);
      return [r.left, r.top];
    });
    sound.press(pan(a.x));
    const s = selection(L.kind === "media" ? "media" : "box");
    for (let t = 0; t < SWARM_DRAG_MS; ) {
      t += yield;
      const k = easeOut(Math.min(1, t / SWARM_DRAG_MS));
      const r = rectOf(L.el);
      a.sel = r;
      s.set(r.left, r.top, r.width * k, r.height * k);
      a.x = r.left + r.width * k;
      a.y = r.top + r.height * k;
    }
    const r = rectOf(L.el);
    sound.note(r.width * r.height, (r.left + r.width / 2) / innerWidth, pan(a.x));
    status[L.id] = 3;
    if (L.kind === "media") yield* untilLoaded(L.el);
    mark(L, "on");
    fadeIn(L.el, L.kind);
    setMode(a, "arrow");
    yield* trail(s, L);
    finish(L);
  }
  /** Keeps a selection on its element while the fill lands, then lets it go. */
  function* trail(s: ReturnType<typeof selection>, L: SwarmLayer): Script {
    const ms = L.kind === "media" ? SWARM_SWEEP_MS : SWARM_REVEAL_MS;
    s.plain();
    for (let t = 0; t < ms; ) {
      t += yield;
      const r = rectOf(L.el);
      s.set(r.left, r.top, r.width, r.height);
      s.fade(1 - Math.min(1, t / ms));
    }
    s.remove();
  }
  /** An image is shown once it's loaded and decoded (off the main thread), within limits. */
  function* untilLoaded(el: Element): Script {
    if (!(el instanceof HTMLImageElement)) return;
    for (let t = 0; t < 1500 && !(el.complete && el.naturalWidth); ) t += yield;
    let decoded = false;
    el.decode().then(
      () => (decoded = true),
      () => (decoded = true)
    );
    for (let t = 0; t < 400 && !decoded; ) t += yield;
  }

  /** A repeated sibling: select the master, ⌥-drag a copy into place with a red measure. */
  function* duplicate(a: Agent, L: SwarmLayer, M: SwarmLayer): Script {
    setMode(a, "arrow");
    yield* fly(a, () => {
      const r = rectOf(M.el);
      return [r.left + r.width / 2, r.top + r.height / 2];
    });
    sound.press(pan(a.x));
    const src = selection("none");
    const ghost = deco("ghost");
    const measure = deco("measure");
    const dur = SWARM_DRAG_MS * 1.3;
    for (let t = 0; t < dur; ) {
      t += yield;
      const k = ease(Math.min(1, t / dur));
      const m = rectOf(M.el);
      const r = rectOf(L.el);
      src.set(m.left, m.top, m.width, m.height);
      const x = m.left + (r.left - m.left) * k;
      const y = m.top + (r.top - m.top) * k;
      place(ghost, x, y, r.width, r.height);
      a.x = x + r.width / 2;
      a.y = y + r.height / 2;
      a.sel = new DOMRect(x, y, r.width, r.height);
      // The gap to the master, along the axis they're apart on.
      const across = Math.abs(r.left - m.left) > Math.abs(r.top - m.top);
      const gap = across ? x - (m.left + m.width) : y - (m.top + m.height);
      if (across) place(measure, m.left + m.width, y + r.height / 2, Math.max(0, gap), 1);
      else place(measure, x + r.width / 2, m.top + m.height, 1, Math.max(0, gap));
      measure.dataset.gap = `${Math.max(0, Math.round(gap))}`;
    }
    ghost.remove();
    measure.remove();
    src.remove();
    sound.note(rectOf(L.el).width * rectOf(L.el).height, rectOf(L.el).left / innerWidth, pan(a.x));
    mark(L, "on");
    fadeIn(L.el, "box");
    const s = selection("none");
    yield* trail(s, L);
    finish(L);
  }

  /** A text block: drag a text box, maybe snap it to a guide, then type it with an I-beam. */
  function* typeText(a: Agent, L: SwarmLayer): Script {
    const nodes = L.text ?? [];
    const first = nodes[0];
    const start = () => {
      const rr = first ? ranges.get(first) : null;
      const r = rr ? rr.getBoundingClientRect() : rectOf(L.el);
      return [r.left, r.top] as [number, number];
    };
    let guide: HTMLElement | null = null;
    // At most two guides out at once, or the page fills with red.
    if (innerWidth >= SWARM_RULERS_FROM && guides < 2 && textTasks++ % 5 === 2) {
      guides++;
      // A guide dragged out of the ruler, which the text box then snaps to.
      setMode(a, "arrow");
      yield* fly(a, () => [SWARM_RULER / 2, start()[1]]);
      sound.press(pan(a.x));
      guide = deco("guide");
      const gx = start()[0];
      for (let t = 0; t < 300; ) {
        t += yield;
        const k = ease(Math.min(1, t / 300));
        a.x = SWARM_RULER + (gx - SWARM_RULER) * k;
        place(guide, a.x, 0, 1, innerHeight);
      }
    }
    setMode(a, "cross");
    yield* fly(a, start);
    const box = selection("none");
    box.plain();
    for (let t = 0; t < 220; ) {
      t += yield;
      const k = easeOut(Math.min(1, t / 220));
      const r = rectOf(L.el);
      a.sel = r;
      box.set(r.left, r.top, r.width * k, r.height * k);
    }
    setMode(a, "ibeam");
    mark(L, "on");
    const total = L.chars;
    const ms = Math.min(SWARM_TYPE_MAX_MS, (total / SWARM_TYPE_CPS) * 1000);
    let node = 0;
    let base = 0;
    let shown = 0;
    for (let t = 0; t < ms && hasHighlights; ) {
      t += yield;
      const want = Math.min(total, Math.ceil((t / ms) * total));
      // Fully typed nodes leave the mask; the one in progress shows up to the caret.
      while (node < nodes.length && base + nodes[node].length <= want) {
        const r = ranges.get(nodes[node]);
        if (r) highlight?.delete(r);
        base += nodes[node].length;
        node++;
      }
      const n = nodes[Math.min(node, nodes.length - 1)];
      const off = node < nodes.length ? want - base : n.length;
      if (node < nodes.length) ranges.get(n)?.setStart(n, off);
      if (want > shown) sound.key(pan(a.x), n.nodeValue?.[Math.max(0, off - 1)] === " ");
      shown = want;
      masked = true;
      // The I-beam rides the caret.
      const c = document.createRange();
      c.setStart(n, Math.min(n.length, off));
      c.collapse(true);
      const cr = c.getBoundingClientRect();
      if (cr.height) {
        a.x = cr.left + 2;
        a.y = cr.top + cr.height / 2;
      }
      const r = rectOf(L.el);
      a.sel = r;
      box.set(r.left, r.top, r.width, r.height);
    }
    finish(L);
    setMode(a, "arrow");
    yield* trail(box, L);
    if (guide) {
      const g = guide;
      g.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => {
        g.remove();
        guides--;
      };
    }
  }

  /** A single-side border: the pen tool, anchor to anchor. */
  function* penLine(a: Agent, L: SwarmLayer): Script {
    const ends = () => {
      const r = rectOf(L.el);
      switch (L.side) {
        case "bottom":
          return [r.left, r.bottom, r.right, r.bottom];
        case "left":
          return [r.left, r.top, r.left, r.bottom];
        case "right":
          return [r.right, r.top, r.right, r.bottom];
        default:
          return [r.left, r.top, r.right, r.top];
      }
    };
    setMode(a, "cross");
    yield* fly(a, () => [ends()[0], ends()[1]]);
    sound.press(pan(a.x));
    const line = deco("pen");
    for (let t = 0; t < SWARM_DRAG_MS; ) {
      t += yield;
      const k = ease(Math.min(1, t / SWARM_DRAG_MS));
      const [x1, y1, x2, y2] = ends();
      a.x = x1 + (x2 - x1) * k;
      a.y = y1 + (y2 - y1) * k;
      place(line, x1, y1, Math.max(1, a.x - x1), Math.max(1, a.y - y1));
    }
    mark(L, "on");
    fadeIn(L.el, "line", L.side);
    setMode(a, "arrow");
    line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => line.remove();
    finish(L);
  }

  // ── Carrying: the page's own motion — a block rising into place as it
  // scrolls in, a pinned scene's words and pieces — is taken in hand. Its
  // script moves elements through their inline style; while one is moving on
  // screen, an agent grabs it and moves with it, as if bringing it in.
  const moving = new Map<Element, { first: number; last: number }>();
  const carried = new Set<Element>();
  /** Elements that never stop moving (a marquee): not worth an agent, for a while. */
  const restless = new Map<Element, number>();
  const watcher = typeof MutationObserver === "undefined" ? null : new MutationObserver((records) => {
    const now = performance.now();
    for (const r of records) {
      const el = r.target as Element;
      const m = moving.get(el);
      if (m) m.last = now;
      else moving.set(el, { first: now, last: now });
    }
  });
  const shown = (el: Element) => !el.checkVisibility || el.checkVisibility({ visibilityProperty: true });

  function* carry(a: Agent, el: Element): Script {
    carried.add(el);
    setMode(a, "arrow");
    const grab = (): [number, number] => {
      const r = rectOf(el);
      return [r.left + r.width / 2, r.top + Math.min(r.height / 2, 28)];
    };
    const reach = SWARM_CARRY_REACH_MS;
    const sx = a.x;
    const sy = a.y;
    for (let t = 0; t < reach; ) {
      t += yield;
      const k = easeOut(Math.min(1, t / reach));
      const [x, y] = grab();
      a.x = sx + (x - sx) * k;
      a.y = sy + (y - sy) * k;
    }
    sound.press(pan(a.x));
    const s = selection("none");
    s.moving();
    for (let t = 0; t < SWARM_CARRY_MAX_MS; ) {
      t += yield;
      const m = moving.get(el);
      if (!m || performance.now() - m.last > 260 || !el.isConnected) break;
      const r = rectOf(el);
      [a.x, a.y] = grab();
      a.sel = r;
      s.set(r.left, r.top, r.width, r.height);
    }
    s.remove();
    carried.delete(el);
  }

  /** Hands out what's moving on screen to idle agents (more join if needed), a few at a time. */
  const assignCarries = (now: number) => {
    if (now < carryAt || front >= layers.length) return;
    carryAt = now + 80;
    let busy = carried.size;
    const wanted: { el: Element; area: number }[] = [];
    for (const [el, m] of moving) {
      if (now - m.last > 260) {
        moving.delete(el);
        continue;
      }
      if (carried.has(el) || (restless.get(el) ?? 0) > now) continue;
      if (now - m.first > 3000) {
        restless.set(el, now + 10_000);
        continue;
      }
      if (el.closest("[data-swarm-ui]") || !shown(el)) continue;
      const r = rectOf(el);
      if (r.width < 10 || r.height < 10 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      wanted.push({ el, area: r.width * r.height });
    }
    wanted.sort((x, y) => y.area - x.area);
    for (const { el } of wanted) {
      if (busy >= SWARM_MAX_CARRY) break;
      let a = agents.find((g) => !g.script);
      if (!a && agents.length < SWARM_MAX_AGENTS + SWARM_MAX_CARRY) {
        const [x, y] = edgePoint(agents.length);
        a = addAgent(x, y);
      }
      if (!a) break;
      wake(a);
      a.script = carry(a, el);
      busy++;
    }
  };

  const scriptFor = (a: Agent, L: SwarmLayer): Script => {
    if (L.master !== undefined && status[L.master] === 2 && L.kind === "box") return duplicate(a, L, layers[L.master]);
    if (L.kind === "text") return typeText(a, L);
    if (L.kind === "line") return penLine(a, L);
    return drawBox(a, L);
  };

  // ── Choosing work: the first layer in reading order that's on screen and
  // whose box (and master) is down. Ones scrolled past, or off to the side,
  // are put in place at once — no one would see them drawn.
  const ready = (L: SwarmLayer) =>
    status[L.id] === 0 &&
    (L.parent < 0 || status[L.parent] >= 2) &&
    (L.master === undefined || status[L.master] === 2);
  const pick = (): SwarmLayer | null => {
    while (front < layers.length && status[front] === 2) front++;
    const top = innerHeight * SWARM_VIEW_TOP;
    const bottom = innerHeight * SWARM_VIEW_BOTTOM;
    const until = performance.now() + 3;
    for (let i = front; i < layers.length; i++) {
      const L = layers[i];
      if (!ready(L)) continue;
      const r = rectOf(L.el);
      if (!r.width || !r.height || r.right < 0 || r.left > innerWidth || r.bottom < top) {
        finish(L);
        continue;
      }
      if (r.top <= bottom) {
        status[i] = 1;
        return L;
      }
      if (performance.now() > until) break;
    }
    return null;
  };

  // ── Tour: scroll on as the front of the build settles, as fast as it keeps
  // up. Only work that can go ahead holds it back (in hand, or ready on screen).
  const tourStep = (dt: number) => {
    if (!tour || phase !== "build") return;
    while (front < layers.length && status[front] === 2) front++;
    const max = html.scrollHeight - innerHeight;
    if (scrollY >= max - 1) return;
    let lead = Infinity;
    for (let i = front, n = 0; i < layers.length && n < 60; i++) {
      const st = status[i];
      if (st === 2 || (st === 0 && !ready(layers[i]))) continue;
      n++;
      const r = rectOf(layers[i].el);
      if (r.width && r.height && r.bottom > 0) lead = Math.min(lead, r.top);
    }
    // Nothing left on screen (a pinned scene's runway): glide through faster.
    const ahead = Math.min(lead, innerHeight) - innerHeight * SWARM_TOUR_FRONT;
    if (ahead <= 0) return;
    const v = (lead > innerHeight ? SWARM_TOUR_EMPTY : Math.min(SWARM_TOUR_MAX, 80 + ahead * 2.2)) * speed * pace * local();
    window.scrollBy(0, (v * dt) / 1000);
  };

  /** Should the build stall (nothing in hand, nothing ready for a while), what's in view is put in place. */
  const unstick = (now: number) => {
    if (built !== lastBuilt || agents.some((a) => a.script)) {
      lastBuilt = built;
      stuckSince = now;
      return;
    }
    if (now - stuckSince < 3000) return;
    stuckSince = now;
    const atEnd = scrollY >= html.scrollHeight - innerHeight - 1;
    for (let i = front; i < layers.length; i++) {
      if (status[i] === 2) continue;
      if (atEnd || rectOf(layers[i].el).top < innerHeight * SWARM_VIEW_BOTTOM) finish(layers[i]);
    }
  };
  const userScroll = (e: Event) => {
    if (e.type === "keydown" && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes((e as KeyboardEvent).key)) return;
    if (tour) {
      tour = false;
      emit(true);
    }
  };

  // ── Rulers, along the top and left, with the work in hand marked on them.
  const drawRulers = () => {
    const show = innerWidth >= SWARM_RULERS_FROM && (phase === "build" || phase === "done");
    for (const c of [o.rulerTop, o.rulerLeft]) c.style.opacity = show ? "1" : "0";
    if (!show) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const top = o.rulerTop;
    const left = o.rulerLeft;
    const W = innerWidth;
    const H = innerHeight;
    if (top.width !== Math.round(W * dpr)) {
      top.width = Math.round(W * dpr);
      top.height = SWARM_RULER * dpr;
      left.width = SWARM_RULER * dpr;
      left.height = Math.round(H * dpr);
    }
    const draw = (c: HTMLCanvasElement, horizontal: boolean) => {
      const g = c.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const len = horizontal ? W : H;
      g.fillStyle = "#141418";
      g.fillRect(0, 0, horizontal ? W : SWARM_RULER, horizontal ? SWARM_RULER : H);
      g.fillStyle = "rgba(13,153,255,0.28)";
      for (const a of agents) {
        if (!a.sel) continue;
        const s = a.sel;
        if (horizontal) g.fillRect(s.left, 0, s.width, SWARM_RULER);
        else g.fillRect(0, s.top, SWARM_RULER, s.height);
      }
      g.strokeStyle = "rgba(255,255,255,0.22)";
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
      g.lineWidth = 1;
      const offset = horizontal ? 0 : scrollY;
      const first = Math.floor(offset / 10) * 10;
      g.beginPath();
      for (let v = first; v - offset < len; v += 10) {
        const p = Math.round(v - offset) + 0.5;
        if (p < SWARM_RULER) continue;
        const size = v % 100 === 0 ? SWARM_RULER : v % 50 === 0 ? 7 : 4;
        if (horizontal) {
          g.moveTo(p, SWARM_RULER);
          g.lineTo(p, SWARM_RULER - size);
        } else {
          g.moveTo(SWARM_RULER, p);
          g.lineTo(SWARM_RULER - size, p);
        }
        if (v % 100 === 0) {
          if (horizontal) g.fillText(String(v), p + 3, 9);
          else {
            g.save();
            g.translate(9, p + 3);
            g.rotate(-Math.PI / 2);
            g.fillText(String(v), -g.measureText(String(v)).width, 0);
            g.restore();
          }
        }
      }
      g.stroke();
      g.fillStyle = "rgba(255,255,255,0.12)";
      if (horizontal) g.fillRect(0, SWARM_RULER - 1, W, 1);
      else g.fillRect(SWARM_RULER - 1, 0, 1, H);
    };
    draw(top, true);
    draw(left, false);
  };

  // ── Motion outside tasks: the orbit, the fan-out and the finale's flock.
  const orbit = (now: number, dt: number) => {
    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    const s = dt / 1000;
    agents.forEach((a, i) => {
      // Two flocks circling the mark, half a turn apart, each a loose clump.
      const ang = (now - phaseAt) / 900 + a.flock * Math.PI + (a.slot % 7) * 0.11;
      // A wide ellipse, so the flocks circle the mark and its name, not cross them.
      const wide = Math.min(1, innerWidth / 900);
      const rad = 1 + Math.sin(now / 700 + i) * 0.08;
      const tx = cx + Math.cos(ang) * 250 * wide * rad + Math.sin(i * 7.3) * 26;
      const ty = cy + Math.sin(ang) * 135 * rad + Math.cos(i * 3.1) * 22;
      a.vx += ((tx - a.x) * 9 - a.vx * 4.2) * s;
      a.vy += ((ty - a.y) * 9 - a.vy * 4.2) * s;
      a.x += a.vx * s;
      a.y += a.vy * s;
    });
  };
  const flock = (dt: number) => {
    const s = dt / 1000;
    agents.forEach((a, i) => {
      // Toward the pointer, kept apart from each other in a loose ring.
      const ring = 40 + (i % 5) * 16;
      const ang = i * 2.4 + performance.now() / 1600;
      let ax = (mouse.x + Math.cos(ang) * ring - a.x) * 6 - a.vx * 3.6;
      let ay = (mouse.y + Math.sin(ang) * ring - a.y) * 6 - a.vy * 3.6;
      for (const b of agents) {
        if (b === a) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 900 && d2 > 0.01) {
          ax += (dx / d2) * 2400;
          ay += (dy / d2) * 2400;
        }
      }
      a.vx += ax * s;
      a.vy += ay * s;
      a.x += a.vx * s;
      a.y += a.vy * s;
    });
  };

  // ── Home: in the finale, a pointer left still for a moment gets a little
  // house beside it, and the cursors file in through its door one by one;
  // move again and they spill back out to the pointer.
  /** 0 out (flocking), 1 heading in, 2 all inside. */
  let homeState = 0;
  let home = { x: 0, y: 0 };
  /** The doorway, in the house drawing (see SwarmBuild): just right of its centre, at the foot. */
  const door = () => ({ x: home.x + 6, y: home.y + 3 });
  const goHome = (now: number) => {
    homeState = 1;
    home = {
      x: clamp(mouse.x + 46, 30, innerWidth - 30),
      y: clamp(mouse.y + 6, 40, innerHeight - 90),
    };
    o.house.style.transform = `translate3d(${home.x}px,${home.y}px,0)`;
    o.house.classList.remove("leave");
    o.house.classList.add("show");
    // Nearest first, so they queue in a line rather than a crowd.
    const order = agents
      .map((a, i) => ({ i, d: Math.hypot(a.x - home.x, a.y - home.y) }))
      .sort((p, q) => p.d - q.d);
    order.forEach(({ i }, k) => (agents[i].homeAt = now + 260 + k * 70));
  };
  const leaveHome = () => {
    homeState = 0;
    resting = false;
    o.house.classList.add("leave");
    sound.arpeggio();
    knock();
    const d = door();
    agents.forEach((a, k) => {
      // Those inside come out of the door; the rest turn back from where they are.
      if (a.inside || a.enterAt !== undefined) {
        a.x = d.x;
        a.y = d.y;
        a.popAt = performance.now() + k * 22;
      } else {
        a.el.style.opacity = "";
        a.el.style.scale = "";
      }
      a.enterAt = undefined;
      // Out through the door in a burst, each its own way.
      const ang = -Math.PI / 2 + ((k / agents.length) - 0.5) * Math.PI * 1.6;
      const v = 380 + (k % 4) * 90;
      a.vx = Math.cos(ang) * v;
      a.vy = Math.sin(ang) * v;
      a.inside = false;
      a.goingHome = false;
      a.homeAt = 0;
    });
  };

  // ── Resting: during the build, an agent with nothing to do for a moment
  // walks to the house in the corner and goes in; given work, it comes back
  // out of the door and flies off to it.
  /** Through the door: close enough, it slides in, shrinking and fading; true once inside. */
  const stepIn = (a: Agent, now: number, d: { x: number; y: number }, force = false) => {
    if (a.inside) return true;
    if (a.enterAt === undefined) {
      if (!force && Math.hypot(a.x - d.x, a.y - d.y) > SWARM_DOOR_REACH) return false;
      a.enterAt = now;
      a.ex = a.x;
      a.ey = a.y;
      a.popAt = undefined;
      knock();
    }
    const k = clamp((now - a.enterAt) / SWARM_ENTER_MS, 0, 1);
    const glide = easeOut(k);
    const shrink = k * k;
    a.x = (a.ex ?? d.x) + (d.x - (a.ex ?? d.x)) * glide;
    a.y = (a.ey ?? d.y) + (d.y - (a.ey ?? d.y)) * glide;
    a.el.style.scale = String(1 - 0.85 * shrink);
    a.el.style.opacity = String(clamp(1 - (k - 0.35) / 0.65, 0, 1));
    if (k < 1) return false;
    a.inside = true;
    a.enterAt = undefined;
    a.el.style.opacity = "0";
    return true;
  };
  /** Out of the door: it appears small and grows to size as it goes. */
  const popOut = (now: number) => {
    for (const a of agents) {
      if (a.popAt === undefined) continue;
      const k = clamp((now - a.popAt) / SWARM_EXIT_MS, 0, 1);
      // A touch past full size before settling.
      const grow = 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2;
      a.el.style.scale = String(0.2 + 0.8 * grow);
      a.el.style.opacity = String(Math.min(1, k * 3));
      if (k >= 1) {
        a.popAt = undefined;
        a.el.style.scale = "";
        a.el.style.opacity = "";
      }
    }
  };
  /** The door swings and the house gives a little bounce: someone's come or gone. */
  const knock = () => {
    const now = performance.now();
    if (now - knockedAt < 110) return;
    knockedAt = now;
    o.house.classList.remove("knock");
    void o.house.offsetWidth;
    o.house.classList.add("knock");
  };
  let knockedAt = 0;

  const restSpot = () => ({ x: 62, y: innerHeight - (innerWidth < 640 ? 118 : 62) });
  let resting = false;
  const showRestHouse = () => {
    if (resting) return;
    resting = true;
    home = restSpot();
    o.house.style.transform = `translate3d(${home.x}px,${home.y}px,0)`;
    o.house.classList.remove("leave", "lit");
    o.house.classList.add("show");
  };
  /** Back out of the door, ready for work. */
  const wake = (a: Agent) => {
    if (!a.inside && !a.goingHome) return;
    if (a.inside || a.enterAt !== undefined) {
      const d = door();
      a.x = d.x;
      a.y = d.y;
      a.popAt = performance.now();
      knock();
    } else {
      a.el.style.opacity = "";
      a.el.style.scale = "";
    }
    a.inside = false;
    a.goingHome = false;
    a.enterAt = undefined;
  };
  const restHome = (now: number, dt: number) => {
    const s = dt / 1000;
    let home_ = 0;
    let inside = 0;
    for (const a of agents) {
      if (a.script) continue;
      if (!a.goingHome && !a.inside) {
        if (now - (a.idleSince ?? now) < SWARM_REST_MS) continue;
        showRestHouse();
        a.goingHome = true;
        a.vx = 0;
        a.vy = 0;
      }
      home_++;
      if (a.inside) {
        inside++;
        continue;
      }
      const d = door();
      if (a.enterAt === undefined) {
        a.vx += ((d.x - a.x) * 10 - a.vx * 4.8) * s;
        a.vy += ((d.y - a.y) * 10 - a.vy * 4.8) * s;
        a.x += a.vx * s;
        a.y += a.vy * s;
      }
      if (stepIn(a, now, d)) {
        a.goingHome = false;
        inside++;
      }
    }
    if (!resting) return;
    o.house.classList.toggle("lit", inside > 0);
    // Everyone's out at work: the house sinks away until it's needed again.
    if (!home_) {
      resting = false;
      o.house.classList.add("leave");
    }
  };

  const towardHome = (now: number, dt: number) => {
    const s = dt / 1000;
    const d = door();
    let inside = 0;
    for (const a of agents) {
      if (a.inside) {
        inside++;
        continue;
      }
      if (a.enterAt !== undefined) {
        // Already stepping through the door.
      } else if (now < (a.homeAt ?? 0)) {
        // Waiting its turn: drift toward the door, slowly.
        a.vx += ((d.x - 30 - a.x) * 1.4 - a.vx * 2.6) * s;
        a.vy += ((d.y - a.y) * 1.4 - a.vy * 2.6) * s;
      } else {
        a.vx += ((d.x - a.x) * 14 - a.vx * 5.5) * s;
        a.vy += ((d.y - a.y) * 14 - a.vy * 5.5) * s;
      }
      if (a.enterAt === undefined) {
        a.x += a.vx * s;
        a.y += a.vy * s;
      }
      // In at the door, once its turn has come (or, should it dawdle, a little after).
      if (now >= (a.homeAt ?? 0) && (stepIn(a, now, d) || (now > (a.homeAt ?? 0) + 1400 && stepIn(a, now, d, true)))) {
        inside++;
        sound.key(pan(a.x), false);
      }
    }
    if (inside === agents.length && homeState === 1) {
      homeState = 2;
      o.house.classList.add("lit");
    }
  };

  const render = () => {
    for (const a of agents) a.el.style.transform = `translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`;
  };

  /** The splash plays from the top: squares drawn, then the name typed. */
  const playSplash = () => {
    o.logo.classList.remove("play");
    void o.logo.offsetWidth;
    o.logo.classList.add("play");
    o.logo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards" });
  };

  const enter = (p: SwarmPhase) => {
    phase = p;
    phaseAt = performance.now();
    if (p === "build") watcher?.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["style"] });
    else {
      watcher?.disconnect();
      moving.clear();
    }
    emit(true);
  };

  /** Deadlines for the page just begun: the time left, less the turns still to come, shared out. */
  const startPage = (now: number) => {
    pageStart = now;
    plotTime();
    const turns = o.pages - 1 - page;
    const left = Math.max(1000, endAt - now - turns * SWARM_TURN_MS);
    pageEnd = now + (turns > 0 ? left * SWARM_FIRST_SHARE : left);
  };
  /** The page's time plan: blocks top to bottom, as (share of the page, share of the time). */
  let plan: { at: number; to: number; t0: number; t1: number }[] = [];
  const plotTime = () => {
    const blocks = o.roots(page).flatMap((r) => (r.tagName === "MAIN" ? [...r.children] : [r]));
    const height = Math.max(1, html.scrollHeight);
    let weight = 0;
    const rows = blocks
      .map((el, i) => {
        const r = rectOf(el);
        const top = r.top + scrollY;
        return { at: top / height, to: (top + r.height) / height, w: (r.height / height) * o.weigh(el, i, page) };
      })
      .filter((b) => b.to > b.at);
    for (const b of rows) weight += b.w;
    let t = 0;
    plan = rows.map((b) => {
      const t0 = t;
      t += b.w / (weight || 1);
      return { at: b.at, to: b.to, t0, t1: t };
    });
  };
  /** The block in view's own pace: quicker through the light ones, slower through the heavy. */
  const local = () => {
    const y = (scrollY + innerHeight * 0.5) / Math.max(1, html.scrollHeight);
    const b = plan.find((p) => y >= p.at && y < p.to);
    if (!b) return 1;
    const share = (b.t1 - b.t0) / Math.max(1e-6, b.to - b.at);
    return clamp(1 / share, 0.35, 3);
  };
  /** Progress (share of the page) that a share of the time should have reached. */
  const along = (f: number) => {
    for (const b of plan) if (f <= b.t1) return b.at + (b.to - b.at) * ((f - b.t0) / Math.max(1e-6, b.t1 - b.t0));
    return f;
  };
  /** Keeps the page to its deadline: progress (layers in, and how far the tour has scrolled) against time spent. */
  const steer = (now: number, real: number) => {
    const span = pageEnd - pageStart;
    if (span <= 0 || !layers.length) return;
    const f = clamp((now - pageStart) / span, 0, 1);
    const max = html.scrollHeight - innerHeight;
    const p = 0.5 * (built / layers.length) + 0.5 * (max > 0 ? clamp(scrollY / max, 0, 1) : 1);
    // Where it should be by now: the page's stretches each take their weighted share of the time.
    const want = along(f);
    pace = clamp(pace * Math.exp((want - p) * 3.2 * (real / 1000)), SWARM_PACE_MIN, SWARM_PACE_MAX);
    // Out of time: what's left goes in at once.
    if (now > pageEnd - 250) wrapUp();
  };
  /** Everything still to come is put in place, the work in hand let go. */
  const wrapUp = () => {
    for (const a of agents) {
      a.script = null;
      a.sel = null;
    }
    o.stage.querySelectorAll(".sel,.ghost,.measure,.guide,.pen").forEach((d) => d.remove());
    guides = 0;
    carried.clear();
    for (const L of layers) finish(L);
    front = layers.length;
  };
  /** On to the next page: cover, move there, read it, uncover, build. */
  let turning = false;
  const turnPage = async () => {
    if (turning) return;
    turning = true;
    enter("turn");
    await o.cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 0 : SWARM_TURN_MS * 0.35, fill: "forwards" }).finished;
    if (stopped) return;
    page++;
    await o.turn(page);
    if (stopped) return;
    scrollTo({ top: 0, behavior: "instant" });
    await prepare();
    if (stopped) return;
    await o.cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 0 : SWARM_TURN_MS * 0.35, fill: "forwards" }).finished;
    if (stopped) return;
    turning = false;
    startPage(performance.now());
    enter("build");
  };

  const tick = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(tick);
    const real = Math.min(50, now - last || 16);
    last = now;
    const dt = real * speed * (phase === "build" ? pace * local() : 1);

    if (phase === "orbit") {
      orbit(now, real);
      if (now - phaseAt > (reduce ? 0 : SWARM_ORBIT_MS)) {
        // Fan out across the page and get to work, each page given its share of the time left.
        startPage(now);
        enter("build");
        o.logo.animate([{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(6px)" }], { duration: 420, fill: "forwards" });
        sound.arpeggio();
        for (const a of agents) {
          const tx = SWARM_RULER + Math.random() * (innerWidth - SWARM_RULER * 2);
          const ty = SWARM_RULER + Math.random() * (innerHeight - SWARM_RULER * 2);
          a.script = (function* (): Script {
            const sx = a.x;
            const sy = a.y;
            for (let t = 0; t < SWARM_FAN_MS; ) {
              t += yield;
              const k = easeOut(Math.min(1, t / SWARM_FAN_MS));
              a.x = sx + (tx - sx) * k;
              a.y = sy + (ty - sy) * k;
            }
          })();
        }
      }
    } else if (phase === "build") {
      assignCarries(now);
      // One fruitless look for work holds the rest off for a moment: they'd find nothing either.
      let looking = now >= idleUntil;
      for (const a of agents) {
        if (!a.script) {
          const L = looking ? pick() : null;
          if (!L) {
            if (looking) idleUntil = now + 100;
            looking = false;
            a.sel = null;
            continue;
          }
          wake(a);
          a.script = scriptFor(a, L);
        }
        if (a.script.next(dt).done) {
          a.script = null;
          a.sel = null;
          a.idleSince = now;
        }
      }
      restHome(now, real);
      // More hands while there's a backlog on screen.
      const idle = agents.filter((a) => !a.script).length;
      if (!idle && agents.length < SWARM_MAX_AGENTS && now - phaseAt > 1200 && Math.random() < real / 600) {
        const [x, y] = edgePoint(agents.length);
        addAgent(x, y);
      }
      tourStep(real);
      unstick(now);
      steer(now, real);
      while (front < layers.length && status[front] === 2) front++;
      if (front >= layers.length && agents.every((a) => !a.script) && page + 1 < o.pages) {
        void turnPage();
      } else if (front >= layers.length && agents.every((a) => !a.script) && now >= endAt - 300) {
        // Done — and not before its time: ahead of it, the cursors rest in the house till then.
        // Every layer is in; the hide-all rule stays until Go live, where its
        // lifting (a whole-page restyle) hides under the overlay's fade.
        enter("done");
        // Out of the house for the finale: they flock to the pointer.
        if (agents.some((a) => a.inside || a.goingHome)) leaveHome();
        sound.chord();
      }
    } else if (phase === "done") {
      const still = now - mouseAt > SWARM_HOME_IDLE_MS && now - phaseAt > 1500;
      if (still && homeState === 0) goHome(now);
      else if (!still && homeState !== 0) leaveHome();
      if (homeState === 0) flock(real);
      else towardHome(now, real);
    }
    popOut(now);
    if (masked && highlight) CSS.highlights.set(HIDDEN, highlight);
    masked = false;
    render();
    drawRulers();
    emit();
  };

  // ── Lifecycle.
  /** Reads the page a slice a frame (so the scan bar keeps moving), then hides it all. */
  const prepare = async () => {
    const clock = { until: 0 };
    const walk = snapshot(o.roots(page), o.skip, clock);
    for (;;) {
      clock.until = performance.now() + 10;
      const step = walk.next();
      if (step.done) {
        layers = step.value;
        break;
      }
      await new Promise(requestAnimationFrame);
      if (stopped) return;
    }
    status = new Uint8Array(layers.length);
    front = 0;
    built = 0;
    textTasks = 0;
    ranges = new Map();
    for (const L of layers) {
      mark(L, "wait");
      for (const t of L.text ?? []) {
        const r = document.createRange();
        r.selectNodeContents(t);
        ranges.set(t, r);
      }
    }
    if (hasHighlights) {
      highlight = new Highlight(...ranges.values());
      CSS.highlights.set(HIDDEN, highlight);
    }
    html.classList.add("swarm-on");
  };
  const onMouse = (e: PointerEvent) => {
    mouse = { x: e.clientX, y: e.clientY };
    mouseAt = performance.now();
  };
  const listen = (on: boolean) => {
    for (const t of ["wheel", "touchmove", "keydown"]) {
      if (on) window.addEventListener(t, userScroll, { passive: true });
      else window.removeEventListener(t, userScroll);
    }
    if (on) window.addEventListener("pointermove", onMouse, { passive: true });
    else window.removeEventListener("pointermove", onMouse);
  };

  const begin = async () => {
    const cover = o.cover;
    cover.style.background = getComputedStyle(document.body).backgroundColor || "#0a0a0b";
    await cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 0 : SWARM_FADE_MS, fill: "forwards" }).finished;
    if (stopped) return;
    // The page's swarm styles go in under the cover: adding them restyles the
    // whole page, a long frame no one should see.
    document.head.append(style);
    html.classList.add("swarm-run");
    // The audio device opens here too (it can hold the main thread a few hundred ms).
    sound.swell();
    scrollTo({ top: 0, behavior: "instant" });
    await prepare();
    if (stopped) return;
    playSplash();
    for (let i = 0; i < SWARM_AGENTS; i++) {
      const [x, y] = edgePoint(i);
      addAgent(x, y);
    }
    await cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 0 : 250, fill: "forwards" }).finished;
    if (stopped) return;
    enter("orbit");
  };

  return {
    start() {
      endAt = (o.startedAt || performance.now()) + o.duration;
      listen(true);
      enter("scan");
      last = performance.now();
      raf = requestAnimationFrame(tick);
      void begin();
    },
    setSpeed(v: number) {
      // The time left shrinks (or grows) with the speed.
      const now = performance.now();
      const k = speed / v;
      endAt = now + (endAt - now) * k;
      if (phase === "build") pageEnd = now + (pageEnd - now) * k;
      speed = v;
      emit(true);
    },
    setTour(v: boolean) {
      tour = v;
      emit(true);
    },
    setSound(v: boolean) {
      sound.on = v;
      emit(true);
    },
    /** Builds it all again, from the top: the page fades out, is read again, and the swarm regroups. */
    async replay() {
      for (const a of agents) {
        a.script = null;
        a.sel = null;
      }
      o.stage.querySelectorAll(".sel,.ghost,.measure,.guide,.pen").forEach((d) => d.remove());
      guides = 0;
      if (homeState !== 0) leaveHome();
      o.house.classList.remove("show", "lit", "leave");
      enter("scan");
      tour = true;
      await o.cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 0 : 400, fill: "forwards" }).finished;
      if (stopped) return;
      // From the first page again, with the full time.
      if (page !== 0) {
        page = 0;
        await o.turn(0);
        if (stopped) return;
      }
      endAt = performance.now() + o.duration;
      pace = SWARM_PACE_START;
      scrollTo({ top: 0, behavior: "instant" });
      await prepare();
      if (stopped) return;
      playSplash();
      await o.cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 0 : 400, fill: "forwards" }).finished;
      if (!stopped) enter("orbit");
    },
    /** Puts the page back as it was: every layer shown, nothing of the swarm left. */
    destroy() {
      stopped = true;
      watcher?.disconnect();
      cancelAnimationFrame(raf);
      listen(false);
      html.classList.remove("swarm-on", "swarm-run");
      document.querySelectorAll("[data-swarm]").forEach((el) => el.removeAttribute("data-swarm"));
      if (hasHighlights) CSS.highlights.delete(HIDDEN);
      style.remove();
      sound.close();
    },
    colors: () => agents.slice(0, 5).map((a) => a.color),
  };
}

export type Swarm = ReturnType<typeof createSwarm>;
