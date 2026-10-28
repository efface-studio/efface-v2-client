"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "motion/react";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import WorkFeatured from "./WorkFeatured";
import WorkFeaturedInfo from "./WorkFeaturedInfo";
import { FEATURED_PACE_VH, FEATURED_SLIDE } from "./Work.constants";
import { featuredTimeline, useWorkFeaturedScene } from "./useWorkFeaturedScene";
import type { WorkFeaturedSceneProps } from "./Work.types";

/**
 * Featured projects. On desktop the block pins and plays one project at a time:
 * screenshots slide in from the right as you scroll, then the next project takes
 * over. Mobile and reduced motion get the plain stacked list.
 */
export default function WorkFeaturedScene({ items }: WorkFeaturedSceneProps) {
  const t = useTranslations("Work.featured");
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();
  const pinned = !isMobile && !reduce;

  const shotCounts = useMemo(() => items.map((it) => it.feature.shots.length), [items]);
  const { total } = useMemo(() => featuredTimeline(shotCounts), [shotCounts]);
  const refs = useWorkFeaturedScene(shotCounts, pinned);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (!pinned) {
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
    <div
      ref={refs.rootRef}
      className="relative mt-16 md:mt-24"
      style={{ height: `${100 + Math.round(FEATURED_PACE_VH * total)}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="flex items-baseline justify-between">
          <p className="label">{t("label")}</p>
          <span ref={refs.counterRef} className="font-mono text-sm text-fg-faint">
            {`${pad(1)} / ${pad(items.length)}`}
          </span>
        </div>

        {/* Every project sits in the same grid cell, so the block is as tall as
            one of them and they cross-fade in place. */}
        <div className="mt-8 grid">
          {items.map(({ feature, project }, i) => (
            <article
              key={feature.key}
              ref={(el) => {
                refs.articleRefs.current[i] = el;
              }}
              aria-label={project.name}
              className="grid grid-cols-12 gap-10 [grid-area:1/1]"
              style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
            >
              <div className="col-span-4">
                <WorkFeaturedInfo project={project} />
              </div>

              <div className="col-span-8 overflow-hidden p-px lg:col-span-6 lg:col-start-7">
                <ul
                  ref={(el) => {
                    refs.trackRefs.current[i] = el;
                  }}
                  className="flex gap-5 will-change-transform"
                >
                  {feature.shots.map((src, k) => (
                    <li
                      key={src}
                      ref={(el) => {
                        refs.shotRefs.current[i][k] = el;
                      }}
                      className="w-[calc((100%-2.5rem)/3)] shrink-0"
                      style={{ opacity: 0, transform: `translate3d(${FEATURED_SLIDE}px, 0, 0)` }}
                    >
                      <img
                        src={src}
                        alt={t("shotAlt", { name: project.name, n: k + 1 })}
                        width={720}
                        height={1565}
                        loading={i === 0 ? "eager" : "lazy"}
                        className="w-full rounded-2xl ring-1 ring-white/10"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
