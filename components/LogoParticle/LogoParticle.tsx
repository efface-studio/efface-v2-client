"use client";

import { useEffect, useRef, useState } from "react";
import ParticleLogo from "./ParticleLogo";
import type { LogoParticleProps } from "./LogoParticle.types";

/**
 * The efface mark gathered out of particles, as on the design system's
 * overview (ds.efface.dev) — the pointer pushes them aside, a press bursts
 * them. The canvas only mounts while the mark is near the screen.
 */
export default function LogoParticle({ className }: LogoParticleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(!!entry?.isIntersecting), {
      rootMargin: "120px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className={className}>
      {near && <ParticleLogo src="/logo-mark.svg" gap={4} radius={80} scale={0.95} />}
    </div>
  );
}
