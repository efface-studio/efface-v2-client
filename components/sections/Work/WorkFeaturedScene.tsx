"use client";

import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import WorkFeatured from "./WorkFeatured";
import WorkFeaturedPinned from "./WorkFeaturedPinned";
import type { WorkFeaturedSceneProps } from "./Work.types";

/**
 * Featured projects. On desktop each one pins in turn while its screenshots
 * slide in, then the page scrolls down to the next. Mobile and reduced motion
 * get the plain stacked list.
 */
export default function WorkFeaturedScene({ items }: WorkFeaturedSceneProps) {
  const t = useTranslations("Work.featured");
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();

  if (isMobile || reduce) {
    return (
      <div className="mt-16 md:mt-24">
        <Reveal>
          <p className="label">{t("label")}</p>
        </Reveal>
        <div className="mt-6 space-y-20 md:mt-8 md:space-y-28">
          {items.map(({ feature, project }) => (
            <WorkFeatured key={feature.key} feature={feature} project={project} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-24 md:mt-24">
      {items.map((item, i) => (
        <WorkFeaturedPinned key={item.feature.key} item={item} index={i} count={items.length} />
      ))}
    </div>
  );
}
