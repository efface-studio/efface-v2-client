"use client";

import { useCallback, useRef, type RefObject } from "react";
import { clamp, easeOutCubic } from "@/lib/motion";
import { elementProgress, useScrollMotion } from "@/lib/scrollMotion";
import { letterSeeds } from "./capabilitiesTimeline";
import type { CapabilitiesMobileRefs } from "./Capabilities.types";

/**
 * The desktop timeline replayed against each element's own scroll position:
 * the label types itself, headline letters assemble, rows and chips stagger in.
 */
export function useCapabilitiesMobileMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean
): CapabilitiesMobileRefs {
  const labelRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
  const labelFull = useRef("");

  const frame = useCallback(() => {
    // label typing
    const lab = labelRef.current;
    if (lab) {
      if (!labelFull.current) labelFull.current = lab.textContent || "";
      const full = labelFull.current;
      const n = Math.round(elementProgress(lab, 0.9, 0.18) * full.length);
      const next = full.slice(0, n);
      if (lab.textContent !== next) lab.textContent = next;
    }

    // headline letters fly in from scattered offsets
    const head = headRef.current;
    if (head) {
      const p = elementProgress(head, 0.88, 0.42);
      const letters = head.querySelectorAll<HTMLElement>("[data-l]");
      // Same deterministic scatter as the desktop scene, at mobile amplitude.
      const seeds = letterSeeds(letters.length, 70, 46, 42);
      letters.forEach((el, i) => {
        const t = easeOutCubic(clamp((p - i * 0.012) / 0.5, 0, 1));
        const u = 1 - t;
        const sd = seeds[i];
        el.style.transform = `translate(${u * sd.dx}px, ${u * sd.dy}px) rotate(${
          u * sd.rot
        }deg) scale(${0.75 + 0.25 * t})`;
        el.style.opacity = String(clamp(0.1 + t * 1.4, 0, 1));
        el.style.filter = u > 0.03 ? `blur(${u * 4}px)` : "none";
      });
    }

    // rows, dashes and chips stagger per group
    groupRefs.current.forEach((g) => {
      if (!g) return;
      const p = elementProgress(g, 0.9, 0.4);
      g.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
        const t = easeOutCubic(clamp((p - i * 0.09) / 0.4, 0, 1));
        row.style.opacity = String(t);
        row.style.transform = `translateX(${(1 - t) * -14}px)`;
        const dash = row.querySelector<HTMLElement>("[data-dash]");
        if (dash) dash.style.transform = `scaleX(${t})`;
      });
      g.querySelectorAll<HTMLElement>("[data-chip]").forEach((chip, i) => {
        const t = easeOutCubic(clamp((p - 0.35 - i * 0.05) / 0.35, 0, 1));
        chip.style.opacity = String(t);
        chip.style.transform = `scale(${0.82 + 0.18 * t})`;
      });
    });
  }, []);

  useScrollMotion(rootRef, frame, enabled);

  return { labelRef, headRef, groupRefs };
}
