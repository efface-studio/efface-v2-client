"use client";

import { useEffect, useRef } from "react";
import { useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import HeroScene from "@/components/sections/HeroScene";
import HeroCopy from "./HeroCopy";
import { FILM_END, FILM_START, HANDOFF_END } from "./Hero.constants";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scatter = useTransform(scrollYProgress, [0, 0.145], [0, 1]);
  const time = useTransform(scrollYProgress, [FILM_START, FILM_END], [0, 1]);
  const filmOpacity = useTransform(scrollYProgress, [FILM_END, HANDOFF_END], [1, 0]);

  // Use the same sampled progress as the video. A native scroll timeline on
  // a descendant of the sticky stage measures a different range in Chrome.
  useEffect(() => {
    const layer = film.current;
    if (!layer) return;
    const paint = () => { layer.style.opacity = reduce ? "1" : String(filmOpacity.get()); };
    paint();
    return filmOpacity.on("change", paint);
  }, [filmOpacity, reduce]);

  return (
    <section ref={ref} className="hero-runway relative isolate">
      <div className="hero-stage sticky top-0 isolate overflow-hidden bg-bg">
        <div ref={film} className="pointer-events-none absolute inset-0">
          <HeroScene progress={time} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-b from-bg/30 via-bg/20 via-55% to-bg/80" />
      </div>

      <HeroCopy scatter={scatter} reduce={reduce} />
    </section>
  );
}
