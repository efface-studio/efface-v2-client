"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, X } from "lucide-react";
import { cn } from "@/lib/cn";
import TourMixer from "./TourMixer";
import type { TourCaptionProps } from "./Tour.types";

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
  speed,
  volume,
  labels,
  onToggle,
  onClose,
  onSpeed,
  onVolume,
}: TourCaptionProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLParagraphElement>(null);
  const eqRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const chars = Array.from(textRef.current?.children ?? []) as HTMLElement[];
    const painted = chars.map(() => "");
    let lineTop = -1;
    boxRef.current?.scrollTo({ top: 0 });
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
      // Where the caption box is clamped (phones), keep the line being said
      // at the top, so lines already said scroll out of view.
      const box = boxRef.current;
      const cur = chars[Math.min(chars.length - 1, Math.floor(p))];
      if (box && cur && box.scrollHeight > box.clientHeight + 1) {
        const top = cur.offsetTop;
        if (top !== lineTop) {
          lineTop = top;
          box.scrollTo({ top, behavior: "smooth" });
        }
      }
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
      // Phones get a slim bar: less padding, smaller type and buttons, no eq.
      className="tour-glass fixed inset-x-3 bottom-3 z-[201] mx-auto flex max-w-3xl items-center gap-2.5 rounded-[22px] py-2 pl-3.5 pr-2 md:inset-x-4 md:bottom-9 md:gap-5 md:rounded-[28px] md:py-4 md:pl-6"
    >
      <span ref={eqRef} aria-hidden className="tour-eq hidden shrink-0 md:inline-flex">
        <span />
        <span />
        <span />
        <span />
      </span>

      <p
        ref={boxRef}
        aria-live="polite"
        className="relative max-h-[2lh] min-w-0 flex-1 overflow-hidden break-keep text-[13px] font-medium leading-snug tracking-[-0.01em] md:max-h-none md:overflow-visible md:text-[17px] md:leading-relaxed"
      >
        <span className="sr-only">{line}</span>
        <span ref={textRef} aria-hidden key={line} className="tour-caption">
          {Array.from(line).map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
      </p>

      <div className="flex shrink-0 items-center gap-1.5">
        <TourMixer speed={speed} volume={volume} labels={labels} onSpeed={onSpeed} onVolume={onVolume} />
        <button
          type="button"
          onClick={onToggle}
          aria-label={paused ? labels.resume : labels.pause}
          className="tour-glass-button flex h-9 w-9 cursor-pointer md:h-10 md:w-10 items-center justify-center rounded-full text-fg/85 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {paused ? <Play className="h-3.5 w-3.5 fill-current" aria-hidden /> : <Pause className="h-3.5 w-3.5 fill-current" aria-hidden />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={labels.close}
          className={cn(
            "tour-glass-button flex h-9 w-9 cursor-pointer md:h-10 md:w-10 items-center justify-center rounded-full text-fg/60 hover:text-fg",
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
