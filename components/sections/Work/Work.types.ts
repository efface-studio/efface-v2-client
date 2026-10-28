import type { RefObject } from "react";

/** One project. Copy comes from messages; only `key` and `name` are required —
 *  empty fields are not rendered. */
export interface WorkProject {
  key: string;
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

/**
 * App icon art for a project. `bg` fills the tile behind the image and `inset`
 * pads it — for marks that ship without their own tile.
 */
export interface WorkIcon {
  src: string;
  bg?: string;
  inset?: boolean;
}

export interface WorkIconTileProps {
  name: string;
  icon?: WorkIcon;
}

/** Store art for a featured project: an optional wide banner and two or more
 *  portrait screenshots. */
export interface WorkFeature {
  key: string;
  banner?: string;
  shots: string[];
}

export interface WorkFeaturedProps {
  feature: WorkFeature;
  project: WorkProject;
}

export interface WorkFeaturedInfoProps {
  project: WorkProject;
}

/** A featured project paired with its copy. */
export interface WorkFeaturedItem {
  feature: WorkFeature;
  project: WorkProject;
}

export interface WorkFeaturedSceneProps {
  items: WorkFeaturedItem[];
}

/** DOM handles the pinned featured scene animates. `shotRefs` is per project,
 *  then per shot. */
export interface WorkFeaturedSceneRefs {
  rootRef: RefObject<HTMLDivElement | null>;
  counterRef: RefObject<HTMLSpanElement | null>;
  articleRefs: RefObject<(HTMLElement | null)[]>;
  trackRefs: RefObject<(HTMLUListElement | null)[]>;
  shotRefs: RefObject<(HTMLLIElement | null)[][]>;
}
