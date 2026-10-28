import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/cn";
import { STAGGER } from "@/lib/motion";
import WorkFeaturedInfo from "./WorkFeaturedInfo";
import WorkPageFrame from "./WorkPageFrame";
import type { WorkFeaturedProps } from "./Work.types";

/** Screenshot column per shot count, sized so one shot is the same width
 *  whether a project has two or three. */
const SHOT_LAYOUT: Record<number, string> = {
  2: "grid grid-cols-2 w-2/3 md:col-span-6 md:col-start-7 md:w-auto lg:col-span-4 lg:col-start-9",
  3: "grid grid-cols-3 md:col-span-8 lg:col-span-6 lg:col-start-7",
};

/** Four or more shots scroll sideways inside the three-shot column, so each
 *  shot keeps the same width. */
const SHOT_STRIP =
  "flex snap-x snap-mandatory overflow-x-auto p-px [scrollbar-width:thin] md:col-span-8 lg:col-span-6 lg:col-start-7";
const STRIP_ITEM = "w-[calc((100%-1.5rem)/3)] shrink-0 snap-start md:w-[calc((100%-2.5rem)/3)]";

/** A featured project: its store banner (if any) up top, details and screenshots below. */
export default function WorkFeatured({ feature, project }: WorkFeaturedProps) {
  const t = useTranslations("Work.featured");
  const strip = !(feature.shots.length in SHOT_LAYOUT);

  return (
    <article>
      {feature.banner && (
        <Reveal className="mb-8 md:mb-10">
          <img
            src={feature.banner}
            alt={t("bannerAlt", { name: project.name })}
            width={2400}
            height={1350}
            loading="lazy"
            className="aspect-[16/9] w-full rounded-2xl object-cover ring-1 ring-white/10 md:rounded-3xl"
          />
        </Reveal>
      )}

      <div className="grid gap-8 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-4">
          <WorkFeaturedInfo project={project} links={feature.links} />
        </Reveal>

        {feature.page ? (
          <Reveal className="md:col-span-8 lg:col-span-6 lg:col-start-7">
            <WorkPageFrame page={feature.page} alt={t("pageAlt", { name: project.name })} />
          </Reveal>
        ) : (
          <ul
            className={cn("gap-3 md:gap-5", strip ? SHOT_STRIP : SHOT_LAYOUT[feature.shots.length])}
            {...(strip && { tabIndex: 0, "aria-label": t("shotsLabel", { name: project.name }) })}
          >
            {feature.shots.map((src, i) => (
              <li key={src} className={cn(strip && STRIP_ITEM)}>
                <Reveal delay={Math.min(i, 2) * STAGGER.tight}>
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
        )}
      </div>
    </article>
  );
}
