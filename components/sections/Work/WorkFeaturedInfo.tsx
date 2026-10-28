import { useTranslations } from "next-intl";
import WorkFeaturedLinks from "./WorkFeaturedLinks";
import WorkIconTile from "./WorkIconTile";
import { WORK_ICONS } from "./Work.constants";
import type { WorkFeaturedInfoProps } from "./Work.types";

/** Icon, name, field · year, description and links — shared by the static list and
 *  the pinned scene. */
export default function WorkFeaturedInfo({ project, links, more }: WorkFeaturedInfoProps) {
  const t = useTranslations("Work.featured");

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="w-14 shrink-0 md:w-16">
          <WorkIconTile name={project.name} icon={WORK_ICONS[project.key]} zoom />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{project.name}</h3>
          {(project.field || project.year) && (
            <p className="mt-1 text-sm text-fg-faint">
              {[project.field, project.year].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {more && (
          <button
            type="button"
            data-project={project.key}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-center text-sm font-medium text-fg transition-colors hover:text-accent-bright focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("more")}
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path d="M4.5 2.5 8 6 4.5 9.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        )}
      </div>
      {project.desc && (
        <p className="mt-5 max-w-sm break-keep leading-relaxed text-fg-dim">{project.desc}</p>
      )}
      <WorkFeaturedLinks links={links} webIcon={WORK_ICONS[project.key]} />
    </>
  );
}
