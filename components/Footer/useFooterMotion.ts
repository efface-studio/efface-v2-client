"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { SEQ_IN, SEQ_OUT, VISIBLE_BOTTOM, VISIBLE_TOP } from "./Footer.constants";
import { createWordmarkPainter, type PointerSample } from "./wordmarkCanvas";
import type { FooterRefs } from "./Footer.types";

/**
 * The footer's entrance: a diagonal wipe uncovers the block, the lock-up and
 * meta columns rise in staggered, the tagline's strike-through draws, the
 * wordmark unmasks left to right, and the bottom bar fades up. The sequence is
 * scroll-reversible — it rewinds when the footer leaves the viewport.
 *
 * One rAF loop drives all of it plus the wordmark's cursor trail.
 */
export function useFooterMotion(): FooterRefs {
  const rootRef = useRef<HTMLElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const strikeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cwrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer: PointerSample = { x: -9999, y: -9999, t: 0 };
    const painter = createWordmarkPainter(canvas, reduced);
    let raf = 0;
    let seq = 0;
    let lastT = 0;

    const onMouse = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.t = performance.now();
    };
    const onResize = () => painter.setup();
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", onResize);

    // The wordmark is drawn as text, so it can't be measured until the display
    // face has actually loaded.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => painter.setup());

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const rect = root.getBoundingClientRect();
      const now = performance.now();
      const dt = Math.min(0.05, (now - (lastT || now)) / 1000);
      lastT = now;

      // Runs forward while the footer is in view, rewinds when it leaves.
      const visible = rect.top < vh * VISIBLE_TOP && rect.bottom > vh * VISIBLE_BOTTOM;
      seq = clamp(seq + (visible ? dt / SEQ_IN : -dt / SEQ_OUT), 0, 1);
      const p = reduced ? 1 : seq;

      if (wipeRef.current) {
        const wt = easeOutCubic(clamp(p / 0.55, 0, 1));
        const el = wipeRef.current;
        if (wt >= 1) {
          // Drop the mask entirely once it is off the block — an always-on
          // mask-image keeps the whole footer on its own composited layer.
          if (el.style.maskImage !== "none") {
            el.style.maskImage = "none";
            el.style.webkitMaskImage = "none";
          }
        } else {
          const e2 = -15 + wt * 145;
          const m = `linear-gradient(115deg, rgba(0,0,0,1) ${e2 - 14}%, rgba(0,0,0,0) ${e2}%)`;
          el.style.maskImage = m;
          el.style.webkitMaskImage = m;
        }
      }
      if (headRef.current) {
        const tt = easeOutCubic(clamp(p / 0.2, 0, 1));
        headRef.current.style.opacity = String(0.1 + 0.9 * tt);
        headRef.current.style.transform = `translateY(${(1 - tt) * 14}px)`;
        headRef.current.style.filter = tt >= 1 ? "none" : `blur(${(1 - tt) * 8}px)`;
      }
      if (metaRef.current) {
        metaRef.current.style.opacity = String(clamp(p * 6, 0, 1));
        const cols = Array.from(metaRef.current.children) as HTMLElement[];
        cols.forEach((col, i) => {
          const tt = easeOutCubic(clamp((p - 0.14 - i * 0.07) / 0.24, 0, 1));
          col.style.opacity = String(tt);
          col.style.transform = `translateY(${(1 - tt) * 18}px)`;
          col.style.filter = tt >= 1 ? "none" : `blur(${(1 - tt) * 8}px)`;
        });
      }
      if (strikeRef.current) {
        strikeRef.current.style.transform = `scaleX(${easeOutCubic(
          clamp((p - 0.1) / 0.18, 0, 1)
        )})`;
      }
      if (cwrapRef.current) {
        const tt = easeOutCubic(clamp((p - 0.38) / 0.32, 0, 1));
        cwrapRef.current.style.clipPath = `inset(0 ${(1 - tt) * 100}% 0 0)`;
      }
      if (barRef.current) {
        barRef.current.style.opacity = String(easeOutCubic(clamp((p - 0.66) / 0.22, 0, 1)));
      }

      painter.paint(pointer, now);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return { rootRef, wipeRef, headRef, metaRef, strikeRef, barRef, canvasRef, cwrapRef };
}
