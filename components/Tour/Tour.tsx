"use client";

import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Play, Square } from "lucide-react";
import TourCaption from "./TourCaption";
import { useTour } from "./useTour";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Auto tour" — a button in the hero that plays the site like a video: the
 * page scrolls itself, a cursor points and presses, and each line is spoken
 * (browser TTS) and captioned. Any real input takes control back.
 */
export default function Tour() {
  const t = useTranslations("Tour");
  const locale = useLocale();
  const lines = t.raw("steps") as Record<string, string>;
  const { status, index, total, step, start, stop, cursorRef, host, progress } = useTour(lines, locale);
  const playing = status === "playing";

  return (
    <>
      <button
        type="button"
        onClick={playing ? stop : start}
        className="tour-glass-button rise-in rise-d4 mt-9 inline-flex cursor-pointer items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {playing ? <Square className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
        {playing ? t("stop") : t("start")}
      </button>

      {playing &&
        createPortal(
          <>
            <div ref={cursorRef} aria-hidden className="tour-cursor pointer-events-none fixed left-0 top-0 z-[200]">
              <svg width="26" height="26" viewBox="0 0 24 24" className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                <path
                  d="M5 3l14 8-6.2 1.6L9.5 19z"
                  fill="var(--color-fg)"
                  stroke="var(--color-bg)"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="tour-cursor__ring" />
            </div>

            <TourCaption
              line={lines[step.id] ?? ""}
              progress={progress}
              index={index}
              total={total}
              stopLabel={t("stop")}
              onStop={stop}
            />
          </>,
          host ?? document.body
        )}
    </>
  );
}
