"use client";

import { useEffect, useState } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";

/** Seconds each stage takes. */
const INTRO_DURATION = 0.9;
const INTRO_WINDOW = 0.65;
const INTRO_STAGGER = 0.14;
const SECTION_DURATION = 0.7;
/** Viewport fraction a section must rise past before it starts revealing. */
const SECTION_TRIGGER = 0.88;
/** Distance below the sticky header at which a section becomes "current". */
const ACTIVE_OFFSET = 150;

/**
 * Drives the policy page's motion and reports the section currently under the
 * header. One rAF loop covers all three jobs:
 *  - `[data-intro]` elements (title, lead) rise in on load, staggered
 *  - `[data-sec]` sections rise in as they enter the viewport (once each)
 *  - the active section id is tracked for the index highlight
 *
 * The elements live in a server-rendered page, so they are found by attribute
 * rather than passed down as refs.
 */
export function usePolicyMotion(initialId: string): string {
  const [active, setActive] = useState(initialId);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intros = Array.from(document.querySelectorAll<HTMLElement>("[data-intro]"));
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-sec]"));
    const progress = new WeakMap<HTMLElement, number>();

    let raf = 0;
    let intro = 0;
    let lastT = 0;
    let lastActive = "";

    const paint = (el: HTMLElement, t: number, rise: number) => {
      el.style.opacity = String(0.01 + 0.99 * t);
      el.style.transform = `translateY(${(1 - t) * rise}px)`;
      el.style.filter = t >= 1 ? "none" : `blur(${(1 - t) * 6}px)`;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.05, (now - (lastT || now)) / 1000);
      lastT = now;
      const vh = window.innerHeight;

      intro = Math.min(1, intro + dt / INTRO_DURATION);
      intros.forEach((el, i) => {
        const t = reduced
          ? 1
          : easeOutCubic(clamp((intro - i * INTRO_STAGGER) / INTRO_WINDOW, 0, 1));
        paint(el, t, 14);
      });

      for (const sc of secs) {
        let r = progress.get(sc) ?? 0;
        if (reduced || sc.getBoundingClientRect().top < vh * SECTION_TRIGGER) {
          r = Math.min(1, r + (reduced ? 1 : dt / SECTION_DURATION));
          progress.set(sc, r);
        }
        paint(sc, easeOutCubic(r), 20);
      }

      let current = secs.length ? secs[0].id : "";
      for (const s of secs) {
        if (s.getBoundingClientRect().top <= ACTIVE_OFFSET) current = s.id;
      }
      if (current && current !== lastActive) {
        lastActive = current;
        setActive(current);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return active;
}
