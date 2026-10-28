"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import WorkFeatured from "./WorkFeatured";
import WorkFeaturedRow from "./WorkFeaturedRow";
import { FEATURED_PER_ROW } from "./Work.constants";
import type { WorkFeaturedSceneProps } from "./Work.types";

/**
 * Featured projects. On desktop they pin two to a row, side by side, while
 * their screenshots play; then the page scrolls down to the next row. Mobile and reduced motion
 * get the plain stacked list.
 */
export default function WorkFeaturedScene({ items }: WorkFeaturedSceneProps) {
  const t = useTranslations("Work.featured");
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();
  const rows = useMemo(() => {
    const out: (typeof items)[] = [];
    for (let i = 0; i < items.length; i += FEATURED_PER_ROW) out.push(items.slice(i, i + FEATURED_PER_ROW));
    return out;
  }, [items]);

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
      {rows.map((row, i) => (
        <WorkFeaturedRow
          key={row.map((it) => it.feature.key).join("+")}
          items={row}
          index={i}
          count={rows.length}
        />
      ))}
    </div>
  );
}
