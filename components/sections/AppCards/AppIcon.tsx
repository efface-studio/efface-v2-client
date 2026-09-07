"use client";

import { useEffect, useRef } from "react";
import type { AppIconProps } from "./AppCards.types";

/** Renders one 3D app tile into a canvas (WebGL, client-only, drawn once). */
export default function AppIcon({ src, color, rx, ry, rz, size = 300 }: AppIconProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    // Dynamic import keeps three.js + the SVG loader out of the initial bundle.
    import("@/components/three/appIcon3d").then(({ createAppIcon }) => {
      if (cancelled || !hostRef.current) return;
      dispose = createAppIcon(hostRef.current, { src, color, rx, ry, rz, size });
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [src, color, rx, ry, rz, size]);

  return <div ref={hostRef} style={{ width: size, height: size }} aria-hidden="true" />;
}
