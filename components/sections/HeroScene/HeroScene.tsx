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
    const dispose = createGlassScene(canvas, { still });
    return () => dispose();
  }, [still]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
