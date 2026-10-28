"use client";

import { useCallback, useEffect, useRef } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { elementProgress, usePinnedSceneMotion, useScrollMotion } from "@/lib/scrollMotion";
import { BODY_FIT_HEIGHT, STEP, W0, WIN } from "./EffaceIntro.constants";
import type { EffaceIntroRefs, EffaceTimelineParams } from "./EffaceIntro.types";

/** Colour a word settles on once lit. */
const INK = { r: 244, g: 244, b: 246 };
const INK_ACCENT = { r: 91, g: 141, b: 255 };
const INK_DIM = { r: 51, g: 51, b: 59 };
const INK_STRUCK: [number, number, number] = [86, 86, 95];

/**
 * The scene's whole timeline in one paint pass, driven from a 0→1 progress
 * value. Kept as a single function so the desktop (pinned) and mobile
 * (position-driven) drivers stay in exact visual sync.
 */
export function useEffaceTimeline({
  tokens,
  wordIndex,
  label,
  definition,
  isMobile,
  timelineEnd,
}: EffaceTimelineParams): EffaceIntroRefs {
  const rootRef = useRef<HTMLElement>(null);
  const clutterRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSpanElement>(null);
  const defRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const orbRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const typeFull = useRef("");
  const defFull = useRef("");
  const shown = useRef({ type: -1, def: -1 });
  const puckO = useRef(0);
  const mouse = useRef({ x: -1, y: -1 });

  useEffect(() => {
    typeFull.current = label;
    defFull.current = definition;
    shown.current = { type: -1, def: -1 };
  }, [label, definition]);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  /** Paints one frame from a 0→1 scene progress value. */
  const paint = useCallback(
    (p: number) => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      if (fitRef.current && !isMobile) {
        fitRef.current.style.transform = `scale(${Math.min(1, (vh - 40) / BODY_FIT_HEIGHT)})`;
      }

      // 1. label + dictionary entry type themselves in
      if (typeRef.current) {
        const n = Math.round(clamp(p / 0.04, 0, 1) * typeFull.current.length);
        if (n !== shown.current.type) {
          typeRef.current.textContent = typeFull.current.slice(0, n);
          shown.current.type = n;
        }
      }
      if (defRef.current) {
        const n = Math.round(clamp((p - 0.05) / 0.16, 0, 1) * defFull.current.length);
        if (n !== shown.current.def) {
          defRef.current.textContent = defFull.current.slice(0, n);
          shown.current.def = n;
        }
      }

      // 2. the clutter gets wiped by a circle growing out of the centre
      const cx = vw * 0.5;
      const cy = vh * 0.44;
      const maxR = Math.hypot(vw, vh) * 0.66;
      const pm = clamp((p - 0.07) / 0.4, 0, 1);
      const R = easeOutCubic(pm) * maxR;
      if (clutterRef.current) {
        const mask = `radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,0) ${Math.max(
          0,
          R - 70
        )}px, rgba(0,0,0,1) ${R + 10}px)`;
        clutterRef.current.style.webkitMaskImage = mask;
        clutterRef.current.style.maskImage = mask;
        const mx = mouse.current.x >= 0 ? (mouse.current.x / vw) * 2 - 1 : 0;
        const my = mouse.current.y >= 0 ? (mouse.current.y / vh) * 2 - 1 : 0;
        clutterRef.current.style.transform = `translate(${mx * 10}px, ${my * 7}px)`;
      }

      // 3. the eraser rides the edge of that circle
      if (puckRef.current) {
        const ang = -0.62 + Math.sin(pm * 9) * 0.14;
        const px = cx + Math.cos(ang) * R;
        const py = cy + Math.sin(ang) * R;
        const vis = pm > 0.01 && pm < 0.97 ? 1 : 0;
        puckO.current += (vis - puckO.current) * 0.12;
        puckRef.current.style.opacity = String(puckO.current);
        puckRef.current.style.transform = `translate(${px - 38}px, ${py - 22}px) rotate(${
          -16 + Math.sin(pm * 22) * 8
        }deg)`;
      }

      // 4. sentence lights up word by word; struck words fade back to grey
      tokens.forEach((tk, i) => {
        const wi = wordIndex[i];
        if (tk.kind === "word") {
          const el = wordRefs.current[i];
          if (!el) return;
          const tt = easeOutCubic(clamp((p - W0 - wi * STEP) / WIN, 0, 1));
          const strikeAt = clamp((p - (W0 + wi * STEP + 0.055)) / 0.045, 0, 1);
          const struck = tk.strike && strikeAt > 0.55;
          let r: number, g: number, b: number;
          if (struck) {
            [r, g, b] = INK_STRUCK;
          } else {
            const to = tk.accent ? INK_ACCENT : INK;
            r = Math.round(INK_DIM.r + (to.r - INK_DIM.r) * tt);
            g = Math.round(INK_DIM.g + (to.g - INK_DIM.g) * tt);
            b = Math.round(INK_DIM.b + (to.b - INK_DIM.b) * tt);
          }
          el.style.color = `rgb(${r}, ${g}, ${b})`;

          const line = lineRefs.current[i];
          if (line) line.style.transform = `scaleX(${easeOutCubic(strikeAt)})`;
        } else {
          const el = orbRefs.current[i];
          if (!el) return;
          const tt = clamp((p - W0 - wi * STEP) / 0.05, 0, 1);
          const sc = tt === 0 ? 0 : tt * (1 + 0.3 * Math.sin(tt * Math.PI));
          el.style.transform = `scale(${sc}) rotate(${(1 - tt) * 90}deg)`;
        }
      });
    },
    [tokens, wordIndex, isMobile]
  );

  // Desktop: pinned scene driven by how far the section has scrolled.
  const pinnedFrame = useCallback((p: number) => paint(p * timelineEnd), [paint, timelineEnd]);
  usePinnedSceneMotion(rootRef, pinnedFrame, !isMobile);

  // Mobile: no pinning — the same timeline plays off the block's own position.
  const mobileFrame = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    paint(elementProgress(el, 0.95, 0.9));
  }, [paint]);
  useScrollMotion(rootRef, mobileFrame, isMobile);

  return {
    rootRef,
    clutterRef,
    puckRef,
    fitRef,
    typeRef,
    defRef,
    wordRefs,
    lineRefs,
    orbRefs,
  };
}
