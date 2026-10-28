"use client";

import { useTranslations } from "next-intl";
import WorkFeaturedInfo from "./WorkFeaturedInfo";
import { FEATURED_HOLD, FEATURED_PACE_VH, FEATURED_SLIDE } from "./Work.constants";
import { useFeaturedPin } from "./useFeaturedPin";
import type { WorkFeaturedPinnedProps } from "./Work.types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One featured project on its own runway: it pins near the middle of the
 * screen while its screenshots slide in from the right, holds a beat, then
 * releases so the page scrolls on to the next project below.
 */
export default function WorkFeaturedPinned({ item, index, count }: WorkFeaturedPinnedProps) {
  const t = useTranslations("Work.featured");
  const { feature, project } = item;
  const shots = feature.shots.length;
  const { rootRef, stickyRef, runwayRef, trackRef, shotRefs } = useFeaturedPin(shots, true);

  return (
    <div ref={rootRef} className="relative">
      {/* Content-height block, held near the middle of the screen; the spacer
          below is the scroll it stays pinned for. */}
      <article
        ref={stickyRef}
        aria-label={project.name}
        className="sticky top-[max(5rem,calc(50vh-17rem))] overflow-hidden"
      >
        <div className="flex items-baseline justify-between">
          <p className="label">{t("label")}</p>
          <span className="font-mono text-sm text-fg-faint">{`${pad(index + 1)} / ${pad(count)}`}</span>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-10">
          <div className="col-span-4">
            <WorkFeaturedInfo project={project} links={feature.links} />
          </div>

          <div className="col-span-8 overflow-hidden p-px lg:col-span-6 lg:col-start-7">
            <ul ref={trackRef} className="flex gap-5 will-change-transform">
              {feature.shots.map((src, k) => (
                <li
                  key={src}
                  ref={(el) => {
                    shotRefs.current[k] = el;
                  }}
                  className="w-[calc((100%-2.5rem)/3)] shrink-0"
                  style={{ opacity: 0, transform: `translate3d(${FEATURED_SLIDE}px, 0, 0)` }}
                >
                  <img
                    src={src}
                    alt={t("shotAlt", { name: project.name, n: k + 1 })}
                    width={720}
                    height={1565}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="w-full rounded-2xl ring-1 ring-white/10"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
      <div
        ref={runwayRef}
        aria-hidden
        style={{ height: `${Math.round(FEATURED_PACE_VH * (shots + FEATURED_HOLD))}vh` }}
      />
    </div>
  );
}
