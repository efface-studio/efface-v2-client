"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import HeroScene from "@/components/sections/HeroScene";
import Tour from "@/components/Tour";
import { COPY_FADE_END } from "./Hero.constants";

export default function Hero() {
  const t = useTranslations("Hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const [copyHidden, setCopyHidden] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const contentY = useTransform(scrollYProgress, [0, COPY_FADE_END], ["0%", "-12%"]);
  const opacity = useTransform(scrollYProgress, [0, COPY_FADE_END], [1, 0]);
  const filmY = useTransform(scrollYProgress, [0, 0.35, 1], ["0%", "3%", "19%"]);
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setCopyHidden(progress >= COPY_FADE_END);
  });

  return (
    <section ref={ref} className="hero-runway relative">
      <div className="hero-stage sticky top-0 isolate overflow-hidden bg-bg">
        <motion.div aria-hidden="true" className="hero-film-layer pointer-events-none absolute inset-0" style={reduce ? undefined : { y: filmY }}>
          <HeroScene progress={scrollYProgress} />
        </motion.div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-b from-bg/30 via-bg/20 via-55% to-bg/80" />

        <motion.div
          inert={!reduce && copyHidden}
          className="hero-copy relative mx-auto grid h-full grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] justify-items-center px-5 text-center"
          style={reduce ? undefined : { y: contentY, opacity }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
