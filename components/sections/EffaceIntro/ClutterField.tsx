"use client";

import type { RefObject } from "react";
import { CLUTTER, CLUTTER_COMPACT_SCALE } from "./EffaceIntro.constants";

/**
 * The clutter this section is about erasing. A radial mask painted by the
 * timeline wipes it away from the centre outward.
 */
export default function ClutterField({
  hostRef,
  compact = false,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  /** Phone scale — smaller pieces over the narrower screen. */
  compact?: boolean;
}) {
  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: -40,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      {CLUTTER.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: c.left,
            top: c.top,
            transform: `rotate(${c.rot}deg)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.src}
            alt=""
            style={{
              width: compact ? Math.round(c.w * CLUTTER_COMPACT_SCALE) : c.w,
              display: "block",
              animation: `bob ${c.dur}s ease-in-out ${c.delay}s infinite`,
              filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.45))",
            }}
          />
        </div>
      ))}
    </div>
  );
}
