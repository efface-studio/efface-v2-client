"use client";

import { createRef, useCallback, useEffect, useRef, useState } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { useScrollMotion } from "@/lib/scrollMotion";
import {
  FEATURED_EDGE_REM,
  FEATURED_HOLD,
  FEATURED_PAGE_UNITS,
  FEATURED_SLIDE,
  FEATURED_VISIBLE,
} from "./Work.constants";
import type { WorkFeature, WorkFeaturedRowRefs, WorkLaneRefs } from "./Work.types";

/** Timeline length of one lane: one unit per shot, or a fixed run for a page. */
export const laneUnits = (feature: WorkFeature) =>
  feature.page ? FEATURED_PAGE_UNITS : feature.shots.length;

const makeLane = (): WorkLaneRefs => ({
  trackRef: createRef(),
  shotRefs: { current: [] },
  edgeRef: createRef(),
  blurRef: createRef(),
  blurRightRef: createRef(),
  frameRef: createRef(),
  pageRef: createRef(),
});

/**
 * Drives one pinned row of featured projects. The row is only as tall as its
 * content and sticks at its own `top`; the runway spacer after it is what the
 * pin scrolls through. Every lane runs across that same runway, so the two
 * projects finish together:
 * - phone shots slide in from the right one at a time, and past three the
 *   track slides left. Both lane edges fade and blur instead of cutting shots
 *   off — the left once the track moves, the right while a shot slides in;
 * - a web page capture scrolls from top to bottom inside its browser frame.
 *
 * Only `transform`, `opacity` and the edge variable change per frame. The sticky
 * offset, runway length, shot stride and page travel are measured on resize.
 */
export function useFeaturedRow(units: number[], enabled: boolean): WorkFeaturedRowRefs {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const [lanes] = useState<WorkLaneRefs[]>(() => units.map(makeLane));
  const metrics = useRef({
    top: 0,
    runway: 1,
    stride: units.map(() => 0),
    travel: units.map(() => 0),
  });

  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      const m = metrics.current;
      if (stickyRef.current) m.top = parseFloat(getComputedStyle(stickyRef.current).top) || 0;
      if (runwayRef.current) m.runway = Math.max(1, runwayRef.current.offsetHeight);
      lanes.forEach((lane, i) => {
        const track = lane.trackRef.current;
        const first = lane.shotRefs.current[0];
        if (track && first) {
          m.stride[i] = first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
        }
        // How far a page capture can scroll before its bottom meets the frame's.
        const frame = lane.frameRef.current;
        const page = lane.pageRef.current;
        if (frame && page) m.travel[i] = Math.max(0, page.offsetHeight - frame.clientHeight);
      });
    };
    measure();
    const pages = lanes.flatMap((lane) => (lane.pageRef.current ? [lane.pageRef.current] : []));
    pages.forEach((img) => img.addEventListener("load", measure));
    window.addEventListener("resize", measure);
    return () => {
      pages.forEach((img) => img.removeEventListener("load", measure));
      window.removeEventListener("resize", measure);
    };
  }, [enabled, lanes]);

  const frame = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const { top, runway, stride, travel } = metrics.current;
    // 0 when the row reaches its sticky top, 1 once the runway has passed.
    const p = clamp((top - root.getBoundingClientRect().top) / runway, 0, 1);

    lanes.forEach((lane, i) => {
      const n = units[i];
      const u = p * (n + FEATURED_HOLD);

      const page = lane.pageRef.current;
      if (page) {
        page.style.transform = `translate3d(0, ${(-clamp(u / n, 0, 1) * travel[i]).toFixed(1)}px, 0)`;
        return;
      }

      let revealed = 0;
      let arriving = 0;
      lane.shotRefs.current.forEach((el, k) => {
        if (!el) return;
        const s = easeOutCubic(clamp(u - k, 0, 1));
        revealed += s;
        if (s > 0 && s < 1) arriving = Math.max(arriving, 1 - s);
        el.style.transform = `translate3d(${((1 - s) * FEATURED_SLIDE).toFixed(1)}px, 0, 0)`;
        el.style.opacity = s.toFixed(3);
      });
      const over = Math.max(0, revealed - FEATURED_VISIBLE);
      if (lane.trackRef.current) {
        lane.trackRef.current.style.transform = `translate3d(${(-over * stride[i]).toFixed(1)}px, 0, 0)`;
      }
      // Left edge: grows in over the first shot's worth of slide, so nothing is
      // softened while the first shot still sits flush. Right edge: only while
      // a shot is sliding in, gone once it settles against the edge.
      const left = Math.min(1, over);
      const edgeEl = lane.edgeRef.current;
      edgeEl?.style.setProperty("--edge-l", `${(left * FEATURED_EDGE_REM).toFixed(2)}rem`);
      edgeEl?.style.setProperty("--edge-r", `${(arriving * FEATURED_EDGE_REM).toFixed(2)}rem`);
      if (lane.blurRef.current) lane.blurRef.current.style.opacity = left.toFixed(3);
      if (lane.blurRightRef.current) lane.blurRightRef.current.style.opacity = arriving.toFixed(3);
    });
  }, [lanes, units]);

  useScrollMotion(rootRef, frame, enabled);

  return { rootRef, stickyRef, runwayRef, lanes };
}
