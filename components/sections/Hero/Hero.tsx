"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import HeroScene from "@/components/sections/HeroScene";
import Tour from "@/components/Tour";
import { FILM_END, FILM_START, HANDOFF_END } from "./Hero.constants";

export default function Hero() {
  const t = useTranslations("Hero");
  const ref = useRef<HTMLElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
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

      {/* The headline leaves with the first screen. Only the film is pinned. */}
      <div className="hero-copy absolute inset-x-0 top-0 mx-auto grid grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] justify-items-center px-5 text-center">
        <h1 id="hero-title" className="row-start-2 w-full max-w-[7.5em] text-[clamp(2.35rem,8vw,4.5rem)] font-semibold leading-[1.04] tracking-tight">
          <span className="rise-in rise-d1 block">{t("titleLine1")}</span>
          <span className="rise-in rise-d2 block">{t("titleLine2")}</span>
        </h1>
        <div className="hero-details row-start-3 self-start">
          <p className="rise-in rise-d3 mx-auto mt-5 max-w-md text-base leading-relaxed text-fg md:mt-7 md:text-lg">
            {t("sub")}
          </p>
          <Tour />
        </div>
      </div>
    </section>
  );
}
