import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import type { WorkGroup } from "./Work.types";

/** Portfolio list — efface's own work and the projects we took part in. */
export default function Work() {
  const t = useTranslations("Work");
  const groups = t.raw("groups") as WorkGroup[];

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

        <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
          {groups.map((group) => (
            <Reveal key={group.key}>
              <div className="flex items-baseline justify-between gap-6 border-b border-line-strong pb-4">
                <h3 className="text-lg font-medium tracking-tight md:text-xl">{group.title}</h3>
                <span className="font-mono text-sm text-fg-faint">
                  {String(group.projects.length).padStart(2, "0")}
                </span>
              </div>

              <ol>
                {group.projects.map((project) => (
                  <li
                    key={project.name}
                    className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 border-b border-line py-5 md:grid-cols-12 md:items-baseline md:gap-x-8 md:py-6"
                  >
                    <h4 className="text-xl font-medium tracking-tight md:col-span-4 md:text-2xl">
                      {project.name}
                    </h4>
                    <span className="text-right font-mono text-sm text-fg-faint md:order-last md:col-span-1">
                      {project.year}
                    </span>
                    {project.desc && (
                      <p className="col-span-2 text-sm leading-relaxed text-fg-dim md:col-span-5 md:text-base">
                        {project.desc}
                      </p>
                    )}
                    {project.field && (
                      <p className="col-span-2 text-xs text-fg-faint md:col-span-2 md:col-start-10 md:text-sm">
                        {project.field}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
