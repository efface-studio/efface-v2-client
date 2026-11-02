"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import type { ParticleLogoProps } from "./LogoParticle.types";

/** Target x, y, accent colour, on the outline. */
type Target = [number, number, boolean, boolean];

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  r: number;
  accent: boolean;
}

/**
 * Particles scattered across the box gather into the logo. The pointer pushes
 * them aside and they spring back; a press blows them apart and they re-form.
 * Colours come from the host: `color` for neutral pixels, `--color-accent` for
 * saturated ones. Ported from efface-component `fx/ParticleText` (image mode).
 */
export default function ParticleLogo({ src, gap = 5, radius = 90, scale = 0.8, className }: ParticleLogoProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement ?? canvas;
    let parts: Particle[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let pointer = { x: -9999, y: -9999 };
    let fg = "#f6f6f7";
    let accent = "#3b62e5";
    let img: HTMLImageElement | null = null;

    // Draw the logo offscreen and sample it into evenly spaced particle
    // targets: a row traced along every edge (outline and colour seam) so the
    // silhouette reads clean, then the inside filled at the same spacing.
    const sample = (): Target[] => {
      if (!img) return [];
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const c = off.getContext("2d");
      if (!c) return [];
      const pad = 0.12;
      const s = Math.min((w * (1 - pad * 2)) / img.width, (h * scale) / img.height);
      const dw = img.width * s;
      const dh = img.height * s;
      c.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const data = c.getImageData(0, 0, w, h).data;

      // 0 empty, 1 neutral, 2 accent (saturated) — per pixel.
      const cls = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) {
        const k = i * 4;
        if (data[k + 3] <= 128) continue;
        const sat = Math.max(data[k], data[k + 1], data[k + 2]) - Math.min(data[k], data[k + 1], data[k + 2]);
        cls[i] = sat > 40 ? 2 : 1;
      }
      const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : cls[y * w + x]);

      // Spatial hash of every placed dot, so each new one keeps its distance.
      const cell = gap;
      const cols = Math.ceil(w / cell) + 1;
      const buckets = new Map<number, [number, number][]>();
      const crowded = (x: number, y: number, min: number) => {
        const cx = Math.floor(x / cell);
        const cy = Math.floor(y / cell);
        for (let j = cy - 1; j <= cy + 1; j++)
          for (let i = cx - 1; i <= cx + 1; i++)
            for (const [px, py] of buckets.get(j * cols + i) ?? [])
              if ((px - x) ** 2 + (py - y) ** 2 < min * min) return true;
        return false;
      };
      const pts: Target[] = [];
      const place = (x: number, y: number, accentPx: boolean, edge: boolean) => {
        const key = Math.floor(y / cell) * cols + Math.floor(x / cell);
        const bucket = buckets.get(key);
        if (bucket) bucket.push([x, y]);
        else buckets.set(key, [[x, y]]);
        pts.push([x, y, accentPx, edge]);
      };

      // Outline first, then the inside packed around it — a fixed grid would
      // leave uneven bands where it meets the curve.
      const spacing = gap * 0.92;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const own = cls[y * w + x];
          if (!own) continue;
          const edge = at(x - 1, y) !== own || at(x + 1, y) !== own || at(x, y - 1) !== own || at(x, y + 1) !== own;
          if (edge && !crowded(x, y, spacing)) place(x, y, own === 2, true);
        }
      }
      // Candidates in random order (a blue-noise fill): scanning in rows would
      // leave seams where packing from different edges meets.
      const step = Math.max(1, Math.round(gap / 3));
      const cand: number[] = [];
      for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) if (cls[y * w + x]) cand.push(y * w + x);
      for (let i = cand.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cand[i], cand[j]] = [cand[j], cand[i]];
      }
      const fill = gap * 0.8;
      for (const i of cand) {
        const x = i % w;
        const y = (i - x) / w;
        if (!crowded(x, y, fill)) place(x, y, cls[i] === 2, false);
      }
      return pts;
    };

    const build = () => {
      const prev = parts;
      parts = sample().map(([tx, ty, accentPx, edge], i) => {
        const old = prev[i];
        return {
          x: old ? old.x : Math.random() * w,
          y: old ? old.y : Math.random() * h,
          tx,
          ty,
          vx: old ? old.vx : 0,
          vy: old ? old.vy : 0,
          // Outline dots share one size so the silhouette stays even; the
          // inside varies a touch so it doesn't read as a printed screen.
          r: edge ? gap * 0.42 : gap * 0.38 + Math.random() * gap * 0.08,
          accent: accentPx,
        };
      });
    };

    const dot = (p: Particle, x: number, y: number) => {
      ctx.fillStyle = p.accent ? accent : fg;
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawStatic = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) dot(p, p.tx, p.ty);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const cs = getComputedStyle(host);
      fg = cs.color;
      accent = cs.getPropertyValue("--color-accent").trim() || accent;
      build();
      if (reduce) drawStatic();
    };

    // Spring toward the target, pushed off by the pointer; stops once settled.
    const step = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const r2 = radius * radius;
      let moving = 0;
      for (const p of parts) {
        let ax = (p.tx - p.x) * 0.045;
        let ay = (p.ty - p.y) * 0.045;
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1;
          const f = ((radius - d) / radius) * 2.2;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
        p.vx = (p.vx + ax) * 0.82;
        p.vy = (p.vy + ay) * 0.82;
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.vx) + Math.abs(p.vy) > 0.05) moving++;
        dot(p, p.x, p.y);
      }
      raf = moving === 0 && pointer.x < -999 ? 0 : requestAnimationFrame(step);
    };
    const wake = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      wake();
    };
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 };
      wake();
    };
    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const p of parts) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = Math.max(0, 1 - d / (w * 0.6)) * 26 + Math.random() * 4;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      wake();
    };

    let alive = true;
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    // The image arrives late — sample again once it has, unless unmounted.
    const im = new Image();
    im.onload = () => {
      if (!alive) return;
      img = im;
      resize();
      wake();
    };
    im.src = src;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, [src, gap, radius, scale, reduce]);

  // `touch-pan-y`, not `touch-none`: a vertical swipe over the logo still
  // scrolls the page on a phone; a tap still blows it apart.
  return (
    <div className={cn("relative h-full w-full cursor-crosshair touch-pan-y select-none", className)}>
      <canvas ref={ref} className="block" aria-hidden />
    </div>
  );
}
