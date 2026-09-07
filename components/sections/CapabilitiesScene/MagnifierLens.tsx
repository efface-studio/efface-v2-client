"use client";

import type { RefObject } from "react";

/**
 * The magnifier that pops over a hovered row, plus the dot that replaces the
 * cursor while it is up. Both are positioned entirely by the scene's loop —
 * this component only declares their resting appearance.
 */
export default function MagnifierLens({
  lensRef,
  lensInnerRef,
  cursorDotRef,
}: {
  lensRef: RefObject<HTMLDivElement | null>;
  lensInnerRef: RefObject<HTMLDivElement | null>;
  cursorDotRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div
        ref={lensRef}
        aria-hidden
        className="cap-lens"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 360,
          height: 120,
          borderRadius: 999,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 5,
          background: "var(--color-bg)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -12px 26px rgba(255,255,255,0.05)",
          willChange: "transform, opacity",
        }}
      >
        <div
          ref={lensInnerRef}
          style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0" }}
        />
      </div>
      <div
        ref={cursorDotRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.4)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 6,
        }}
      />
    </>
  );
}
