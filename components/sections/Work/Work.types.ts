/** One project row. Only `name` is required — empty fields are not rendered. */
export interface WorkProject {
  name: string;
  desc?: string;
  field?: string;
  year?: string;
}

/** A titled group of projects (efface's own work / projects we joined). */
export interface WorkGroup {
  key: string;
  title: string;
  projects: WorkProject[];
}
