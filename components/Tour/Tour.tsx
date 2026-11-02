"use client";

import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Pause, Play } from "lucide-react";
import TourCaption from "./TourCaption";
import { useTour } from "./useTour";

/**
 * "Auto tour" — a button in the hero that plays the site like a video: the
 * page scrolls itself, a spotlight frames what is being described, a cursor
 * points and presses, and each line is narrated and captioned. Any real input
 * pauses it; the button or the caption bar picks it up where it stopped.
 */
export default function Tour() {
  const t = useTranslations("Tour");
  const locale = useLocale();
  const lines = t.raw("steps") as Record<string, string>;
  const tour = useTour(lines, locale);
  const { status, index, total, step, start, pause, resume, close, getProgress, speed, setSpeed, volume, setVolume, cursorRef, focusRef, host } =
    tour;
  const label = status === "playing" ? t("pause") : status === "paused" ? t("resume") : t("start");

  return (
    <>
      <button
        type="button"
        data-tour-controls
        onClick={status === "playing" ? pause : status === "paused" ? resume : start}
        className="tour-glass-button rise-in rise-d4 mt-9 inline-flex cursor-pointer items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-fg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {status === "playing" ? (
          <Pause className="h-3.5 w-3.5 fill-current" aria-hidden />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
        )}
        {label}
      </button>

      {status !== "idle" &&
        createPortal(
          <>
            {/* Spotlight: a clear frame over what is being described, the rest
                of the page dimmed by its own oversized shadow. */}
            <div ref={focusRef} aria-hidden className="tour-focus pointer-events-none fixed left-0 top-0 z-[199]" />

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
              getProgress={getProgress}
              index={index}
              total={total}
              paused={status === "paused"}
              speed={speed}
              volume={volume}
              labels={{
                pause: t("pause"),
                resume: t("resume"),
                close: t("close"),
                speed: t("speed"),
                volume: t("volume"),
                mixer: t("mixer"),
                muted: t("muted"),
              }}
              onToggle={status === "paused" ? resume : pause}
              onClose={close}
              onSpeed={setSpeed}
              onVolume={setVolume}
            />
          </>,
          host ?? document.body
        )}
    </>
  );
}
