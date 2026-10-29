"use client";

import { Fragment, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import WorkClients from "./WorkClients";
import WorkFeatured from "./WorkFeatured";
import WorkFeaturedRow from "./WorkFeaturedRow";
import { FEATURED_PER_ROW, WORK_CLIENTS } from "./Work.constants";
import type { WorkFeaturedSceneProps } from "./Work.types";

/**
 * Featured projects. On desktop they pin two to a row, side by side, while
 * their screenshots play; then the page scrolls down to the next row. Phones
 * pin one project at a time the same way. Reduced motion gets the plain
 * stacked list.
 */
export default function WorkFeaturedScene({ items }: WorkFeaturedSceneProps) {
  const t = useTranslations("Work.featured");
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();
  const perRow = isMobile ? 1 : FEATURED_PER_ROW;
  const rows = useMemo(() => {
    const out: (typeof items)[] = [];
    for (let i = 0; i < items.length; i += perRow) out.push(items.slice(i, i + perRow));
    return out;
  }, [items, perRow]);

  if (reduce) {
    return (
      <div className="mt-16 md:mt-24">
        <Reveal>
          <p className="label">{t("label")}</p>
        </Reveal>
        <div className="mt-6 space-y-20 md:mt-8 md:space-y-28">
          {items.map(({ feature, project }, i) => (
            <Fragment key={feature.key}>
              <WorkFeatured feature={feature} project={project} />
              {/* A shared client list shows once, after the last project using it. */}
              {feature.clients && items[i + 1]?.feature.clients !== feature.clients && (
                <WorkClients clients={WORK_CLIENTS[feature.clients] ?? []} />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-16 md:mt-24 md:space-y-24">
      {rows.map((row, i) => (
        <WorkFeaturedRow
          key={row.map((it) => it.feature.key).join("+")}
          items={row}
          index={i}
          count={rows.length}
          compact={isMobile}
        />
      ))}
    </div>
  );
}
