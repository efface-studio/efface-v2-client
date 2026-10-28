"use client";

import { useEffect, useRef } from "react";
import { clamp, easeOutBack, easeOutCubic } from "@/lib/motion";
import {
  CARD_COUNT,
  CFG,
  DEAL_PITCH,
  DEAL_Z,
  HOVER_LIFT,
  HOVER_Z,
  PARALLAX,
  ROW_FIT_HEIGHT,
  ROW_FIT_WIDTH,
  SHININESS,
  TILT_X,
  TILT_Y,
} from "./AppCards.constants";
import type { AppCardsSceneRefs } from "./AppCards.types";

const DEG = Math.PI / 180;

/** Key light: above and to the left, angled back toward the viewer. */
const LIGHT = { x: -0.3, y: -0.62, z: 1 };

/**
 * Blinn-Phong specular term for the flat card face.
 *
 * The face normal starts at +Z and is carried around by the card's yaw and
 * pitch; the half-vector between the fixed light and the viewer decides how
 * hard the highlight blooms. A few of these per frame costs nothing, and it is
 * what makes a tilt read as a surface catching light rather than a rotation.
 */
function specular(pitch: number, yaw: number): number {
  const nx = Math.sin(yaw);
  const ny = -Math.sin(pitch);
  const nz = Math.cos(yaw) * Math.cos(pitch);

  // Half-vector, with the view direction fixed at (0, 0, 1).
  const hx = LIGHT.x;
  const hy = LIGHT.y;
  const hz = LIGHT.z + 1;
  const hl = Math.hypot(hx, hy, hz) || 1;

  const d = Math.max(0, (nx * hx + ny * hy + nz * hz) / hl);
  return Math.pow(d, SHININESS);
}

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

/** Write one card's lighting vars — highlight position tracks the normal. */
function paintSurface(el: HTMLElement, pitch: number, yaw: number, glow: number): void {
  const nx = Math.sin(yaw);
  const ny = -Math.sin(pitch);
  el.style.setProperty("--spec", specular(pitch, yaw).toFixed(3));
  el.style.setProperty("--gx", `${(50 - nx * 140).toFixed(1)}%`);
  el.style.setProperty("--gy", `${(34 - ny * 120).toFixed(1)}%`);
  el.style.setProperty("--shadow-o", glow.toFixed(3));
}

/**
 * The pinned desktop scene: cards deal in through a perspective container —
 * laid back and set off along -Z, then standing up into the fan — while the two
 * oversized words parallax past each other and light up letter by letter.
 *
 * Owns its own rAF loop rather than using `usePinnedSceneMotion` because it
 * also tracks a smoothed cursor position and per-card hover between frames.
 */
export function useAppCardsScene(enabled: boolean): AppCardsSceneRefs {
  const sceneRef = useRef<HTMLElement>(null);
  const wordTopRef = useRef<HTMLDivElement>(null);
  const wordBottomRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(CARD_COUNT).fill(null));

  useEffect(() => {
    if (!enabled) return;

    // Reduced motion: put the deck down in its dealt state and stop. No loop,
    // no cursor tracking, no hover lift.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let i = 0; i < CARD_COUNT; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const c = CFG[i];
        el.style.transform = `translate3d(0px, ${c.oy}px, 0px) rotateZ(${c.rot}deg)`;
        el.style.opacity = "1";
        paintSurface(el, 0, 0, 0.5);
      }
      if (wordTopRef.current) lightLetters(wordTopRef.current, 0, 0, 1);
      if (wordBottomRef.current) lightLetters(wordBottomRef.current, 0, 0, 1);
      return;
    }

    const mouse = { x: 0, y: 0 };
    const sm = { x: 0, y: 0 };
    let raf = 0;

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouse);

    // Hover is tracked by event rather than hit-testing so the loop never has
    // to measure a card. The rAF owns the lift, so nothing competes with it.
    let hovered = -1;
    const hover: number[] = Array(CARD_COUNT).fill(0);
    const bound: { el: HTMLElement; enter: () => void; leave: () => void }[] = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const enter = () => {
        hovered = i;
      };
      const leave = () => {
        if (hovered === i) hovered = -1;
      };
      el.addEventListener("pointerenter", enter);
      el.addEventListener("pointerleave", leave);
      bound.push({ el, enter, leave });
    }

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

        // Nearer cards in the fan answer the cursor harder.
        const depth = 1 + (CARD_COUNT - 1 - i) * 0.35;

        hover[i] += ((hovered === i ? 1 : 0) - hover[i]) * 0.12;

        // Cursor tilt only takes hold once the card has finished dealing in,
        // so the entrance stays clean no matter where the pointer sits.
        const yawDeg = sm.x * TILT_Y * e;
        const pitchDeg = -sm.y * TILT_X * e;

        const x = c.dx * (1 - e) + sm.x * PARALLAX * 14 * depth;
        const y =
          c.oy + (1 - e) * vh * 0.9 + sm.y * PARALLAX * 9 * depth - hover[i] * HOVER_LIFT;
        const z = DEAL_Z * (1 - eb) + hover[i] * HOVER_Z;

        el.style.transform =
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px)` +
          ` rotateZ(${(c.rot + c.xr * (1 - eb)).toFixed(2)}deg)` +
          ` rotateY(${yawDeg.toFixed(2)}deg)` +
          ` rotateX(${(DEAL_PITCH * (1 - e) + pitchDeg).toFixed(2)}deg)`;
        el.style.opacity = String(clamp(tt * 2.5, 0, 1));

        paintSurface(el, pitchDeg * DEG, yawDeg * DEG, 0.3 + e * 0.2 + hover[i] * 0.18);
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
      for (const b of bound) {
        b.el.removeEventListener("pointerenter", b.enter);
        b.el.removeEventListener("pointerleave", b.leave);
      }
    };
  }, [enabled]);

  return { sceneRef, wordTopRef, wordBottomRef, rowRef, cardRefs };
}
