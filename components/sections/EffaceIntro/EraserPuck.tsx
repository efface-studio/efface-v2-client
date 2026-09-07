"use client";

import type { RefObject } from "react";

/** The eraser — rides the leading edge of the wipe circle. */
export default function EraserPuck({
  hostRef,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 76,
        height: 44,
        borderRadius: 14,
        background: "linear-gradient(180deg, #F2F2F5, #C6C6D0)",
        boxShadow:
          "0 14px 28px rgba(0,0,0,0.5), inset 0 -6px 10px rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.7)",
        opacity: 0,
        pointerEvents: "none",
        willChange: "transform",
      }}
    />
  );
}
