"use client";

import { useRef, useState } from "react";
import { Gauge, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/cn";
import { clamp } from "@/lib/motion";
import { TOUR_SPEED_MAX, TOUR_SPEED_MIN } from "./tourSteps";
import type { TourMixerProps } from "./Tour.types";

/** Drag distance (px) that covers the whole speed or volume range. */
const RANGE_PX = 140;
/** Movement (px) below which a press counts as a tap (mute toggle). */
const TAP_PX = 3;
const SPEED_STEP = 0.05;

const snap = (v: number) => Math.round(v / SPEED_STEP) * SPEED_STEP;
const fmtSpeed = (s: number) => `${Number(s.toFixed(2))}×`;

/**
 * One liquid-glass square for the narration: drag sideways for speed, up and
 * down for volume, tap to mute. The number is the speed; the fill rising from
 * the bottom is the volume. The drag is relative and the pointer is captured,
 * so it can travel well past the little square. Arrow keys do the same.
 */
export default function TourMixer({ speed, volume, labels, onSpeed, onVolume }: TourMixerProps) {
  const drag = useRef<{ x: number; y: number; speed: number; volume: number; moved: boolean } | null>(null);
  const lastVolume = useRef(volume || 1);
  if (volume > 0) lastVolume.current = volume;
  const [active, setActive] = useState(false);

  const setSpeed = (s: number) => onSpeed(snap(clamp(s, TOUR_SPEED_MIN, TOUR_SPEED_MAX)));
  const setVolume = (v: number) => onVolume(Math.round(clamp(v, 0, 1) * 100) / 100);
  const toggleMute = () => onVolume(volume > 0 ? 0 : lastVolume.current);
  const readout = `${labels.speed} ${fmtSpeed(speed)} · ${labels.volume} ${Math.round(volume * 100)}%`;

  return (
    <div className="relative shrink-0">
      <div
        role="slider"
        tabIndex={0}
        aria-label={labels.mixer}
        aria-valuemin={TOUR_SPEED_MIN}
        aria-valuemax={TOUR_SPEED_MAX}
        aria-valuenow={speed}
        aria-valuetext={readout}
        title={labels.mixer}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, speed, volume, moved: false };
          setActive(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          const dy = d.y - e.clientY;
          if (!d.moved && Math.hypot(dx, dy) < TAP_PX) return;
          d.moved = true;
          setSpeed(d.speed + (dx / RANGE_PX) * (TOUR_SPEED_MAX - TOUR_SPEED_MIN));
          setVolume(d.volume + dy / RANGE_PX);
        }}
        onPointerUp={() => {
          if (drag.current && !drag.current.moved) toggleMute();
          drag.current = null;
          setActive(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setActive(false);
        }}
        onKeyDown={(e) => {
          const keys: Record<string, () => void> = {
            ArrowRight: () => setSpeed(speed + SPEED_STEP * 2),
            ArrowLeft: () => setSpeed(speed - SPEED_STEP * 2),
            ArrowUp: () => setVolume(volume + 0.1),
            ArrowDown: () => setVolume(volume - 0.1),
            Enter: toggleMute,
          };
          const run = keys[e.key];
          if (!run) return;
          e.preventDefault();
          run();
        }}
        className={cn(
          "tour-glass-button relative flex h-12 w-12 cursor-move touch-none select-none items-center justify-center overflow-hidden rounded-2xl",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        )}
      >
        {/* Volume, as liquid filling the square from the bottom. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent/55 to-accent-bright/25 transition-[height] duration-100"
          style={{ height: `${volume * 100}%` }}
        />
        <span aria-hidden className="relative font-mono text-[11px] font-medium text-fg">
          {volume > 0 ? fmtSpeed(speed) : labels.muted}
        </span>
      </div>

      <span
        aria-hidden
        className={cn(
          "tour-glass pointer-events-none absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] tabular-nums text-fg/90 transition-opacity",
          active ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="flex items-center gap-1">
          <Gauge className="h-3 w-3 text-fg/50" />
          {fmtSpeed(speed)}
        </span>
        <span className="flex items-center gap-1">
          {volume > 0 ? <Volume2 className="h-3 w-3 text-fg/50" /> : <VolumeX className="h-3 w-3 text-fg/50" />}
          {Math.round(volume * 100)}
        </span>
      </span>
    </div>
  );
}
