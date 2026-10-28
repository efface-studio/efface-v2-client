import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import Reveal from "@/components/Reveal";
import { STAGGER } from "@/lib/motion";
import WorkDetail from "./WorkDetail";
import WorkFeaturedScene from "./WorkFeaturedScene";
import WorkIconTile from "./WorkIconTile";
import WorkZoom from "./WorkZoom";
import { WORK_FEATURED, WORK_ICONS } from "./Work.constants";
import type { WorkGroup } from "./Work.types";

/** Portfolio laid out like a home screen — efface's own work and the projects we joined. */
export default function Work() {
  const t = useTranslations("Work");
  const groups = t.raw("groups") as WorkGroup[];
  const projects = groups.flatMap((group) => group.projects);
  const featured = WORK_FEATURED.flatMap((feature) => {
    const project = projects.find((p) => p.key === feature.key);
    return project ? [{ feature, project }] : [];
  });
  // Featured projects already have their own spot up top, so the grid skips them.
  const featuredKeys = new Set(featured.map((f) => f.project.key));
  const rest = projects.filter((p) => !featuredKeys.has(p.key));

  return (
    <section id="work" className="relative border-t border-line bg-bg py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="label">
            <span className="text-accent">//</span> {t("label")}
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-6 max-w-xl text-fg-dim">{t("lead")}</p>
        </Reveal>
      </div>

      {/* Featured work gets a wider measure than the rest of the section. */}
      {featured.length > 0 && (
        <div className="mx-auto max-w-[1680px] px-6 md:px-10">
          <WorkFeaturedScene items={featured} />
        </div>
      )}

      {/* The rest of the work stays folded behind "more"; each card opens its detail popup. */}
      {rest.length > 0 && (
        <details className="group/more mx-auto mt-20 max-w-[1400px] px-6 md:mt-28 md:px-10">
          {/* A home-screen folder: closed, a tile of the hidden apps in miniature;
              open, those apps laid out on a frosted folder page. */}
          <summary className="mx-auto flex w-fit cursor-pointer list-none flex-col items-center gap-4 rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            <span
              aria-hidden
              className="grid w-28 grid-cols-3 content-center gap-1.5 rounded-[26%] bg-white/[0.07] p-3.5 ring-1 ring-white/10 backdrop-blur-xl transition-transform duration-300 hover:scale-105 group-open/more:hidden md:w-32"
            >
              {rest.slice(0, 9).map((project) => (
                <WorkIconTile key={project.key} name={project.name} icon={WORK_ICONS[project.key]} />
              ))}
            </span>
            <span className="text-center">
              <span className="block text-base font-medium tracking-tight group-open/more:hidden md:text-lg">
                {t("more")}
              </span>
              <span className="mt-0.5 block font-mono text-xs text-fg-faint group-open/more:hidden">
                {String(rest.length).padStart(2, "0")}
              </span>
              <span className="hidden items-center gap-1.5 text-sm text-fg-dim transition-colors hover:text-fg group-open/more:inline-flex">
                {t("moreClose")}
                <X aria-hidden className="h-4 w-4" />
              </span>
            </span>
          </summary>

          <div className="mt-8 rounded-[2.5rem] bg-white/[0.04] p-8 ring-1 ring-white/10 backdrop-blur-xl md:p-14">
            <p className="text-center text-lg font-medium tracking-tight md:text-2xl">{t("more")}</p>
            <ul className="mt-10 grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-4 md:mt-14 md:grid-cols-6 md:gap-x-8 md:gap-y-14">
              {rest.map((project, i) => (
                <li key={project.key}>
                  <Reveal delay={Math.min(i, 6) * STAGGER.tight}>
                    <button
                      type="button"
                      data-project={project.key}
                      className="group mx-auto flex w-full cursor-pointer flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                    >
                      <span className="block w-16 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 md:w-24">
                        <WorkIconTile name={project.name} icon={WORK_ICONS[project.key]} />
                      </span>
                      <span className="mt-3 block text-sm font-medium tracking-tight md:mt-4 md:text-base">
                        {project.name}
                      </span>
                      {project.field && (
                        <span className="mt-1 block text-xs text-fg-faint">{project.field}</span>
                      )}
                    </button>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      <WorkDetail projects={projects} />
      <WorkZoom />
    </section>
  );
}
