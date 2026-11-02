import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { STAGGER } from "@/lib/motion";
import WorkDetail from "./WorkDetail";
import WorkFeaturedScene from "./WorkFeaturedScene";
import WorkIconTile from "./WorkIconTile";
import WorkZoom from "./WorkZoom";
import { WORK_FEATURED, WORK_ICONS, WORK_OTHER_ORDER } from "./Work.constants";
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
  // Listed keys first, in that order; anything unlisted after them.
  const rank = (key: string) => {
    const i = WORK_OTHER_ORDER.indexOf(key);
    return i < 0 ? WORK_OTHER_ORDER.length : i;
  };
  const rest = projects.filter((p) => !featuredKeys.has(p.key)).sort((a, b) => rank(a.key) - rank(b.key));

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
        <div data-tour="featured" className="mx-auto max-w-[1680px] px-6 md:px-10">
          <WorkFeaturedScene items={featured} />
        </div>
      )}

      {/* The rest of the work: each project's own screen, its name and one
          line under it. A card opens the project's detail popup. */}
      {rest.length > 0 && (
        <div data-tour="more" className="mx-auto mt-24 max-w-[1400px] px-6 md:mt-32 md:px-10">
          <p className="label">
            <span className="text-accent">//</span> {t("otherLabel")}
          </p>
          <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {rest.map((project, i) => (
              <li key={project.key}>
                <Reveal delay={Math.min(i, 5) * STAGGER.tight}>
                  <button
                    type="button"
                    data-project={project.key}
                    className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <span className="block aspect-[16/10] overflow-hidden rounded-xl bg-surface ring-1 ring-white/10">
                      <img
                        src={`/work/${project.key}/screen-1-960.webp`}
                        alt=""
                        width={960}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </span>
                    <span className="mt-4 flex items-center gap-2.5">
                      <span className="block w-6 shrink-0">
                        <WorkIconTile name={project.name} icon={WORK_ICONS[project.key]} />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium tracking-tight">{project.name}</span>
                      {project.field && <span className="shrink-0 text-xs text-fg-faint">{project.field}</span>}
                    </span>
                    {project.desc && <span className="mt-1.5 block text-sm text-fg-dim">{project.desc}</span>}
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}

      <WorkDetail projects={projects} />
      <WorkZoom />
    </section>
  );
}
