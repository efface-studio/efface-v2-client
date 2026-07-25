"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

// Live WebGL logo scene — client-only so three.js stays out of SSR and the
// initial bundle, and only mounts once the hero is on the client.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function Hero() {
  const t = useTranslations("Hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Scroll-linked parallax: the copy lifts and fades as the hero scrolls away.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-24%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden bg-bg"
    >
      {/* Background: live "glass squares" logo rendered in WebGL — stays crisp at
          any resolution (no fixed-res video to pixelate on large screens). The
          poster is a static fallback for no-WebGL / reduced-motion. The mark is
          framed to the right in the scene so the copy owns the lower-left. */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/hero-poster.jpg?v=3)" }}
      >
        {!reduce && <HeroScene className="block h-full w-full" />}
      </div>

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

          <h1 className="rise-in rise-d1 mt-6 text-[4rem] font-semibold lowercase leading-[0.95] tracking-tight sm:text-7xl md:text-8xl">
            {t("title")}
          </h1>

          <p className="mt-6 text-xl font-medium leading-[1.35] tracking-tight text-fg-dim sm:text-2xl md:mt-7 md:text-3xl">
            <span className="rise-in rise-d2 block">{t("subLine1")}</span>
            <span className="rise-in rise-d3 block">{t("subLine2")}</span>
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
