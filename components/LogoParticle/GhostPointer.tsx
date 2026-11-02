"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import type { GhostPointerProps } from "./LogoParticle.types";

/** `from` and its ancestors up to (and including) `host`. */
function chain(from: Element | null, host: Element): Element[] {
  const out: Element[] = [];
  let el: Element | null = from;
  while (el && host.contains(el)) {
    out.push(el);
    if (el === host) break;
    el = el.parentElement;
  }
  return out;
}

/**
 * A pretend cursor. It drifts around its parent on a Lissajous curve and sends
 * the element under it the same pointer/mouse events a real one would (and a
 * press now and then), so the demo plays itself until someone takes over.
 * Ported from efface-component `docs/GhostPointer`.
 */
export default function GhostPointer({ active: activeProp, click = false, clickEvery, speed = 1, className }: GhostPointerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const active = activeProp && !reduce;

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || !active) return;
    let raf = 0;
    let t = Math.random() * 20;
    let last: Element | null = null;
    let nextClick = t + 1.5;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    const init = { clientX: 0, clientY: 0, bubbles: true, pointerType: "mouse", isPrimary: true, pointerId: 1 };

    const send = (target: Element, type: string, x: number, y: number, extra: Partial<PointerEventInit> = {}) => {
      const Ctor = type.startsWith("pointer") ? PointerEvent : MouseEvent;
      target.dispatchEvent(new Ctor(type, { ...init, clientX: x, clientY: y, ...extra }));
    };
    const move = (target: Element | null, x: number, y: number) => {
      if (target !== last) {
        const from = chain(last, host);
        const to = chain(target, host);
        if (last) send(last, "mouseout", x, y, { relatedTarget: target });
        for (const a of from)
          if (!target || !a.contains(target)) send(a, "pointerleave", x, y, { bubbles: false, relatedTarget: target });
        if (last && (!target || !last.contains(target)))
          send(last, "mouseleave", x, y, { bubbles: false, relatedTarget: target });
        if (target) send(target, "mouseover", x, y, { relatedTarget: last });
        for (const a of to)
          if (!last || !a.contains(last)) send(a, "pointerenter", x, y, { bubbles: false, relatedTarget: last });
        if (target && (!last || !target.contains(last)))
          send(target, "mouseenter", x, y, { bubbles: false, relatedTarget: last });
        last = target;
      }
      if (target) {
        send(target, "pointermove", x, y);
        send(target, "mousemove", x, y);
      }
    };

    const tick = () => {
      t += 0.016 * speed;
      const r = host.getBoundingClientRect();
      const px = r.width * (0.5 + 0.4 * Math.sin(t * 0.9));
      const py = r.height * (0.5 + 0.36 * Math.sin(t * 1.37 + 1.1));
      el.style.transform = `translate(${px}px, ${py}px)`;
      const x = r.left + px;
      const y = r.top + py;
      // Rest while the spot is off screen — elementFromPoint can't see it.
      const onScreen = y > 0 && y < window.innerHeight && x > 0 && x < window.innerWidth;
      const target = onScreen ? document.elementFromPoint(x, y) : null;
      const inside = target && host.contains(target) ? target : null;
      move(inside, x, y);
      if (click && inside && t > nextClick) {
        nextClick = t + (clickEvery ?? 2.2 + Math.random() * 2);
        el.classList.add("is-down");
        later(() => el.classList.remove("is-down"), 180);
        send(inside, "pointerdown", x, y);
        send(inside, "mousedown", x, y);
        later(() => {
          send(inside, "pointerup", x, y);
          send(inside, "mouseup", x, y);
        }, 90);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      // Leave whatever it was over, so hover states reset.
      const r = host.getBoundingClientRect();
      move(null, r.left - 50, r.top - 50);
    };
  }, [active, click, clickEvery, speed]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "ghost-pointer pointer-events-none absolute left-0 top-0 z-20 will-change-transform",
        !active && "hidden",
        className
      )}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]">
        <path
          d="M5 3l14 8-6.2 1.6L9.5 19z"
          fill="var(--color-bg)"
          stroke="var(--color-fg)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span className="ghost-pointer__ring" />
    </div>
  );
}
