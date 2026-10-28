"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import WorkClients from "./WorkClients";
import WorkFeaturedLane from "./WorkFeaturedLane";
import { FEATURED_HOLD, FEATURED_PACE_VH, WORK_CLIENTS } from "./Work.constants";
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
  const clientKeys = [...new Set(items.flatMap((it) => (it.feature.clients ? [it.feature.clients] : [])))];

  return (
    <div ref={rootRef} className="relative">
      {/* Content-height row, held near the middle of the screen; the spacer
          below is the scroll it stays pinned for. `--extra` is the height a
          client strip adds — the shots shrink by it so the row still fits. */}
      <section
        ref={stickyRef}
        className="sticky top-[max(4.5rem,calc(50vh-22rem-var(--extra)/2))] overflow-hidden"
        style={{ ["--extra" as string]: clientKeys.length ? "11rem" : "0rem" }}
      >
        <div className="flex items-baseline justify-between">
          <p className="label">{t("label")}</p>
          <span className="font-mono text-sm text-fg-faint">{`${pad(index + 1)} / ${pad(count)}`}</span>
        </div>

        {/* Two grid rows (info, media) shared by both lanes through subgrid, so
            the media lines up even when one description runs a line longer. */}
        <div className="mt-8 grid grid-cols-2 grid-rows-[auto_auto] gap-x-12 gap-y-8 lg:gap-x-16">
          {items.map((item, i) => (
            <WorkFeaturedLane key={item.feature.key} item={item} refs={lanes[i]} eager={index === 0} />
          ))}
        </div>

        {/* Lanes that share a client list (e.g. Rooti and its admin app) show
            it once, under the whole row. */}
        {clientKeys.map((key) => (
          <WorkClients key={key} clients={WORK_CLIENTS[key] ?? []} />
        ))}
      </section>
      <div
        ref={runwayRef}
        aria-hidden
        style={{ height: `${Math.round(FEATURED_PACE_VH * (Math.max(...units) + FEATURED_HOLD))}vh` }}
      />
    </div>
  );
}
