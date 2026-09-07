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

/** DOM handles the stacked mobile layout animates. */
export interface CapabilitiesMobileRefs {
  labelRef: RefObject<HTMLSpanElement | null>;
  headRef: RefObject<HTMLHeadingElement | null>;
  groupRefs: RefObject<(HTMLDivElement | null)[]>;
}

export interface CapabilitiesDesktopProps extends CapabilitiesCopy {
  rootRef: RefObject<HTMLElement | null>;
  refs: CapabilitiesSceneRefs;
}

export interface CapabilitiesMobileProps extends CapabilitiesCopy {
  rootRef: RefObject<HTMLElement | null>;
  refs: CapabilitiesMobileRefs;
}

export interface CapabilityCardProps {
  group: CapabilityGroup;
  /** Column index, 0–3 — picks the accent. */
  column: number;
  cardRef: (el: HTMLDivElement | null) => void;
}
