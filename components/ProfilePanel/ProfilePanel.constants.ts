/** Career logos by company key, background removed. Logos drawn in black take
 *  a white fill so they read on the dark panel; a company missing here falls
 *  back to its initial. efface uses `LogoMark` directly. */
export const CAREER_LOGOS: Partial<Record<string, { src: string; className?: string }>> = {
  // Slightly smaller — the heavy wordmark reads large next to the others.
  hivits: { src: "/about/career/hivits-white.svg", className: "max-h-7 max-w-14" },
  alivebrush: { src: "/about/career/alivebrush-logo.webp" },
  uslash: { src: "/about/career/uslash-logo.webp" },
  // Its navy wordmark sinks into the dark panel; lifted, not recoloured.
  gsm: { src: "/about/career/gsm-logo.webp", className: "brightness-[1.7]" },
};
