"use client";

import { useTranslations } from "next-intl";
import { useIsMobile } from "@/lib/useIsMobile";
import AppCardsDesktop from "./AppCardsDesktop";
import AppCardsMobile from "./AppCardsMobile";
import { useAppCardsScene } from "./useAppCardsScene";
import { useAppCardsMobileMotion } from "./useAppCardsMobileMotion";
import type { AppCardCopy } from "./AppCards.types";

/**
 * Product showcase. Desktop pins a fanned deck of app tiles that deals itself
 * out as the section scrolls; mobile stacks the same tiles at full size.
 */
export default function AppCards() {
  const t = useTranslations("AppCards");
  const cards = t.raw("cards") as AppCardCopy[];
  const word1 = t("word1");
  const word2 = t("word2");
  const isMobile = useIsMobile();

  const sceneRefs = useAppCardsScene(!isMobile);
  const mobileRefs = useAppCardsMobileMotion(isMobile);

  const copy = { cards, word1, word2 };

  return isMobile ? (
    <AppCardsMobile {...copy} refs={mobileRefs} />
  ) : (
    <AppCardsDesktop {...copy} refs={sceneRefs} />
  );
}
