import { clamp, easeOutCubic, fract } from "@/lib/motion";
import { ACCENTS } from "./Capabilities.constants";

/** Everything the loop needs to know about one card, resolved once on mount. */
export interface CardHandles {
  card: HTMLDivElement;
  /** `r,g,b` triplet for the hover glow. */
  acc: string;
  glow: HTMLElement | null;
  head: HTMLElement | null;
  rows: HTMLElement[];
  dashes: HTMLElement[];
  chips: HTMLElement[];
  chipsRow: HTMLElement | null;
  /** Smoothed cursor tilt and hover weight, carried between frames. */
  sx: number;
  sy: number;
  h: number;
}

/** Scatter offset one headline letter flies in from. */
export interface LetterSeed {
  dx: number;
  dy: number;
  rot: number;
}

/**
 * Entrance progress of card `c` at scene progress `p` — the lens gate and the
 * card transform both read this, so they can never disagree.
 */
export const cardProgress = (c: number, p: number): number =>
  easeOutCubic(clamp((p - 0.4 - c * 0.07) / 0.22, 0, 1));

/**
 * Deterministic scatter offsets, hashed from the letter index rather than
 * drawn from `Math.random` — the same glyph starts in the same place on every
 * render, so SSR and a remount agree.
 */
export function letterSeeds(count: number, spreadX: number, spreadY: number, spreadRot: number) {
  return Array.from({ length: count }, (_, i) => ({
    dx: (fract(Math.sin(i * 127.1) * 43758.5) * 2 - 1) * spreadX,
    dy: (fract(Math.sin(i * 311.7) * 12543.2) * 2 - 1) * spreadY,
    rot: (fract(Math.sin(i * 74.3) * 9631.1) * 2 - 1) * spreadRot,
  })) satisfies LetterSeed[];
}

/** Resolves each card's animated parts once, so the loop never queries the DOM. */
export function collectCardHandles(
  cards: (HTMLDivElement | null)[]
): (CardHandles | null)[] {
  return cards.map((card, i) => {
    if (!card) return null;
    const chip = card.querySelector<HTMLElement>("[data-chip]");
    return {
      card,
      acc: ACCENTS[i].rgb,
      glow: card.querySelector<HTMLElement>("[data-glow]"),
      head: card.querySelector("h3")?.parentElement ?? null,
      rows: Array.from(card.querySelectorAll<HTMLElement>("[data-row]")),
      dashes: Array.from(card.querySelectorAll<HTMLElement>("[data-dash]")),
      chips: Array.from(card.querySelectorAll<HTMLElement>("[data-chip]")),
      chipsRow: chip?.parentElement ?? null,
      sx: 0,
      sy: 0,
      h: 0,
    };
  });
}
