import type { RefObject } from "react";

/** One unit of the animated sentence: a word, or a popping bead. */
export type Token =
  | { kind: "word"; text: string; strike: boolean; accent: boolean }
  | { kind: "orb"; id: string };

/** DOM handles the timeline paints into. */
export interface EffaceIntroRefs {
  rootRef: RefObject<HTMLElement | null>;
  clutterRef: RefObject<HTMLDivElement | null>;
  puckRef: RefObject<HTMLDivElement | null>;
  fitRef: RefObject<HTMLDivElement | null>;
  typeRef: RefObject<HTMLSpanElement | null>;
  defRef: RefObject<HTMLParagraphElement | null>;
  wordRefs: RefObject<(HTMLSpanElement | null)[]>;
  lineRefs: RefObject<(HTMLSpanElement | null)[]>;
  orbRefs: RefObject<(HTMLSpanElement | null)[]>;
}

export interface EffaceTimelineParams {
  tokens: Token[];
  /** Index among *word* tokens only — the stagger counts words, not orbs. */
  wordIndex: number[];
  label: string;
  definition: string;
  isMobile: boolean;
  /** Timeline position at which the last word has finished lighting. */
  timelineEnd: number;
}

export interface IntroBodyProps {
  tokens: Token[];
  label: string;
  definition: string;
  isMobile: boolean;
  refs: EffaceIntroRefs;
}
