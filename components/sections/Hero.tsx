"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export default function Hero() {
  const t = useTranslations("Hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-linked parallax: the video sinks + zooms while the copy lifts and
  // fades as the hero scrolls away — the "something happens as you scroll" feel.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-24%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden bg-bg"
    >
      {/* Background: looping logo animation, nudged right so the mark sits in the
          right half and the copy owns the lower-left. Overscanned wrapper leaves
          room for the parallax translate/scale without exposing edges. */}
      <motion.div
        className="absolute -inset-[8%]"
        style={reduce ? undefined : { y: videoY, scale: videoScale }}
      >
        <video
          className="h-full w-full object-cover object-center md:[object-position:36%_50%]"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg?v=2"
          aria-hidden="true"
        >
          {/* ?v bumps the URL when the file is swapped, busting the immutable
             CDN/browser cache without renaming the asset. */}
          <source src="/hero.mp4?v=2" type="video/mp4" />
        </video>
      </motion.div>

      {/* Left scrim for legibility — strong lower-left, clears by ~72%. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#0a0a0b_0%,rgba(10,10,11,0.82)_26%,rgba(10,10,11,0.28)_50%,transparent_72%)]" />
      {/* Top scrim (nav) + bottom blend into the next section. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg" />

      {/* Copy — anchored lower-left. */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-6 pb-[15vh] md:px-10 md:pb-[12vh]"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-2xl">
          <p className="rise-in flex items-center gap-3 text-xs font-medium uppercase tracking-[0.16em] text-fg-dim md:text-sm">
            <span className="inline-block h-px w-8 bg-accent" aria-hidden />
            {t("eyebrow")}
          </p>

          <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl">
            <span className="rise-in rise-d1 block">{t("titleLine1")}</span>
            <span className="rise-in rise-d2 block">{t("titleLine2")}</span>
          </h1>

          <p className="rise-in rise-d3 mt-7 max-w-md text-base leading-relaxed text-fg-dim md:text-lg">
            {t("sub")}
          </p>
        </div>
      </motion.div>

      {/* Scroll cue (desktop) — fades on first scroll. */}
      <motion.div
        className="absolute bottom-8 right-10 z-10 hidden items-center gap-3 md:flex"
        style={reduce ? undefined : { opacity: cueOpacity }}
      >
        <span className="text-xs uppercase tracking-[0.2em] text-fg-faint">
          {t("scroll")}
        </span>
        <span className="scroll-bob inline-block h-8 w-px bg-fg-faint" aria-hidden />
      </motion.div>
    </section>
  );
}
