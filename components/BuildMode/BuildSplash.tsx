"use client";

import LogoMark from "@/components/LogoMark";
import { cn } from "@/lib/cn";

interface BuildSplashProps {
  /** `intro` plays over the studio as it opens, `outro` as it hands back to the site. */
  phase: "intro" | "outro";
  /** Intro only: true once the studio behind is ready and the splash may lift. */
  leaving: boolean;
  caption: string;
}

/**
 * The efface splash that opens and closes build mode: the mark settles in,
 * the wordmark rises letter by letter, a caption types under it. On the way
 * in it lifts away (zooming past the viewer) once the studio is ready.
 */
export default function BuildSplash({ phase, leaving, caption }: BuildSplashProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "build-splash absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050506]",
        phase === "outro" ? "build-splash--outro" : leaving && "build-splash--leave"
      )}
    >
      <div className="build-splash__glow pointer-events-none absolute h-[60vmin] w-[60vmin] rounded-full" />
      <div className="build-splash__mark relative flex items-center gap-4">
        <LogoMark className="h-12 w-12 text-fg md:h-14 md:w-14" />
        <span className="flex text-4xl font-semibold lowercase tracking-tight md:text-5xl">
          {"efface".split("").map((ch, i) => (
            <span key={i} className="build-splash__letter inline-block" style={{ animationDelay: `${260 + i * 55}ms` }}>
              {ch}
            </span>
          ))}
        </span>
      </div>
      <p className="build-splash__caption mt-7 font-mono text-xs tracking-wide text-fg-faint">
        {caption}
        <span className="build-caret build-caret--idle ml-1.5" />
      </p>
      <span className="build-splash__bar mt-5 h-px w-40 overflow-hidden bg-white/10">
        <span className="block h-full w-1/3 bg-accent-bright" />
      </span>
    </div>
  );
}
