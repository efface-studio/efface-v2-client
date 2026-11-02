"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TourCaptionProps } from "./Tour.types";

const pad = (n: number) => String(n).padStart(2, "0");
/** How many characters the lit edge spreads over behind the voice. */
const EDGE = 4;
/** Caption colours as [r, g, b, a]: unsaid, being said, said. */
const DIM = [246, 246, 247, 0.3];
const ACCENT = [97, 131, 255, 1];
const SAID = [246, 246, 247, 1];

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t);
const rgba = (c: number[]) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3].toFixed(2)})`;

/** Colour of a character the voice is `d` characters past (≤0: not yet). It
 *  warms from dim to accent over the first character, then settles to white
 *  across the edge — a continuous fill rather than per-letter switching. */
function charColor(d: number): string {
  if (d <= 0) return rgba(DIM);
  if (d < 1) return rgba(mix(DIM, ACCENT, d));
  if (d < EDGE) return rgba(mix(ACCENT, SAID, (d - 1) / (EDGE - 1)));
  return rgba(SAID);
}

/**
 * The tour's caption bar: a liquid-glass pill with the current line, filled
 * in character by character in time with the narration — said text in white,
 * the few characters being said in accent, the rest dimmed. Pause/resume and
 * close on the right; a hairline along the bottom fills with overall progress.
 *
 * The fill is painted straight onto the character spans every frame from
 * `getProgress` (fractional, so a character lights gradually), and React
 * doesn't re-render as the voice moves.
 */
export default function TourCaption({
  line,
  getProgress,
  index,
  total,
  paused,
  labels,
  onToggle,
  onClose,
}: TourCaptionProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const eqRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const chars = Array.from(textRef.current?.children ?? []) as HTMLElement[];
    const painted = chars.map(() => "");
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const p = getProgress();
      chars.forEach((el, i) => {
        const color = charColor(p - i);
        if (color !== painted[i]) {
          painted[i] = color;
          el.style.color = color;
        }
      });
      const done = p >= line.length;
      eqRef.current?.classList.toggle("is-idle", done || paused);
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${((index + Math.min(1, p / Math.max(1, line.length))) / total).toFixed(4)})`;
      }
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [line, getProgress, index, total, paused]);

  return (
    <div
      data-tour-controls
      className="tour-glass fixed inset-x-4 bottom-5 z-[201] mx-auto flex max-w-3xl items-center gap-4 rounded-[28px] py-3.5 pl-5 pr-3 md:bottom-9 md:gap-5 md:py-4 md:pl-6"
    >
      <span ref={eqRef} aria-hidden className="tour-eq shrink-0">
        <span />
        <span />
        <span />
        <span />
      </span>

      <p aria-live="polite" className="min-w-0 flex-1 break-keep text-[15px] font-medium leading-relaxed tracking-[-0.01em] md:text-[17px]">
        <span className="sr-only">{line}</span>
        <span ref={textRef} aria-hidden key={line} className="tour-caption">
          {Array.from(line).map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
      </p>

      <span className="hidden shrink-0 font-mono text-[11px] tracking-wider text-fg/45 sm:block">
        {`${pad(index + 1)} / ${pad(total)}`}
      </span>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={onToggle}
          aria-label={paused ? labels.resume : labels.pause}
          className="tour-glass-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-fg/85 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {paused ? <Play className="h-3.5 w-3.5 fill-current" aria-hidden /> : <Pause className="h-3.5 w-3.5 fill-current" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className={cn(
            "tour-glass-button flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-fg/60 hover:text-fg",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          )}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <span
        ref={barRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-7 bottom-0 h-px origin-left bg-gradient-to-r from-accent/0 via-accent-bright to-accent/0"
      />
    </div>
  );
}
