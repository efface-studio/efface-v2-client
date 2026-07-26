"use client";

import { useEffect, useState } from "react";

type Item = { id: string; title: string };

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Drives the policy page's motion and its sticky index:
 *  - `[data-intro]` elements (title, lead) rise in on load, staggered
 *  - `[data-sec]` sections rise in as they enter the viewport (once each)
 *  - the index highlights whichever section is currently under the header
 *
 * Lives in one component so a single rAF loop covers all three.
 */
export default function PolicyIndex({
  label,
  items,
}: {
  label: string;
  items: Item[];
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intros = Array.from(document.querySelectorAll<HTMLElement>("[data-intro]"));
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-sec]"));
    const progress = new WeakMap<HTMLElement, number>();

    let raf = 0;
    let intro = 0;
    let lastT = 0;
    let lastActive = "";

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min(0.05, (now - (lastT || now)) / 1000);
      lastT = now;
      const vh = window.innerHeight;

      intro = Math.min(1, intro + dt / 0.9);
      intros.forEach((el, i) => {
        const t = reduced ? 1 : ease(clamp((intro - i * 0.14) / 0.65, 0, 1));
        el.style.opacity = String(0.01 + 0.99 * t);
        el.style.transform = `translateY(${(1 - t) * 14}px)`;
        el.style.filter = t >= 1 ? "none" : `blur(${(1 - t) * 6}px)`;
      });

      for (const sc of secs) {
        let r = progress.get(sc) ?? 0;
        if (reduced || sc.getBoundingClientRect().top < vh * 0.88) {
          r = Math.min(1, r + (reduced ? 1 : dt / 0.7));
          progress.set(sc, r);
        }
        const t = ease(r);
        sc.style.opacity = String(0.01 + 0.99 * t);
        sc.style.transform = `translateY(${(1 - t) * 20}px)`;
        sc.style.filter = t >= 1 ? "none" : `blur(${(1 - t) * 6}px)`;
      }

      let current = secs.length ? secs[0].id : "";
      for (const s of secs) {
        if (s.getBoundingClientRect().top <= 150) current = s.id;
      }
      if (current && current !== lastActive) {
        lastActive = current;
        setActive(current);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <nav className="policy-index" aria-label={label}>
      <div className="policy-index__label">{label}</div>
      {items.map((i) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          className="policy-index__link"
          data-active={i.id === active ? "" : undefined}
        >
          {i.title}
        </a>
      ))}
    </nav>
  );
}
