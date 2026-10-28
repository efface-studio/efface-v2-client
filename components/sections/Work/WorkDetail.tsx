"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import WorkClients from "./WorkClients";
import WorkFeaturedLinks from "./WorkFeaturedLinks";
import WorkIconTile from "./WorkIconTile";
import WorkPageFrame from "./WorkPageFrame";
import StackMark from "@/components/StackMark";
import {
  WORK_CLIENTS,
  WORK_FEATURED,
  WORK_ICONS,
  WORK_LINKS,
  WORK_SCREENS,
  WORK_STACKS,
} from "./Work.constants";
import type { WorkDetailProps, WorkProject } from "./Work.types";

/** Desktop screen captures are 1440×900 at 2×. */
const SCREEN_W = 2880;
const SCREEN_H = 1800;

/** A collapsed description longer than this gets a "more" toggle. */
const CLAMP_CHARS = 140;

/**
 * Project popup laid out like an App Store product page — the portfolio is a home
 * screen, so its detail is the app's store page: header, a sideways screenshot
 * strip, the description, what it does, and an information grid. Any
 * `[data-project]` button opens it (delegated, so callers stay server-side);
 * images zoom via `WorkZoom`.
 */
export default function WorkDetail({ projects }: WorkDetailProps) {
  const t = useTranslations("Work.featured");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const [project, setProject] = useState<WorkProject | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const key =
        e.target.closest<HTMLElement>("[data-project]")?.dataset.project;
      const next = projects.find((p) => p.key === key);
      if (!next) return;
      setProject(next);
      setExpanded(false);
      dialogRef.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [projects]);

  const feature = project && WORK_FEATURED.find((f) => f.key === project.key);
  const icon = project ? WORK_ICONS[project.key] : undefined;
  const stack = project ? WORK_STACKS[project.key] : undefined;
  // Featured work shows its portrait store shots; the rest, desktop screen captures.
  const screens = project && !feature?.shots.length ? WORK_SCREENS[project.key] : undefined;
  const shots = feature?.shots.length ? feature.shots : (screens ?? []);
  // Each project's own colour washes in from the top corners and fades to the surface.
  const tint = icon?.tint || "var(--color-accent)";
  const backdrop = [
    `radial-gradient(90% 60% at 0% 0%, color-mix(in srgb, ${tint} 30%, transparent), transparent 70%)`,
    `radial-gradient(70% 45% at 100% 0%, color-mix(in srgb, ${tint} 14%, transparent), transparent 70%)`,
    "var(--color-surface)",
  ].join(", ");

  const overview = project?.overview ?? [];
  const clampable =
    overview.length > 1 || (overview[0]?.length ?? 0) > CLAMP_CHARS;
  const info = [
    ...(project?.field ? [{ label: t("detail.field"), items: [project.field] }] : []),
    ...(project?.year ? [{ label: t("detail.year"), items: [project.year] }] : []),
    ...(stack ?? []),
  ];

  return (
    <dialog
      ref={dialogRef}
      aria-label={project?.name}
      // A click on the dialog itself (not its content) is a click on the backdrop.
      onClick={(e) =>
        e.target === e.currentTarget && dialogRef.current?.close()
      }
      // The close event lands a task later; skip it if another project already reopened us.
      onClose={() => !dialogRef.current?.open && setProject(null)}
      style={{ background: backdrop }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-[1600px] overflow-y-auto overscroll-contain rounded-3xl bg-surface p-0 text-fg ring-1 ring-white/10 backdrop:bg-black/80 backdrop:backdrop-blur-sm md:max-h-[calc(100dvh-3rem)] md:w-[calc(100%-3rem)]"
    >
      {project && (
        <div className="relative px-6 py-8 md:px-12 md:py-12 lg:px-16">
          <form method="dialog">
            <button
              aria-label={t("zoomClose")}
              className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/5 text-fg-dim ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-fg md:right-8 md:top-8"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </form>

          {/* Header — icon, name, subtitle, links. */}
          <header className="flex items-start gap-5 pr-14 md:gap-8">
            <div className="w-20 shrink-0 md:w-32">
              <WorkIconTile name={project.name} icon={icon} zoom />
            </div>
            <div className="min-w-0">
              <h3 className="text-2xl font-semibold tracking-tight md:text-5xl">
                {project.name}
              </h3>
              {project.desc && (
                <p className="mt-2 break-keep text-fg-dim md:mt-3 md:text-xl">
                  {project.desc}
                </p>
              )}
              {(project.field || project.year) && (
                <p className="mt-1.5 text-sm text-fg-faint md:text-base">
                  {[project.field, project.year].filter(Boolean).join(" · ")}
                </p>
              )}
              <WorkFeaturedLinks
                links={feature?.links ?? WORK_LINKS[project.key]}
                webIcon={icon}
              />
            </div>
          </header>

          {/* Screenshots — a sideways strip, like the store. */}
          {shots.length > 0 && (
            <div className="group/strip relative mt-10 md:mt-14">
              {/* No bar on the strip — store-style arrow buttons page it instead,
                so a plain mouse wheel user can still move sideways. */}
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  aria-label={dir < 0 ? t("detail.prev") : t("detail.next")}
                  onClick={() => {
                    const strip = stripRef.current;
                    strip?.scrollBy({
                      left: dir * strip.clientWidth * 0.8,
                      behavior: "smooth",
                    });
                  }}
                  className={cn(
                    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 text-fg opacity-0 ring-1 ring-white/15 backdrop-blur transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover/strip:opacity-100 md:flex",
                    dir < 0 ? "-left-5" : "-right-5",
                  )}
                >
                  {dir < 0 ? (
                    <ChevronLeft aria-hidden className="h-5 w-5" />
                  ) : (
                    <ChevronRight aria-hidden className="h-5 w-5" />
                  )}
                </button>
              ))}
              <ul
                ref={stripRef}
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto [scrollbar-width:none] md:gap-8 [&::-webkit-scrollbar]:hidden"
              >
                {shots.map((src, i) => (
                  <li key={src} className="shrink-0 snap-start">
                    <img
                      src={src}
                      alt={t(screens ? "screenAlt" : "shotAlt", { name: project.name, n: i + 1 })}
                      width={screens ? SCREEN_W : 720}
                      height={screens ? SCREEN_H : 1565}
                      loading="lazy"
                      data-zoom
                      tabIndex={0}
                      className={cn(
                        "w-auto ring-1 ring-white/10",
                        // Landscape screens size off the width on phones (whole frame
                        // in view, the next one peeking in) and off the height from tablet up.
                        screens
                          ? "h-auto w-[72vw] rounded-xl md:h-[min(52vh,560px)] md:w-auto md:rounded-2xl"
                          : "h-[min(48vh,520px)] rounded-3xl",
                      )}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feature?.page && (
            <div className="mt-10 md:mt-14">
              <WorkPageFrame
                page={feature.page}
                alt={t("pageAlt", { name: project.name })}
                full
              />
            </div>
          )}

          {/* Description, folded to a few lines until asked for. */}
          {overview.length > 0 && (
            <section className="mt-10 border-t border-line pt-8 md:mt-14 md:pt-10">
              <div className="max-w-4xl space-y-4 break-keep text-lg leading-relaxed text-fg md:text-xl">
                {(expanded ? overview : overview.slice(0, 1)).map((p) => (
                  <p
                    key={p}
                    className={
                      expanded || !clampable ? undefined : "line-clamp-3"
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>
              {clampable && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-3 cursor-pointer text-base font-medium text-accent-bright hover:underline"
                >
                  {expanded ? t("detail.less") : t("detail.more")}
                </button>
              )}
            </section>
          )}

          {project.features && (
            <section className="mt-10 border-t border-line pt-8 md:mt-14 md:pt-10">
              <h4 className="text-xl font-semibold tracking-tight md:text-2xl">
                {t("detail.features")}
              </h4>
              <ul className="mt-6 grid gap-x-12 gap-y-5 md:grid-cols-2">
                {project.features.map((f) => (
                  <li
                    key={f}
                    className="break-keep text-base leading-relaxed text-fg-dim md:text-lg"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {info.length > 0 && (
            <section className="mt-10 border-t border-line pt-8 md:mt-14 md:pt-10">
              <h4 className="text-xl font-semibold tracking-tight md:text-2xl">
                {t("detail.info")}
              </h4>
              <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
                {info.map((cell) => (
                  <div key={cell.label}>
                    <dt className="text-sm text-fg-faint">{cell.label}</dt>
                    {/* Tools carry their brand mark in its own colour. */}
                    <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-base text-fg">
                      {cell.items.map((item) => {
                        return (
                          <span key={item} className="inline-flex items-center gap-2 break-keep">
                            <StackMark item={item} />
                            {item}
                          </span>
                        );
                      })}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {feature?.clients && (
            <WorkClients clients={WORK_CLIENTS[feature.clients] ?? []} />
          )}
        </div>
      )}
    </dialog>
  );
}
