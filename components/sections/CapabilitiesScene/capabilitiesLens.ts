import type { RefObject } from "react";
import { clamp } from "@/lib/motion";
import { COLUMN_COUNT, LENS_ARM_AT, LENS_RX, LENS_RY, LENS_ZOOM } from "./Capabilities.constants";
import { cardProgress, type CardHandles } from "./capabilitiesTimeline";

interface Pointer {
  x: number;
  y: number;
}

interface LensElements {
  lensRef: RefObject<HTMLDivElement | null>;
  lensInnerRef: RefObject<HTMLDivElement | null>;
  cursorDotRef: RefObject<HTMLDivElement | null>;
  gridRef: RefObject<HTMLDivElement | null>;
}

/**
 * Which column the cursor is over, or -1.
 *
 * Only cards that have finished dealing in qualify: the lens content is a
 * static snapshot of the grid, so magnifying a card that is still flying in
 * would show it offset from the real one. Walking the rows costs a
 * `getBoundingClientRect` each, which forces layout — call this only on frames
 * where the cursor actually moved.
 */
export function findHoveredColumn(
  capData: (CardHandles | null)[],
  pointer: Pointer,
  p: number
): number {
  for (let c = 0; c < COLUMN_COUNT; c++) {
    const d = capData[c];
    if (!d) continue;
    if (cardProgress(c, p) < LENS_ARM_AT) continue;
    const targets = d.rows.slice();
    if (d.head) targets.unshift(d.head);
    if (d.chipsRow) targets.push(d.chipsRow);
    if (!targets.length) continue;
    const first = targets[0].getBoundingClientRect();
    const last = targets[targets.length - 1].getBoundingClientRect();
    if (pointer.y < first.top - 6 || pointer.y > last.bottom + 6) continue;
    let near: DOMRect | null = null;
    let best = 1e9;
    for (const el of targets) {
      const rr = el.getBoundingClientRect();
      const dy = Math.abs((rr.top + rr.bottom) / 2 - pointer.y);
      if (dy < best) {
        best = dy;
        near = rr;
      }
    }
    if (near && pointer.x >= near.left - 8 && pointer.x <= near.right + 14) return c;
  }
  return -1;
}

/**
 * The magnifier's own little state machine: it eases toward the cursor, swells
 * in and out with a spring, and skews with its own velocity. The magnified
 * content is a settled clone of the grid, re-snapshotted whenever the lens
 * moves to a different column.
 */
export function createLensController(els: LensElements) {
  /** Lens position, previous position, scale and scale velocity. */
  const lp = { x: 0, y: 0, px: 0, py: 0, s: 0, v: 0 };
  let lensFor = -1;

  return {
    /** True once the lens has faded up enough to hide the real cursor. */
    get visible() {
      return lp.s > 0.15;
    },

    update(over: number, pointer: Pointer, gridRect: DOMRect, scale: number, gridWrap: HTMLElement) {
      const lens = els.lensRef.current;
      const inner = els.lensInnerRef.current;
      if (!lens || !inner) return;

      if (!lp.x && !lp.y) {
        lp.x = gridRect.width / 2;
        lp.y = gridRect.height / 2;
      }
      lp.px = lp.x;
      lp.py = lp.y;

      if (over >= 0) {
        lp.x += ((pointer.x - gridRect.left) / scale - lp.x) * 0.18;
        lp.y += ((pointer.y - gridRect.top) / scale - lp.y) * 0.18;
        if (lensFor !== over && els.gridRef.current) {
          lensFor = over;
          // Snapshot the grid so the lens shows a settled, untransformed copy.
          const clone = els.gridRef.current.cloneNode(true) as HTMLElement;
          for (const card of Array.from(clone.children) as HTMLElement[]) {
            card.style.transform = "none";
            card.style.opacity = "1";
          }
          inner.replaceChildren(clone);
          inner.style.width = `${gridWrap.offsetWidth}px`;
        }
      } else if (lp.s < 0.03) {
        lensFor = -1;
      }
      // Snap on the first armed frame so it doesn't fly in from the last spot.
      if (over >= 0 && lp.s < 0.05) {
        lp.x = (pointer.x - gridRect.left) / scale;
        lp.y = (pointer.y - gridRect.top) / scale;
        lp.px = lp.x;
        lp.py = lp.y;
      }

      lp.v += ((over >= 0 ? 1 : 0) - lp.s) * 0.16;
      lp.v *= 0.8;
      lp.s += lp.v;

      const vx = lp.x - lp.px;
      const vy = lp.y - lp.py;
      const s = 0.35 + 0.65 * lp.s;
      const skx = clamp(vx * 0.5, -8, 8);
      const sky = clamp(vy * 0.5, -6, 6);
      lens.style.opacity = String(clamp(lp.s * 1.25, 0, 1));
      lens.style.transform = `translate(${lp.x - LENS_RX}px, ${lp.y - LENS_RY}px) scale(${s}) skew(${skx}deg, ${sky * 0.5}deg)`;
      inner.style.transform = `translate(${LENS_RX - lp.x * LENS_ZOOM}px, ${
        LENS_RY - lp.y * LENS_ZOOM
      }px) scale(${LENS_ZOOM})`;

      const dot = els.cursorDotRef.current;
      if (dot) {
        dot.style.opacity = String(0.5 * clamp(lp.s, 0, 1));
        dot.style.transform = `translate(${(pointer.x - gridRect.left) / scale - 4}px, ${
          (pointer.y - gridRect.top) / scale - 4
        }px)`;
      }
    },
  };
}
