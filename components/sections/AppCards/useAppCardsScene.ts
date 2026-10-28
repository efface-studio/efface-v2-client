"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOutBack, easeOutCubic } from "@/lib/motion";
import {
  CARD_COUNT,
  CFG,
  PARALLAX,
  ROW_FIT_HEIGHT,
  ROW_FIT_WIDTH,
} from "./AppCards.constants";
import type { AppCardsSceneRefs } from "./AppCards.types";

/** Light each letter up as the scroll passes it. */
function lightLetters(el: HTMLElement, start: number, end: number, p: number): void {
  const ch = el.children;
  const n = ch.length;
  for (let i = 0; i < n; i++) {
    const t0 = start + (i / Math.max(1, n - 1)) * (end - start);
    const tt = easeOutCubic(clamp((p - t0) / 0.09, 0, 1));
    const r = Math.round(58 + 197 * tt);
    const gc = Math.round(58 + 197 * tt);
    const b = Math.round(64 + 191 * tt);
    (ch[i] as HTMLElement).style.color = `rgb(${r}, ${gc}, ${b})`;
  }
}

/**
 * The pinned desktop scene: cards deal in from below in a fan while the two
 * oversized words parallax past each other and light up letter by letter.
 *
 * Owns its own rAF loop rather than using `usePinnedSceneMotion` because it
 * also tracks a smoothed cursor position between frames.
 */
export function useAppCardsScene(enabled: boolean): AppCardsSceneRefs {
  const sceneRef = useRef<HTMLElement>(null);
  const wordTopRef = useRef<HTMLDivElement>(null);
  const wordBottomRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    if (!enabled) return;

    const mouse = { x: 0, y: 0 };
    const sm = { x: 0, y: 0 };
    let raf = 0;

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouse);

    // Only run while the scene is actually on screen and the tab is visible —
    // otherwise this loop burns a frame's work on every page the user visits.
    let onScreen = true;
    let hidden = document.hidden;
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    if (sceneRef.current) io.observe(sceneRef.current);
    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || hidden) return;
      const scene = sceneRef.current;
      if (!scene) return;
      const vh = window.innerHeight;
      const rect = scene.getBoundingClientRect();
      const total = Math.max(1, scene.offsetHeight - vh);
      const p = clamp(-rect.top / total, 0, 1);

      sm.x += (mouse.x - sm.x) * 0.06;
      sm.y += (mouse.y - sm.y) * 0.06;

      if (rowRef.current) {
        rowRef.current.style.transform = `scale(${Math.min(
          1,
          window.innerWidth / ROW_FIT_WIDTH,
          window.innerHeight / ROW_FIT_HEIGHT
        )})`;
      }

      for (let i = 0; i < CARD_COUNT; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const c = CFG[i];
        const tt = clamp((p - i * 0.12) / 0.5, 0, 1);
        const e = easeOutCubic(tt);
        const eb = easeOutBack(tt);
        let tf = `translate(${c.dx * (1 - e)}px, ${c.oy + (1 - e) * vh * 1.05}px) rotate(${
          c.rot + c.xr * (1 - eb)
        }deg)`;
        const depth = 1 + (3 - i) * 0.35;
        tf += ` translate(${sm.x * PARALLAX * 14 * depth}px, ${sm.y * PARALLAX * 9 * depth}px)`;
        el.style.transform = tf;
        el.style.opacity = String(clamp(tt * 2.5, 0, 1));
      }

      if (wordTopRef.current) {
        wordTopRef.current.style.transform = `translateX(${(0.5 - p) * PARALLAX * 260}px)`;
        lightLetters(wordTopRef.current, 0.05, 0.42, p);
      }
      if (wordBottomRef.current) {
        wordBottomRef.current.style.transform = `translateX(${(p - 0.5) * PARALLAX * 260}px)`;
        lightLetters(wordBottomRef.current, 0.5, 0.86, p);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [enabled]);

  return { sceneRef, wordTopRef, wordBottomRef, rowRef, cardRefs };
}
