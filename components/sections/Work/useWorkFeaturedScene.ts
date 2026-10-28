"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { usePinnedSceneMotion } from "@/lib/scrollMotion";
import {
  FEATURED_FADE,
  FEATURED_HOLD,
  FEATURED_SLIDE,
  FEATURED_VISIBLE,
} from "./Work.constants";
import type { WorkFeaturedSceneRefs } from "./Work.types";

/** Where each project starts on the unit timeline, and the timeline's length. */
export function featuredTimeline(shotCounts: number[]) {
  const starts: number[] = [];
  let total = 0;
  for (const n of shotCounts) {
    starts.push(total);
    total += n + FEATURED_HOLD;
  }
  return { starts, total };
}

/**
 * Drives the pinned featured scene: while the runway scrolls, the active
 * project's screenshots slide in from the right one at a time, the track slides
 * left once more than three are out, and after a short hold the next project
 * cross-fades in. Only `transform` and `opacity` change per frame; the shot
 * stride is measured on resize, never inside the loop.
 */
export function useWorkFeaturedScene(
  shotCounts: number[],
  enabled: boolean
): WorkFeaturedSceneRefs {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const articleRefs = useRef<(HTMLElement | null)[]>([]);
  const trackRefs = useRef<(HTMLUListElement | null)[]>([]);
  const shotRefs = useRef<(HTMLLIElement | null)[][]>(shotCounts.map(() => []));
  const stride = useRef(0);
  const active = useRef(-1);

  const { starts, total } = useMemo(() => featuredTimeline(shotCounts), [shotCounts]);

  // One shot's width plus the track gap — every track shares the same column.
  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      const track = trackRefs.current[0];
      const first = shotRefs.current[0]?.[0];
      if (!track || !first) return;
      stride.current = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [enabled]);

  const frame = useCallback(
    (p: number) => {
      const u = p * total;
      const last = shotCounts.length - 1;
      let shown = 0;
      let best = 0;

      shotCounts.forEach((n, i) => {
        const local = u - starts[i];
        const end = n + FEATURED_HOLD;

        // Fade in over the tail of the previous project's hold, out over its own.
        const fadeIn = i === 0 ? 1 : clamp((local + FEATURED_FADE) / FEATURED_FADE, 0, 1);
        const fadeOut = i === last ? 1 : clamp((end - local) / FEATURED_FADE, 0, 1);
        const o = Math.min(fadeIn, fadeOut);
        if (o > best) {
          best = o;
          shown = i;
        }

        const article = articleRefs.current[i];
        if (article) {
          article.style.opacity = o.toFixed(3);
          article.style.visibility = o > 0 ? "visible" : "hidden";
        }
        if (o === 0) return;

        let revealed = 0;
        shotRefs.current[i]?.forEach((el, k) => {
          if (!el) return;
          const s = easeOutCubic(clamp(local - k, 0, 1));
          revealed += s;
          el.style.transform = `translate3d(${((1 - s) * FEATURED_SLIDE).toFixed(1)}px, 0, 0)`;
          el.style.opacity = s.toFixed(3);
        });

        const track = trackRefs.current[i];
        if (track) {
          const shift = Math.max(0, revealed - FEATURED_VISIBLE) * stride.current;
          track.style.transform = `translate3d(${(-shift).toFixed(1)}px, 0, 0)`;
        }
      });

      if (shown !== active.current && counterRef.current) {
        active.current = shown;
        counterRef.current.textContent = `${String(shown + 1).padStart(2, "0")} / ${String(
          shotCounts.length
        ).padStart(2, "0")}`;
      }
    },
    [shotCounts, starts, total]
  );

  usePinnedSceneMotion(rootRef, frame, enabled);

  return { rootRef, counterRef, articleRefs, trackRefs, shotRefs };
}
