"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import WorkFeaturedLane from "./WorkFeaturedLane";
import { FEATURED_HOLD, FEATURED_PACE_VH } from "./Work.constants";
import { laneUnits, useFeaturedRow } from "./useFeaturedRow";
import type { WorkFeaturedRowProps } from "./Work.types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A row of featured projects side by side on its own runway: it pins near the
 * middle of the screen while both projects play their shots, holds a beat, then
 * releases so the page scrolls on to the next row.
 */
export default function WorkFeaturedRow({ items, index, count }: WorkFeaturedRowProps) {
  const t = useTranslations("Work.featured");
  const units = useMemo(() => items.map((it) => laneUnits(it.feature)), [items]);
  const { rootRef, stickyRef, runwayRef, lanes } = useFeaturedRow(units, true);

  return (
    <div ref={rootRef} className="relative">
      {/* Content-height row, held near the middle of the screen; the spacer
          below is the scroll it stays pinned for. */}
      <section ref={stickyRef} className="sticky top-[max(4.5rem,calc(50vh-22rem))] overflow-hidden">
        <div className="flex items-baseline justify-between">
          <p className="label">{t("label")}</p>
          <span className="font-mono text-sm text-fg-faint">{`${pad(index + 1)} / ${pad(count)}`}</span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-12 lg:gap-16">
          {items.map((item, i) => (
            <WorkFeaturedLane key={item.feature.key} item={item} refs={lanes[i]} eager={index === 0} />
          ))}
        </div>
      </section>
      <div
        ref={runwayRef}
        aria-hidden
        style={{ height: `${Math.round(FEATURED_PACE_VH * (Math.max(...units) + FEATURED_HOLD))}vh` }}
      />
    </div>
  );
}
