"use client";

import { useEffect, useState } from "react";

/** Tailwind's `md` breakpoint — below this the pinned scroll scenes fall back
 *  to static stacked layouts (scaling them down makes the type unreadable). */
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * Tracks whether the viewport is below the `md` breakpoint.
 * Returns `false` during SSR and the first paint, so the desktop markup is what
 * gets pre-rendered; the mobile branch swaps in on mount.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
