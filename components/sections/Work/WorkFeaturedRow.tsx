"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import WorkClients from "./WorkClients";
import WorkFeaturedLane from "./WorkFeaturedLane";
import { cn } from "@/lib/cn";
import {
  FEATURED_HOLD,
  FEATURED_PACE_VH,
  FEATURED_VISIBLE,
  FEATURED_VISIBLE_COMPACT,
  WORK_CLIENTS,
} from "./Work.constants";
import { laneUnits, useFeaturedRow } from "./useFeaturedRow";
import type { WorkFeaturedRowProps } from "./Work.types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A row of featured projects side by side on its own runway: it pins near the
 * middle of the screen while both projects play their shots, holds a beat, then
 * releases so the page scrolls on to the next row.
 *
 * `compact` is the phone version: one project per row with two shots in view,
 * and the client strip moved below the pin so the row fits a phone screen.
 */
export default function WorkFeaturedRow({ items, index, count, compact }: WorkFeaturedRowProps) {
  const t = useTranslations("Work.featured");
  const units = useMemo(() => items.map((it) => laneUnits(it.feature)), [items]);
  const visible = compact ? FEATURED_VISIBLE_COMPACT : FEATURED_VISIBLE;
  const { rootRef, stickyRef, runwayRef, lanes } = useFeaturedRow(units, visible, true);
  const clientKeys = [...new Set(items.flatMap((it) => (it.feature.clients ? [it.feature.clients] : [])))];
  const clients = clientKeys.map((key) => <WorkClients key={key} clients={WORK_CLIENTS[key] ?? []} />);

  return (
    <div ref={rootRef} className="relative">
      {/* Content-height row, held near the middle of the screen; the spacer
          below is the scroll it stays pinned for. `--extra` is the height a
          client strip adds — the shots shrink by it so the row still fits. */}
      <section
        ref={stickyRef}
        className={cn(
          "sticky overflow-hidden",
          compact
            ? "top-[max(4.5rem,calc(50svh-20rem))]"
            : "top-[max(4.5rem,calc(50vh-22rem-var(--extra)/2))]"
        )}
        style={{ ["--extra" as string]: clientKeys.length && !compact ? "11rem" : "0rem" }}
      >
        <div className="flex items-baseline justify-between">
          <p className="label">{t("label")}</p>
          <span className="font-mono text-sm text-fg-faint">{`${pad(index + 1)} / ${pad(count)}`}</span>
        </div>

        {/* Two grid rows (info, media) shared by both lanes through subgrid, so
            the media lines up even when one description runs a line longer. */}
        <div
          className={cn(
            "grid grid-rows-[auto_auto] gap-y-8",
            compact ? "mt-6 grid-cols-1 gap-y-6" : "mt-8 grid-cols-2 gap-x-12 lg:gap-x-16"
          )}
        >
          {items.map((item, i) => (
            <WorkFeaturedLane
              key={item.feature.key}
              item={item}
              refs={lanes[i]}
              eager={index === 0}
              visible={visible}
            />
          ))}
        </div>

        {/* Lanes that share a client list (e.g. Rooti and its admin app) show
            it once, under the whole row. */}
        {!compact && clients}
      </section>
      <div
        ref={runwayRef}
        aria-hidden
        style={{ height: `${Math.round(FEATURED_PACE_VH * (Math.max(...units) + FEATURED_HOLD))}vh` }}
      />
      {/* On a phone the strip would push the pinned row off screen, so it
          follows the row once the pin releases instead. */}
      {compact && clientKeys.length > 0 && (
        <div className="-mt-8 overflow-hidden">{clients}</div>
      )}
    </div>
  );
}
