"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import Aurora from "./Aurora";
import GhostPointer from "./GhostPointer";
import ParticleLogo from "./ParticleLogo";
import type { LogoParticleProps } from "./LogoParticle.types";

/** Aurora glows behind the mark — violet, teal, blue. */
const GLOW_COLORS = ["#7c3aed", "#14b8b0", "#2563eb"];

/**
 * The efface mark gathered out of particles over an aurora, as on the design
 * system's overview (ds.efface.dev). A pretend cursor drifts over it, nudging
 * and now and then bursting it. A real pointer takes over on entry; the pretend
 * one comes back 1.5s after it leaves. Off screen the canvases unmount, and
 * reduced motion leaves only the still mark.
 */
export default function LogoParticle({ className }: LogoParticleProps) {
  const t = useTranslations("About.mark");
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [near, setNear] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    // The pretend cursor's own pointerenter bubbles up here too — only a real
    // pointer (trusted event) counts.
    const enter = (e: PointerEvent) => {
      if (!e.isTrusted) return;
      window.clearTimeout(timer);
      setHover(true);
    };
    const leave = (e: PointerEvent) => {
      if (!e.isTrusted) return;
      timer = window.setTimeout(() => setHover(false), 1500);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    const io = new IntersectionObserver(([entry]) => setNear(!!entry?.isIntersecting), {
      rootMargin: "120px 0px",
    });
    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      io.disconnect();
    };
  }, []);

  const playing = near && !hover && !reduce;

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("relative overflow-hidden rounded-2xl border border-line bg-bg text-fg", className)}
    >
      {near && (
        <>
          <Aurora colors={GLOW_COLORS} className="opacity-60" />
          <ParticleLogo src="/logo-mark.svg" gap={4} radius={80} scale={0.95} />
          <GhostPointer active={playing} click clickEvery={7} speed={0.6} />
        </>
      )}
      <p className="pointer-events-none absolute bottom-3 right-4 font-mono text-[11px] uppercase tracking-wider text-fg-dim">
        {playing ? t("idle") : t("active")}
      </p>
    </div>
  );
}
