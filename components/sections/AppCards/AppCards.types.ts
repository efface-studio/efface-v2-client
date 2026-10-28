import type { RefObject } from "react";
import type { CARDS } from "./AppCards.constants";

/** One card's visual spec, taken straight from `CARDS`. */
export type AppCardSpec = (typeof CARDS)[number];

/** Localised copy for a card. */
export interface AppCardCopy {
  title: string;
  sub: string;
}

export interface AppIconProps {
  src: string;
  color: string;
  size?: number;
}

export interface CardFaceProps {
  card: AppCardSpec;
  copy: AppCardCopy | undefined;
  iconSize: number;
}

/** DOM handles the pinned desktop scene animates. */
export interface AppCardsSceneRefs {
  sceneRef: RefObject<HTMLElement | null>;
  wordTopRef: RefObject<HTMLDivElement | null>;
  wordBottomRef: RefObject<HTMLDivElement | null>;
  rowRef: RefObject<HTMLDivElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
}

/** DOM handles the stacked mobile layout animates. */
export interface AppCardsMobileRefs {
  rootRef: RefObject<HTMLElement | null>;
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
}

export interface AppCardsViewProps {
  cards: AppCardCopy[];
  word1: string;
  word2: string;
}

export interface AppCardsDesktopProps extends AppCardsViewProps {
  refs: AppCardsSceneRefs;
}

export interface AppCardsMobileProps extends AppCardsViewProps {
  refs: AppCardsMobileRefs;
}
