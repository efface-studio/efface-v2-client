import type { RefObject } from "react";

/** One `label: value` line in a meta column. */
export interface FooterRow {
  k: string;
  v: string;
  href?: string;
}

export interface FooterGroup {
  label: string;
  rows: FooterRow[];
}

export interface FooterPolicy {
  t: string;
  href: string;
  strong?: boolean;
}

export interface FooterBottomLink {
  t: string;
  href: string;
}

/** A tagline split around its `~struck~` word. */
export interface FooterTagline {
  before: string;
  struck: string;
  after: string;
}

/** DOM handles the footer's entrance sequence paints into. */
export interface FooterRefs {
  rootRef: RefObject<HTMLElement | null>;
  wipeRef: RefObject<HTMLDivElement | null>;
  headRef: RefObject<HTMLDivElement | null>;
  metaRef: RefObject<HTMLDivElement | null>;
  strikeRef: RefObject<HTMLSpanElement | null>;
  barRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cwrapRef: RefObject<HTMLDivElement | null>;
}
