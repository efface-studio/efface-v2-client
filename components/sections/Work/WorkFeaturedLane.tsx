"use client";

import { useTranslations } from "next-intl";
import WorkFeaturedInfo from "./WorkFeaturedInfo";
import WorkPageFrame from "./WorkPageFrame";
import { FEATURED_SLIDE, FEATURED_VISIBLE } from "./Work.constants";
import type { WorkFeaturedLaneProps } from "./Work.types";

/** One project inside a pinned row: details on top, its shots or page below. */
export default function WorkFeaturedLane({ item, refs, eager }: WorkFeaturedLaneProps) {
  const t = useTranslations("Work.featured");
  const { feature, project } = item;
  const strip = feature.shots.length > FEATURED_VISIBLE;

  return (
    <article aria-label={project.name} className="row-span-2 grid min-w-0 grid-rows-subgrid">
      <div>
        <WorkFeaturedInfo project={project} links={feature.links} more />
      </div>

      {/* Capped by screen height (three shots ≈ 1.38 × their height, plus the
          gaps) so a wide lane never pushes the pinned row off screen. */}
      <div className="relative max-w-[calc((100vh-21rem-var(--extra,0rem))*1.38+2rem)]">
        {feature.page ? (
          <WorkPageFrame
            page={feature.page}
            alt={t("pageAlt", { name: project.name })}
            eager={eager}
            frameRef={refs.frameRef}
            imageRef={refs.pageRef}
          />
        ) : (
          <>
            {/* `--edge-l` / `--edge-r` are driven by the scroll loop so shots fade
                out at the lane edges instead of being cut off; both sit at 0
                while everything is at rest. */}
            <div
              ref={refs.edgeRef}
              className="overflow-hidden p-px [mask-image:linear-gradient(to_right,transparent,black_var(--edge-l,0rem),black_calc(100%-var(--edge-r,0rem)),transparent)]"
            >
              <ul ref={refs.trackRef} className="flex gap-4 will-change-transform">
                {feature.shots.map((src, k) => (
                  <li
                    key={src}
                    ref={(el) => {
                      refs.shotRefs.current[k] = el;
                    }}
                    className="w-[calc((100%-2rem)/3)] shrink-0"
                    style={{ opacity: 0, transform: `translate3d(${FEATURED_SLIDE}px, 0, 0)` }}
                  >
                    <img
                      src={src}
                      alt={t("shotAlt", { name: project.name, n: k + 1 })}
                      width={720}
                      height={1565}
                      loading={eager ? "eager" : "lazy"}
                      data-zoom
                      tabIndex={0}
                      className="w-full rounded-2xl ring-1 ring-white/10"
                    />
                  </li>
                ))}
              </ul>
            </div>
            {strip && (
              <div
                ref={refs.blurRef}
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-16 backdrop-blur-[6px] [mask-image:linear-gradient(to_right,black,transparent)]"
                style={{ opacity: 0 }}
              />
            )}
            <div
              ref={refs.blurRightRef}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-16 backdrop-blur-[6px] [mask-image:linear-gradient(to_left,black,transparent)]"
              style={{ opacity: 0 }}
            />
          </>
        )}
      </div>
    </article>
  );
}
