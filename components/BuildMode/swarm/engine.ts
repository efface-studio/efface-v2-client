import { createSound } from "./sound";
import { snapshot } from "./snapshot";
import {
  SWARM_AGENTS,
  SWARM_COLORS,
  SWARM_DRAG_MS,
  SWARM_FADE_MS,
  SWARM_FAN_MS,
  SWARM_MAX_AGENTS,
  SWARM_ORBIT_MS,
  SWARM_REVEAL_MS,
  SWARM_RULER,
  SWARM_RULERS_FROM,
  SWARM_SWEEP_MS,
  SWARM_TOUR_FRONT,
  SWARM_TOUR_EMPTY,
  SWARM_TOUR_MAX,
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
}

export interface SwarmOptions {
  /** The overlay's layers, inside its shadow root. */
  stage: HTMLElement;
  cover: HTMLElement;
  logo: HTMLElement;
  rulerTop: HTMLCanvasElement;
  rulerLeft: HTMLCanvasElement;
  /** The page's blocks to rebuild, top to bottom. */
  roots: () => Element[];
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
  let tour = true;
  let raf = 0;
  let last = 0;
  let emitted = 0;
  let textTasks = 0;
  let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let stopped = false;
  let lastBuilt = 0;
  let idleUntil = 0;
  let guides = 0;
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
  function* untilLoaded(el: Element): Script {
    if (!(el instanceof HTMLImageElement)) return;
    for (let t = 0; t < 1500 && !(el.complete && el.naturalWidth); ) t += yield;
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
    const v = (lead > innerHeight ? SWARM_TOUR_EMPTY : Math.min(SWARM_TOUR_MAX, 80 + ahead * 2.2)) * speed;
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
      const rad = 150 + Math.sin(now / 700 + i) * 18;
      const tx = cx + Math.cos(ang) * rad + Math.sin(i * 7.3) * 26;
      const ty = cy + Math.sin(ang) * rad * 0.82 + Math.cos(i * 3.1) * 22;
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

  const render = () => {
    for (const a of agents) a.el.style.transform = `translate3d(${a.x.toFixed(1)}px,${a.y.toFixed(1)}px,0)`;
  };

  const enter = (p: SwarmPhase) => {
    phase = p;
    phaseAt = performance.now();
    emit(true);
  };

  const tick = (now: number) => {
    if (stopped) return;
    raf = requestAnimationFrame(tick);
    const real = Math.min(50, now - last || 16);
    last = now;
    const dt = real * speed;

    if (phase === "orbit") {
      orbit(now, real);
      if (now - phaseAt > (reduce ? 0 : SWARM_ORBIT_MS)) {
        // Fan out across the page and get to work.
        enter("build");
        o.logo.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.8)" }], { duration: 400, fill: "forwards" });
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
          a.script = scriptFor(a, L);
        }
        if (a.script.next(dt).done) {
          a.script = null;
          a.sel = null;
        }
      }
      // More hands while there's a backlog on screen.
      const idle = agents.filter((a) => !a.script).length;
      if (!idle && agents.length < SWARM_MAX_AGENTS && now - phaseAt > 1200 && Math.random() < real / 600) {
        const [x, y] = edgePoint(agents.length);
        addAgent(x, y);
      }
      tourStep(real);
      unstick(now);
      while (front < layers.length && status[front] === 2) front++;
      if (front >= layers.length && agents.every((a) => !a.script)) {
        // Every layer is in; the hide-all rule stays until Go live, where its
        // lifting (a whole-page restyle) hides under the overlay's fade.
        enter("done");
        sound.chord();
      }
    } else if (phase === "done") {
      flock(real);
    }
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
    const walk = snapshot(o.roots(), o.skip, clock);
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
      if (L.el instanceof HTMLImageElement && L.el.loading === "lazy") L.el.loading = "eager";
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
    o.logo.animate([{ opacity: 0, transform: "scale(.8)" }, { opacity: 1, transform: "scale(1)" }], { duration: 400, fill: "forwards" });
    for (let i = 0; i < SWARM_AGENTS; i++) {
      const [x, y] = edgePoint(i);
      addAgent(x, y);
    }
    await cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 0 : 400, fill: "forwards" }).finished;
    if (stopped) return;
    enter("orbit");
  };

  return {
    start() {
      listen(true);
      enter("scan");
      last = performance.now();
      raf = requestAnimationFrame(tick);
      void begin();
    },
    setSpeed(v: number) {
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
      enter("scan");
      tour = true;
      await o.cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? 0 : 400, fill: "forwards" }).finished;
      if (stopped) return;
      scrollTo({ top: 0, behavior: "instant" });
      await prepare();
      if (stopped) return;
      o.logo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "forwards" });
      await o.cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reduce ? 0 : 400, fill: "forwards" }).finished;
      if (!stopped) enter("orbit");
    },
    /** Puts the page back as it was: every layer shown, nothing of the swarm left. */
    destroy() {
      stopped = true;
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
