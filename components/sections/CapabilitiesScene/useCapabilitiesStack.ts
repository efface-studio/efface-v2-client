"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { usePinnedSceneMotion } from "@/lib/scrollMotion";
import { COLUMN_COUNT, STACK_ENTER, STACK_SWEEP } from "./Capabilities.constants";
import type { CapabilitiesMobileRefs } from "./Capabilities.types";

/** One card's animated parts, resolved once so the loop never queries the DOM. */
interface CardParts {
  rows: HTMLElement[];
  dashes: (HTMLElement | null)[];
  chips: HTMLElement[];
  /** Vertical centre of each row inside the card's list, for the lens. */
  centres: number[];
}

/**
 * The phone scene. The four disciplines are cards pinned in one stack; each
 * scroll step deals the next card up over the last, which sinks back a little.
 * Once a card lands, a lens — the touch stand-in for the desktop magnifier —
 * sweeps down its rows, lifting the one under it and leaving the passed ones
 * lit, and the tool chips come in after it.
 *
 * Only `transform` and `opacity` change per frame; each card's rows, dashes
 * and chips are resolved once, and the row centres re-measured on resize.
 */
export function useCapabilitiesStack(
  stackRef: RefObject<HTMLDivElement | null>,
  enabled: boolean
): CapabilitiesMobileRefs {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lensRefs = useRef<(HTMLDivElement | null)[]>([]);
  const parts = useRef<CardParts[]>([]);

  useEffect(() => {
    if (!enabled) return;
    parts.current = cardRefs.current.map((card) => {
      const rows = card ? Array.from(card.querySelectorAll<HTMLElement>("[data-row]")) : [];
      return {
        rows,
        dashes: rows.map((row) => row.querySelector<HTMLElement>("[data-dash]")),
        chips: card ? Array.from(card.querySelectorAll<HTMLElement>("[data-chip]")) : [],
        centres: [],
      };
    });
    const measure = () => {
      parts.current.forEach((part) => {
        part.centres = part.rows.map((row) => row.offsetTop + row.offsetHeight / 2);
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [enabled]);

  const frame = useCallback((p: number) => {
    const cards = cardRefs.current;
    const n = Math.min(COLUMN_COUNT, cards.length);
    const q = p * n;
    const enter = Array.from({ length: n }, (_, c) =>
      c === 0 ? 1 : easeOutCubic(clamp((q - c) / STACK_ENTER, 0, 1))
    );

    for (let c = 0; c < n; c++) {
      const card = cards[c];
      if (!card) continue;
      // How many cards now sit on top of this one (fractional while dealing).
      let depth = 0;
      for (let d = c + 1; d < n; d++) depth += enter[d];
      const sink = Math.min(depth, 3);
      card.style.transform = `translate3d(0, ${((1 - enter[c]) * 100).toFixed(2)}vh, 0) translate3d(0, ${(
        -sink * 12
      ).toFixed(1)}px, 0) scale(${(1 - sink * 0.05).toFixed(4)})`;
      const dim = dimRefs.current[c];
      if (dim) dim.style.opacity = clamp(depth * 0.45, 0, 0.8).toFixed(3);

      // Lens sweep across this card's rows.
      const s = clamp((q - c - STACK_ENTER) / STACK_SWEEP, 0, 1);
      const part = parts.current[c];
      if (!part) continue;
      const at = part.centres;
      const f = s * Math.max(0, part.rows.length - 1);
      part.rows.forEach((row, i) => {
        const w = Math.max(0, 1 - Math.abs(f - i));
        const lit = s > 0 ? clamp(f - i + 1, 0, 1) : 0;
        row.style.opacity = (0.3 + 0.5 * lit + 0.2 * w).toFixed(3);
        row.style.transform = `scale(${(1 + 0.07 * w).toFixed(4)})`;
        const dash = part.dashes[i];
        if (dash) dash.style.transform = `scaleX(${lit.toFixed(3)})`;
      });

      const lens = lensRefs.current[c];
      if (lens && at.length) {
        const i0 = Math.floor(f);
        const i1 = Math.min(at.length - 1, i0 + 1);
        const y = at[i0] + (at[i1] - at[i0]) * (f - i0);
        const shown = Math.min(clamp(s / 0.08, 0, 1), clamp((1 - s) / 0.12, 0, 1));
        lens.style.transform = `translate3d(0, ${(y - lens.offsetHeight / 2).toFixed(1)}px, 0)`;
        lens.style.opacity = (shown * (1 - Math.min(1, depth))).toFixed(3);
      }

      part.chips.forEach((chip, j) => {
        const t = easeOutCubic(clamp((s - 0.78 - j * 0.04) / 0.2, 0, 1));
        chip.style.opacity = t.toFixed(3);
        chip.style.transform = `translate3d(0, ${((1 - t) * 10).toFixed(1)}px, 0)`;
      });
    }
  }, []);

  usePinnedSceneMotion(stackRef, frame, enabled);

  return { cardRefs, dimRefs, lensRefs };
}
