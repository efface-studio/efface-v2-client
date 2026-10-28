"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/ui.store";

/**
 * Side effects the overlay menu owns while it is open: the page behind it must
 * not scroll, and Escape must close it. Both are global, which is why the open
 * flag lives in the UI store rather than in component state.
 */
export function useNavOverlay() {
  const isOpen = useUIStore((s) => s.isNavOpen);
  const closeNav = useUIStore((s) => s.closeNav);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeNav();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeNav]);
}
