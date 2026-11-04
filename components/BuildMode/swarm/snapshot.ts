import { SWARM_MAX_LAYERS, SWARM_MIN_BOX } from "./swarm.constants";
import type { SwarmLayer } from "./swarm.types";

const MEDIA = new Set(["IMG", "SVG", "CANVAS", "VIDEO", "IFRAME"]);
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META", "BR"]);

const visibleColor = (c: string) => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return c !== "transparent";
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  return parts.length < 4 || parseFloat(parts[3]) > 0.02;
};

/** Which sides of a box carry a visible border. */
const borderSides = (cs: CSSStyleDeclaration) =>
  (["top", "right", "bottom", "left"] as const).filter(
    (s) =>
      parseFloat(cs.getPropertyValue(`border-${s}-width`)) > 0 &&
      cs.getPropertyValue(`border-${s}-style`) !== "none" &&
      visibleColor(cs.getPropertyValue(`border-${s}-color`))
  );

/** Text nodes worth typing: anything but whitespace. */
const hasText = (n: Node) => n.nodeType === Node.TEXT_NODE && !!n.nodeValue?.trim();

/**
 * Reads the live page into the layers the swarm rebuilds, in document order:
 * painted boxes, single-side borders (pen-tool lines), media, and text blocks
 * (a block whose content is all inline is typed in one go). Each layer waits
 * on the nearest painted box around it, and repeated sibling boxes (cards,
 * list rows) are marked duplicates of the first, to be ⌥-dragged off it.
 */
export function* snapshot(
  roots: Element[],
  skip: (el: Element) => boolean,
  /** The walk pauses (yields) once the clock passes this, and picks up next frame. */
  clock: { until: number }
): Generator<void, SwarmLayer[], void> {
  const layers: SwarmLayer[] = [];
  const styles = new Map<Element, CSSStyleDeclaration>();
  const style = (el: Element) => {
    let cs = styles.get(el);
    if (!cs) styles.set(el, (cs = getComputedStyle(el)));
    return cs;
  };

  // Whether an element's whole content is inline (so it reads as one text block).
  const inlineOnly = new Map<Element, boolean>();
  const allInline = (el: Element): boolean => {
    const known = inlineOnly.get(el);
    if (known !== undefined) return known;
    let ok = true;
    for (const c of el.children) {
      if (SKIP.has(c.tagName)) continue;
      const d = style(c).display;
      if (d === "none") continue;
      if (!d.startsWith("inline") && d !== "contents") ok = false;
      else if (!MEDIA.has(c.tagName.toUpperCase()) && !allInline(c)) ok = false;
      if (!ok) break;
    }
    inlineOnly.set(el, ok);
    return ok;
  };

  const textIn = (el: Element, deep: boolean): Text[] => {
    const out: Text[] = [];
    if (!deep) {
      for (const n of el.childNodes) if (hasText(n)) out.push(n as Text);
      return out;
    }
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (!hasText(n)) continue;
      const p = n.parentElement;
      if (p && (p.closest("svg") || style(p).display === "none")) continue;
      out.push(n as Text);
    }
    return out;
  };

  const add = (layer: Omit<SwarmLayer, "id">) => {
    if (layers.length >= SWARM_MAX_LAYERS) return -1;
    layers.push({ ...layer, id: layers.length });
    return layers.length - 1;
  };

  function* visit(el: Element, parent: number): Generator<void, void, void> {
    if (SKIP.has(el.tagName) || skip(el)) return;
    if (performance.now() > clock.until) yield;
    const cs = style(el);
    if (cs.display === "none" || (el.tagName === "DIALOG" && !(el as HTMLDialogElement).open)) return;
    const r = el.getBoundingClientRect();
    const sized = r.width >= SWARM_MIN_BOX && r.height >= SWARM_MIN_BOX;
    const tag = el.tagName.toUpperCase();

    if (MEDIA.has(tag)) {
      if (sized) add({ kind: "media", el, parent, chars: 0 });
      return;
    }

    let box = parent;
    let full = false;
    const sides = borderSides(cs);
    const filled =
      visibleColor(cs.backgroundColor) ||
      cs.backgroundImage !== "none" ||
      cs.boxShadow !== "none" ||
      (cs.backdropFilter ?? "none") !== "none";
    if (sized && (filled || sides.length >= 2)) {
      const id = add({ kind: "box", el, parent, chars: 0 });
      if (id === -1) full = true;
      else box = id;
    } else if (sides.length === 1 && (r.width > 24 || r.height > 24)) add({ kind: "line", el, parent, side: sides[0], chars: 0 });
    if (full) return;

    // A text block: everything in it is inline, so it's typed as one.
    if (allInline(el)) {
      const nodes = textIn(el, true);
      if (nodes.length) {
        add({ kind: "text", el, parent: box, text: nodes, chars: nodes.reduce((n, t) => n + t.length, 0) });
        return;
      }
    } else {
      // Loose text beside blocks (a label in a flex row) is typed on its own.
      const nodes = textIn(el, false);
      if (nodes.length) add({ kind: "text", el, parent: box, text: nodes, chars: nodes.reduce((n, t) => n + t.length, 0) });
    }
    for (const c of [...el.children]) yield* visit(c, box);
  }
  for (const root of roots) yield* visit(root, -1);

  // Repeated sibling boxes — same tag, classes and size — copy the first.
  const groups = new Map<string, SwarmLayer[]>();
  for (const l of layers) {
    if (l.kind !== "box" || !l.el.parentElement) continue;
    const r = l.el.getBoundingClientRect();
    const key = `${l.parent}|${l.el.tagName}|${l.el.getAttribute("class") ?? ""}|${Math.round(r.width / 8)}|${Math.round(r.height / 8)}`;
    const g = groups.get(key);
    if (g) g.push(l);
    else groups.set(key, [l]);
  }
  for (const g of groups.values()) if (g.length >= 3) for (const l of g.slice(1)) l.master = g[0].id;
  return layers;
}
