"use client";

import { useEffect, useRef, type RefObject } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { COLUMN_COUNT, GRID_FIT_HEIGHT, SCENE_PAD, TILT } from "./Capabilities.constants";
import { createLensController, findHoveredColumn } from "./capabilitiesLens";
import { cardProgress, collectCardHandles, letterSeeds } from "./capabilitiesTimeline";
import type { CapabilitiesSceneRefs } from "./Capabilities.types";

/**
 * The pinned desktop scene, in seven stages: the label types itself, the
 * headline letters fly in from scattered positions, the sub copy rises, the
 * cross-hair draws, the four cards deal out from the centre, their rows and
 * chips stagger in, and a spotlight trails the cursor. A magnifier lens arms
 * over whichever landed row the cursor is on.
 *
 * Owns its own rAF loop rather than using `usePinnedSceneMotion`: it carries
 * smoothed cursor state between frames and resolves its DOM handles once.
 */
export function useCapabilitiesScene(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  groupCount: number
): CapabilitiesSceneRefs {
  const spotRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lineHRef = useRef<HTMLDivElement>(null);
  const lineVRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const lensInnerRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const pointer = { x: -1, y: -1 };
    const spotPos = { x: 0, y: 0 };
    let raf = 0;
    let typeShown = -1;
    let overRows = -1;

    const letters = Array.from(root.querySelectorAll<HTMLElement>("[data-l]"));
    const seeds = letterSeeds(
      letters.length,
      window.innerWidth * 0.32,
      window.innerHeight * 0.36,
      70
    );
    const typeFull = typeRef.current?.textContent ?? "";
    const capData = collectCardHandles(capRefs.current);
    const lens = createLensController({ lensRef, lensInnerRef, cursorDotRef, gridRef });

    let pointerMoved = true;
    const onMouse = (e: MouseEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointerMoved = true;
    };
    window.addEventListener("mousemove", onMouse);

    // Only run while the scene is on screen and the tab is visible.
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
      const vh = window.innerHeight;
      const rect = root.getBoundingClientRect();
      const total = Math.max(1, root.offsetHeight - vh);
      const p = clamp(-rect.top / total, 0, 1);

      // Reserve breathing room top and bottom: the source scene only left 30px,
      // which pinned the tool chips against the next section's edge.
      const fitScale = Math.min(1, (vh - 2 * SCENE_PAD) / GRID_FIT_HEIGHT);
      if (fitRef.current) fitRef.current.style.transform = `scale(${fitScale})`;

      // 1. label types itself in
      if (typeRef.current) {
        const n = Math.round(clamp(p / 0.04, 0, 1) * typeFull.length);
        if (n !== typeShown) {
          typeRef.current.textContent = typeFull.slice(0, n);
          typeShown = n;
        }
      }

      // 2. headline letters fly in from scattered positions
      for (let i = 0; i < letters.length; i++) {
        const tt = easeOutCubic(clamp((p - 0.04 - i * 0.009) / 0.22, 0, 1));
        const sd = seeds[i] ?? { dx: 0, dy: 0, rot: 0 };
        const u = 1 - tt;
        const el = letters[i];
        el.style.transform = `translate(${u * sd.dx}px, ${u * sd.dy}px) rotate(${
          u * sd.rot
        }deg) scale(${0.7 + 0.3 * tt})`;
        el.style.opacity = String(clamp(0.15 + tt * 1.4, 0, 1));
        el.style.filter = u > 0.02 ? `blur(${u * 5}px)` : "none";
      }

      // 3. sub copy
      if (subRef.current) {
        const tt = easeOutCubic(clamp((p - 0.3) / 0.18, 0, 1));
        subRef.current.style.opacity = String(tt);
        subRef.current.style.transform = `translateY(${(1 - tt) * 14}px)`;
      }

      // 4. magnifier lens over the hovered row. The hit test forces layout, and
      // its answer can only change when the cursor moves — reuse it otherwise.
      const gw = gridWrapRef.current;
      if (gw) {
        if (pointerMoved) {
          overRows = findHoveredColumn(capData, pointer, p);
          pointerMoved = false;
        }
        lens.update(overRows, pointer, gw.getBoundingClientRect(), fitScale || 1, gw);
        gw.style.cursor = lens.visible ? "none" : "";
      }

      // 5. grid cross-hair lines draw themselves
      if (lineHRef.current) {
        lineHRef.current.style.transform = `scaleX(${easeOutCubic(
          clamp((p - 0.34) / 0.3, 0, 1)
        )})`;
      }
      if (lineVRef.current) {
        lineVRef.current.style.transform = `scaleY(${easeOutCubic(
          clamp((p - 0.38) / 0.3, 0, 1)
        )})`;
      }

      // 6. cards deal out from the centre, then rows and chips stagger in
      for (let c = 0; c < COLUMN_COUNT; c++) {
        const d = capData[c];
        if (!d) continue;
        const ct = cardProgress(c, p);
        d.card.style.opacity = String(clamp(ct * 4, 0, 1));
        const r = d.card.getBoundingClientRect();
        const inside =
          pointer.x >= r.left &&
          pointer.x <= r.right &&
          pointer.y >= r.top &&
          pointer.y <= r.bottom;
        const nx = inside ? ((pointer.x - r.left) / r.width) * 2 - 1 : 0;
        const ny = inside ? ((pointer.y - r.top) / r.height) * 2 - 1 : 0;
        const lensOn = overRows === c;
        d.sx += ((lensOn ? 0 : nx) - d.sx) * 0.12;
        d.sy += ((lensOn ? 0 : ny) - d.sy) * 0.12;
        d.h += ((inside && !lensOn ? 1 : 0) - d.h) * 0.12;

        const gEl = gridRef.current;
        const dealX = gEl ? gEl.offsetWidth / 2 - (d.card.offsetLeft + d.card.offsetWidth / 2) : 0;
        const dealY = gEl
          ? gEl.offsetHeight / 2 - (d.card.offsetTop + d.card.offsetHeight / 2) - 40
          : 0;
        const dealR = (c - 1.5) * 9;
        d.card.style.transform = `perspective(1100px) translate(${(1 - ct) * dealX}px, ${
          (1 - ct) * dealY - d.h * 10
        }px) rotate(${(1 - ct) * dealR}deg) scale(${(0.86 + 0.14 * ct) * (1 + d.h * 0.022)}) rotateX(${
          d.sy * -TILT * ct
        }deg) rotateY(${d.sx * TILT * ct}deg)`;
        d.card.style.zIndex = ct < 0.98 ? String(8 - c) : d.h > 0.5 ? "2" : "1";

        if (d.glow) {
          d.glow.style.opacity = inside ? "1" : "0";
          if (inside) {
            const px = ((pointer.x - r.left) / r.width) * 100;
            const py = ((pointer.y - r.top) / r.height) * 100;
            d.glow.style.background = `radial-gradient(560px 420px at ${px}% ${py}%, rgba(${d.acc},0.22), rgba(${d.acc},0.05) 55%, rgba(0,0,0,0) 75%)`;
          }
        }
        for (let i = 0; i < d.rows.length; i++) {
          const rt = easeOutCubic(clamp((p - 0.46 - c * 0.07 - i * 0.035) / 0.14, 0, 1));
          d.rows[i].style.opacity = String(rt);
          d.rows[i].style.transform = `translateX(${(1 - rt) * -14}px)`;
          if (d.dashes[i]) d.dashes[i].style.transform = `scaleX(${rt})`;
        }
        for (let i = 0; i < d.chips.length; i++) {
          const st = easeOutCubic(clamp((p - 0.58 - c * 0.07 - i * 0.03) / 0.14, 0, 1));
          d.chips[i].style.opacity = String(st);
          d.chips[i].style.transform = `scale(${0.82 + 0.18 * st})`;
        }
      }

      // 7. spotlight trails the cursor
      if (spotRef.current) {
        const sEl = fitRef.current?.parentElement ?? root;
        const rr = sEl.getBoundingClientRect();
        spotPos.x += (pointer.x - rr.left - spotPos.x) * 0.06;
        spotPos.y += (pointer.y - rr.top - spotPos.y) * 0.06;
        spotRef.current.style.opacity = pointer.x >= 0 ? "1" : "0";
        spotRef.current.style.transform = `translate(${spotPos.x - 450}px, ${
          spotPos.y - 450
        }px)`;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [rootRef, enabled, groupCount]);

  return {
    spotRef,
    fitRef,
    typeRef,
    subRef,
    gridWrapRef,
    gridRef,
    lineHRef,
    lineVRef,
    lensRef,
    lensInnerRef,
    cursorDotRef,
    capRefs,
  };
}
