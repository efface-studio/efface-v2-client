import type { RefObject } from "react";

/** One capability column: a numbered discipline, its deliverables and its stack. */
export interface CapabilityGroup {
  no: string;
  title: string;
  items: string[];
  tools: string[];
}

/** Copy shared by both layouts. */
export interface CapabilitiesCopy {
  groups: CapabilityGroup[];
  label: string;
  title: string;
  lead: string;
}

/** DOM handles the pinned desktop scene animates. */
export interface CapabilitiesSceneRefs {
  spotRef: RefObject<HTMLDivElement | null>;
  fitRef: RefObject<HTMLDivElement | null>;
  typeRef: RefObject<HTMLSpanElement | null>;
  subRef: RefObject<HTMLParagraphElement | null>;
  gridWrapRef: RefObject<HTMLDivElement | null>;
  gridRef: RefObject<HTMLDivElement | null>;
  lineHRef: RefObject<HTMLDivElement | null>;
  lineVRef: RefObject<HTMLDivElement | null>;
  lensRef: RefObject<HTMLDivElement | null>;
  lensInnerRef: RefObject<HTMLDivElement | null>;
  cursorDotRef: RefObject<HTMLDivElement | null>;
  capRefs: RefObject<(HTMLDivElement | null)[]>;
}

/** DOM handles the pinned phone card stack animates. */
export interface CapabilitiesMobileRefs {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  /** Shade over each card, deepening as more cards stack on top. */
  dimRefs: RefObject<(HTMLDivElement | null)[]>;
  lensRefs: RefObject<(HTMLDivElement | null)[]>;
}

export interface CapabilitiesDesktopProps extends CapabilitiesCopy {
  rootRef: RefObject<HTMLElement | null>;
  refs: CapabilitiesSceneRefs;
}

export interface CapabilitiesMobileProps extends CapabilitiesCopy {
  rootRef: RefObject<HTMLElement | null>;
  stackRef: RefObject<HTMLDivElement | null>;
  refs: CapabilitiesMobileRefs;
  /** Reduced motion: the cards lie flat in the flow, fully shown. */
  still: boolean;
}

export interface CapabilityCardProps {
  group: CapabilityGroup;
  /** Column index, 0–3 — picks the accent. */
  column: number;
  cardRef: (el: HTMLDivElement | null) => void;
}
