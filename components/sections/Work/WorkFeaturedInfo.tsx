import WorkFeaturedLinks from "./WorkFeaturedLinks";
import WorkIconTile from "./WorkIconTile";
import { WORK_ICONS } from "./Work.constants";
import type { WorkFeaturedInfoProps } from "./Work.types";

/** Icon, name, field · year, description and links — shared by the static list and
 *  the pinned scene. */
export default function WorkFeaturedInfo({ project, links }: WorkFeaturedInfoProps) {
  return (
    <>
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
      <WorkFeaturedLinks links={links} webIcon={WORK_ICONS[project.key]} />
    </>
  );
}
