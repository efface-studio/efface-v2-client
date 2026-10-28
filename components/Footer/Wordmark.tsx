"use client";

import type { RefObject } from "react";

/** Oversized wordmark revealed by a cursor-driven trail — painted in canvas. */
export default function Wordmark({
  wrapRef,
  canvasRef,
}: {
  wrapRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", marginTop: 96, height: "clamp(130px, 15vw, 240px)" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
