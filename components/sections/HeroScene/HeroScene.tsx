"use client";

import { useEffect, useRef } from "react";
import type { HeroSceneProps } from "./HeroScene.types";

const LANDSCAPE = "/hero-prism-transit-4k.mp4?v=2";
const PORTRAIT = "/hero-prism-transit-portrait.mp4?v=2";
const LAST_FRAME = 1 / 30;

export default function HeroScene({ progress }: HeroSceneProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const portrait = matchMedia("(orientation: portrait)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;

    // Coalesce wheel and touch input while the decoder is seeking. Its next
    // frame always comes from the latest scroll position, in either direction.
    const seek = () => {
      if (!visible || document.hidden || reduced.matches || video.seeking || !Number.isFinite(video.duration)) return;
      const target = Math.min(1, Math.max(0, progress.get())) * (video.duration - LAST_FRAME);
      if (Math.abs(video.currentTime - target) >= LAST_FRAME / 2) video.currentTime = target;
    };
    const sync = () => {
      if (reduced.matches || connection?.saveData) {
        if (video.hasAttribute("src")) {
          delete video.dataset.ready;
          video.removeAttribute("src");
          video.load();
        }
        return;
      }
      if (!visible || document.hidden) return;
      const src = portrait.matches ? PORTRAIT : LANDSCAPE;
      if (video.getAttribute("src") !== src) {
        delete video.dataset.ready;
        video.src = src;
      }
      seek();
    };

    const showFrame = () => {
      video.dataset.ready = "true";
      seek();
    };
    const showPoster = () => {
      delete video.dataset.ready;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    const unsubscribe = progress.on("change", seek);
    video.addEventListener("loadeddata", showFrame);
    video.addEventListener("seeked", seek);
    video.addEventListener("error", showPoster);
    reduced.addEventListener("change", sync);
    portrait.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      unsubscribe();
      video.removeEventListener("loadeddata", showFrame);
      video.removeEventListener("seeked", seek);
      video.removeEventListener("error", showPoster);
      reduced.removeEventListener("change", sync);
      portrait.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [progress]);

  return (
    <div data-hero-film aria-hidden="true" className="absolute inset-0">
      <picture>
        <source media="(orientation: portrait)" srcSet="/hero-prism-transit-portrait.jpg" />
        <img src="/hero-prism-transit.jpg" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      <video ref={ref} muted playsInline preload="auto" disablePictureInPicture className="absolute inset-0 h-full w-full object-cover opacity-0 data-[ready=true]:opacity-100 motion-reduce:hidden" />
    </div>
  );
}
