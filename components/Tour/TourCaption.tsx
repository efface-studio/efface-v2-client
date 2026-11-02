"use client";

import { useMemo } from "react";
import { Square } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TourCaptionProps } from "./Tour.types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The tour's caption bar: a liquid-glass pill with the current line, lit word
 * by word as the voice reaches it — spoken words in white, the one being said
 * in accent, the rest dimmed — and a stop button. A hairline along the bottom
 * fills with the tour's overall progress.
 */
export default function TourCaption({ line, progress, index, total, stopLabel, onStop }: TourCaptionProps) {
  // Words with the character offset each starts at.
  const words = useMemo(() => {
    const out: { text: string; at: number }[] = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) out.push({ text: m[0], at: m.index });
    return out;
  }, [line]);
  const done = progress >= line.length;
  // The word being said: the last one the voice has reached.
  let current = -1;
  words.forEach((w, i) => {
    if (w.at <= progress) current = i;
  });

  return (
    <div
      data-tour-controls
      className="tour-glass fixed inset-x-4 bottom-5 z-[201] mx-auto flex max-w-3xl items-center gap-4 rounded-[28px] py-3.5 pl-5 pr-3 md:bottom-9 md:gap-5 md:py-4 md:pl-6"
    >
      <span aria-hidden className={cn("tour-eq shrink-0", done && "is-idle")}>
        <span />
        <span />
        <span />
        <span />
      </span>

      <p aria-live="polite" className="min-w-0 flex-1 text-[15px] font-medium leading-relaxed tracking-[-0.01em] md:text-[17px]">
        <span className="sr-only">{line}</span>
        <span aria-hidden>
          {words.map((w, i) => (
            <span
              key={`${i}-${w.text}`}
              className={cn(
                "transition-colors duration-200",
                i === current && !done ? "text-accent-bright" : i < current || done ? "text-fg" : "text-fg/35"
              )}
            >
              {w.text}{" "}
            </span>
          ))}
        </span>
      </p>

      <span className="hidden shrink-0 font-mono text-[11px] tracking-wider text-fg/45 sm:block">
        {`${pad(index + 1)} / ${pad(total)}`}
      </span>
      <button
        type="button"
        onClick={onStop}
        aria-label={stopLabel}
        className="tour-glass-button flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-fg/80 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
      </button>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-7 bottom-0 h-px origin-left bg-gradient-to-r from-accent/0 via-accent-bright to-accent/0 transition-transform duration-500"
        style={{ transform: `scaleX(${(index + (done ? 1 : progress / Math.max(1, line.length))) / total})` }}
      />
    </div>
  );
}
