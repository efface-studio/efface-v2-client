"use client";

import { useEffect } from "react";
import { BUILD_PARAM } from "./BuildMode.constants";

/**
 * Turns the page into the studio's preview when it's loaded inside the studio's
 * frame (`?build`). Anywhere else it does nothing and loads nothing.
 */
export default function BuildStage() {
  useEffect(() => {
    if (window.parent === window || !new URLSearchParams(location.search).has(BUILD_PARAM)) return;
    void import("./previewStage").then((m) => m.startBuildStage());
  }, []);
  return null;
}
