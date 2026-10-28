import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { STAGGER } from "@/lib/motion";
import WorkIconTile from "./WorkIconTile";
import { WORK_ICONS } from "./Work.constants";
import type { WorkFeaturedProps } from "./Work.types";

/** A featured project: its store banner up top, details and screenshots below. */
export default function WorkFeatured({ feature, project }: WorkFeaturedProps) {
  const t = useTranslations("Work.featured");

  return (
    <article>
      <Reveal>
        <img
          src={feature.banner}
          alt={t("bannerAlt", { name: project.name })}
          width={2400}
          height={1350}
          loading="lazy"
          className="aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-white/10 md:rounded-3xl"
        />
      </Reveal>

      <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-4">
          <div className="flex items-center gap-4">
            <div className="w-14 shrink-0 md:w-16">
              <WorkIconTile name={project.name} icon={WORK_ICONS[project.key]} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{project.name}</h3>
              {(project.field || project.year) && (
                <p className="mt-1 text-sm text-fg-faint">
                  {[project.field, project.year].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          {project.desc && (
            <p className="mt-5 max-w-sm break-keep leading-relaxed text-fg-dim">{project.desc}</p>
          )}
        </Reveal>

        <ul className="grid grid-cols-3 gap-3 md:col-span-8 md:gap-5 lg:col-span-6 lg:col-start-7">
          {feature.shots.map((src, i) => (
            <li key={src}>
              <Reveal delay={i * STAGGER.tight}>
                <img
                  src={src}
                  alt={t("shotAlt", { name: project.name, n: i + 1 })}
                  width={720}
                  height={1565}
                  loading="lazy"
                  className="w-full rounded-xl ring-1 ring-white/10 md:rounded-2xl"
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
