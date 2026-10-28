"use client";

import { useEffect } from "react";
import { clamp } from "@/lib/motion";

/**
 * How far an element has travelled through its reveal window, 0 → 1.
 * 0 while its top is still below `startAt` of the viewport, 1 once it has risen
 * `windowFrac` of a screen past that. Scrolling back down runs it in reverse —
 * same feel as the desktop scenes, which are also scroll-bound rather than
 * play-once.
 */
export function elementProgress(el: Element, startAt = 0.92, windowFrac = 0.55) {
  const vh = window.innerHeight;
  const top = el.getBoundingClientRect().top;
  return clamp((vh * startAt - top) / (vh * windowFrac), 0, 1);
}

/**
 * Runs `frame` on every animation frame while `ref` is on screen and the tab is
 * visible, and once more on the way out so nothing is left mid-transition.
 * Skipped entirely when `enabled` is false (i.e. on desktop, where the pinned
 * scenes drive their own loops).
 */
export function useScrollMotion(
  ref: React.RefObject<HTMLElement | null>,
  frame: () => void,
  enabled: boolean
) {
  useEffect(() => {
    const host = ref.current;
    if (!host || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame(); // settle everything into its final state, then stop
      return;
    }

    let raf = 0;
    let onScreen = true;
    let hidden = document.hidden;

    const io = new IntersectionObserver(
      (entries) => {
        const wasOn = onScreen;
        onScreen = entries[0].isIntersecting;
        if (wasOn && !onScreen) frame(); // final paint as it leaves
      },
      { threshold: 0 }
    );
    io.observe(host);

    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || hidden) return;
      frame();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, frame, enabled]);
}

/**
 * The rAF gate the pinned desktop scenes share: runs `frame(progress)` only
 * while `ref` is on screen and the tab is visible, where progress is how far
 * the section has scrolled through its own pinned runway (0 → 1).
 *
 * `settleAt` is painted once and the loop never starts when the user has asked
 * for reduced motion.
 */
export function usePinnedSceneMotion(
  ref: React.RefObject<HTMLElement | null>,
  frame: (progress: number) => void,
  enabled: boolean,
  settleAt = 1
) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame(settleAt);
      return;
    }

    let raf = 0;
    let onScreen = true;
    let hidden = document.hidden;

    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(root);

    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || hidden) return;
      const rect = root.getBoundingClientRect();
      const total = Math.max(1, root.offsetHeight - window.innerHeight);
      frame(clamp(-rect.top / total, 0, 1));
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, frame, enabled, settleAt]);
}
