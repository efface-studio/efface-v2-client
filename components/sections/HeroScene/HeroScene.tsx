"use client";

import { useEffect, useRef } from "react";
import { createGlassScene } from "@/components/three/glassScene";
import type { HeroSceneProps } from "./HeroScene.types";

/**
 * Mounts the live WebGL "glass squares" logo onto a canvas. Client-only (loaded
 * via next/dynamic with ssr:false from the hero) so three.js stays out of the
 * server bundle and the initial HTML.
 */
export default function HeroScene({ className, still = false }: HeroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Building the scene (texture bake + shader compile) is one long task; wait
    // for the first paint to land and the main thread to go quiet, so the copy
    // shows and the page answers input before the glass appears.
    let dispose: (() => void) | undefined;
    const start = () => {
      dispose = createGlassScene(canvas, { still });
    };
    const idle = window.requestIdleCallback?.(start, { timeout: 1500 });
    const timer = idle === undefined ? window.setTimeout(start, 200) : undefined;
    return () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      dispose?.();
    };
  }, [still]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
