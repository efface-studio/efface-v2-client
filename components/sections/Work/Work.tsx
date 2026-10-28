import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { STAGGER } from "@/lib/motion";
import WorkFeaturedScene from "./WorkFeaturedScene";
import WorkIconTile from "./WorkIconTile";
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

        {featured.length > 0 && <WorkFeaturedScene items={featured} />}

        <div className="mt-20 space-y-20 md:mt-28 md:space-y-28">
          {groups.map((group) => (
            <div key={group.key}>
              <Reveal>
                <div className="flex items-baseline justify-between gap-6 border-b border-line pb-4">
                  <h3 className="text-lg font-medium tracking-tight md:text-xl">{group.title}</h3>
                  <span className="font-mono text-sm text-fg-faint">
                    {String(group.projects.length).padStart(2, "0")}
                  </span>
                </div>
              </Reveal>

              <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-4 md:mt-12 md:grid-cols-6 md:gap-x-8 md:gap-y-14">
                {group.projects.map((project, i) => (
                  <li key={project.key}>
                    <Reveal delay={(i % 6) * STAGGER.tight}>
                      <article className="flex flex-col items-center text-center">
                        <div className="w-20 md:w-24">
                          <WorkIconTile name={project.name} icon={WORK_ICONS[project.key]} />
                        </div>
                        <h4 className="mt-3.5 text-sm font-medium tracking-tight md:mt-4 md:text-base">
                          {project.name}
                        </h4>
                        {project.desc && (
                          <p className="mt-1.5 line-clamp-2 break-keep text-xs leading-relaxed text-fg-dim md:text-sm">
                            {project.desc}
                          </p>
                        )}
                        {(project.field || project.year) && (
                          <p className="mt-2 text-xs text-fg-faint">
                            {[project.field, project.year].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
