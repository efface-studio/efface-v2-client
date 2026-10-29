"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import {
  COPY_FADE_END,
  COPY_LIFT,
  CUE_FADE_END,
  LEFT_SCRIM,
  SCENE_BACKDROP,
} from "./Hero.constants";

// Live WebGL logo scene — client-only so three.js stays out of SSR and the
// initial bundle, and only mounts once the hero is on the client.
const HeroScene = dynamic(() => import("@/components/sections/HeroScene"), { ssr: false });

export default function Hero() {
  const t = useTranslations("Hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-linked parallax: the copy lifts and fades as the hero scrolls away.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], COPY_LIFT);
  const contentOpacity = useTransform(scrollYProgress, [0, COPY_FADE_END], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, CUE_FADE_END], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden bg-bg">
      {/* Background: live "glass squares" logo rendered in WebGL — stays crisp at
          any resolution (no fixed-res video to pixelate on large screens). The
          mark is framed to the right in the scene so the copy owns the lower-left.
          The placeholder behind it is the scene's own backdrop colour, so there's
          no visible swap when the canvas paints (a poster image would flash a
          different frame first). Reduced motion gets a single frozen frame. */}
      <div className={cn("pointer-events-none absolute inset-0", SCENE_BACKDROP)}>
        <HeroScene className="block h-full w-full" still={!!reduce} />
      </div>

      {/* Left scrim for legibility — eased off so the backdrop's studio light
          still reads through behind the copy. */}
      <div className={cn("pointer-events-none absolute inset-0", LEFT_SCRIM)} />
      {/* Top scrim (nav) + bottom blend into the next section. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/45 via-transparent to-bg" />

      {/* Copy — anchored lower-left. */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-6 pb-[15vh] md:px-10 md:pb-[12vh]"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-2xl">
          <h1 className="text-[2.75rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl">
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
        <span className="text-xs uppercase tracking-[0.2em] text-fg-faint">{t("scroll")}</span>
        <span className="scroll-bob inline-block h-8 w-px bg-fg-faint" aria-hidden />
      </motion.div>
    </section>
  );
}
