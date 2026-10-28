"use client";

import { useCallback, useEffect, useRef } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { useScrollMotion } from "@/lib/scrollMotion";
import {
  FEATURED_EDGE_REM,
  FEATURED_HOLD,
  FEATURED_SLIDE,
  FEATURED_VISIBLE,
} from "./Work.constants";
import type { WorkFeaturedPinRefs } from "./Work.types";

/**
 * Drives one pinned featured project. The block is only as tall as its content
 * and sticks at its own `top`; the runway spacer after it is what the pin
 * scrolls through. Across that runway the shots slide in from the right one at
 * a time and the track slides left once more than three are out, fading and
 * blurring out at the column edge as it goes. A web page capture instead
 * scrolls from top to bottom inside its browser frame.
 *
 * Only `transform` and `opacity` change per frame. The sticky offset, runway
 * length and shot stride are measured on resize, never inside the loop.
 */
export function useFeaturedPin(units: number, enabled: boolean): WorkFeaturedPinRefs {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const shotRefs = useRef<(HTMLLIElement | null)[]>([]);
  const edgeRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLImageElement>(null);
  const metrics = useRef({ top: 0, runway: 1, stride: 0, travel: 0 });

  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      const m = metrics.current;
      if (stickyRef.current) m.top = parseFloat(getComputedStyle(stickyRef.current).top) || 0;
      if (runwayRef.current) m.runway = Math.max(1, runwayRef.current.offsetHeight);
      const track = trackRef.current;
      const first = shotRefs.current[0];
      if (track && first) {
        m.stride = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
      }
      // How far a page capture can scroll before its bottom meets the frame's.
      if (frameRef.current && pageRef.current) {
        m.travel = Math.max(0, pageRef.current.offsetHeight - frameRef.current.clientHeight);
      }
    };
    measure();
    const img = pageRef.current;
    img?.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    return () => {
      img?.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);

  const frame = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const { top, runway, stride, travel } = metrics.current;
    // 0 when the block reaches its sticky top, 1 once the runway has passed.
    const p = clamp((top - root.getBoundingClientRect().top) / runway, 0, 1);
    const u = p * (units + FEATURED_HOLD);

    if (pageRef.current) {
      const s = clamp(u / units, 0, 1);
      pageRef.current.style.transform = `translate3d(0, ${(-s * travel).toFixed(1)}px, 0)`;
      return;
    }

    let revealed = 0;
    shotRefs.current.forEach((el, k) => {
      if (!el) return;
      const s = easeOutCubic(clamp(u - k, 0, 1));
      revealed += s;
      el.style.transform = `translate3d(${((1 - s) * FEATURED_SLIDE).toFixed(1)}px, 0, 0)`;
      el.style.opacity = s.toFixed(3);
    });
    const over = Math.max(0, revealed - FEATURED_VISIBLE);
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${(-over * stride).toFixed(1)}px, 0, 0)`;
    }
    // The left-edge fade and blur grow in over the first shot's worth of
    // slide, so nothing is softened while the first shot still sits flush.
    const edge = Math.min(1, over);
    edgeRef.current?.style.setProperty("--edge", `${(edge * FEATURED_EDGE_REM).toFixed(2)}rem`);
    if (blurRef.current) blurRef.current.style.opacity = edge.toFixed(3);
  }, [units]);

  useScrollMotion(rootRef, frame, enabled);

  return { rootRef, stickyRef, runwayRef, trackRef, shotRefs, edgeRef, blurRef, frameRef, pageRef };
}
