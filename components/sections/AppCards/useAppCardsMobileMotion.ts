"use client";

import { useCallback, useRef } from "react";
import { easeOutCubic } from "@/lib/motion";
import { elementProgress, useScrollMotion } from "@/lib/scrollMotion";
import type { AppCardsMobileRefs } from "./AppCards.types";

/**
 * Mobile motion. Same "deal in from below" feel as the desktop scene, but
 * driven off each card's own position so the tiles keep their full, readable size.
 */
export function useAppCardsMobileMotion(enabled: boolean): AppCardsMobileRefs {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  const frame = useCallback(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const e = easeOutCubic(elementProgress(el));
      const dir = i % 2 === 0 ? -1 : 1; // alternate the tilt, like the fanned deck
      el.style.opacity = String(Math.min(1, e * 1.6));
      el.style.transform = `translateY(${(1 - e) * 72}px) rotate(${
        (1 - e) * dir * 7
      }deg) scale(${0.9 + 0.1 * e})`;
    });
  }, []);

  useScrollMotion(rootRef, frame, enabled);

  return { rootRef, cardRefs };
}
