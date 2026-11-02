"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import type { AuroraProps } from "./LogoParticle.types";

interface Blob {
  x: number;
  y: number;
  r: number;
  c: string;
  sx: number;
  sy: number;
  ph: number;
}

/**
 * A few soft glows drifting slowly and mixing (a mesh-gradient aurora). The
 * blob nearest the pointer leans toward it. Drawn at half resolution — it is
 * blurred anyway. Ported from efface-component `fx/Aurora`.
 */
export default function Aurora({ colors, attract = 0.06, className }: AuroraProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement ?? canvas;
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let pointer: { x: number; y: number } | null = null;
    const blobs: Blob[] = colors.map((c, i) => ({
      x: 0.5,
      y: 0.5,
      r: 0.45,
      c,
      sx: 0.28 + i * 0.07,
      sy: 0.22 + i * 0.05,
      ph: (i * Math.PI * 2) / colors.length,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const bx = 0.5 + Math.sin(t * b.sx + b.ph) * 0.32;
        const by = 0.5 + Math.cos(t * b.sy + b.ph * 1.3) * 0.28;
        if (pointer && attract > 0) {
          b.x += (pointer.x - b.x) * attract * 0.2;
          b.y += (pointer.y - b.y) * attract * 0.2;
        }
        b.x += (bx - b.x) * 0.02;
        b.y += (by - b.y) * 0.02;
        const r = Math.max(w, h) * b.r;
        const g = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, r);
        g.addColorStop(0, b.c + "aa");
        g.addColorStop(0.55, b.c + "33");
        g.addColorStop(1, b.c + "00");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width / 2));
      h = Math.max(1, Math.floor(rect.height / 2));
      canvas.width = w;
      canvas.height = h;
      draw();
    };
    const loop = () => {
      t += 0.9 / 60;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    };
    const onLeave = () => {
      pointer = null;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    if (!reduce) raf = requestAnimationFrame(loop);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [colors, attract, reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full blur-2xl saturate-150", className)}
    />
  );
}
