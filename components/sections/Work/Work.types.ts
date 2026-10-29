import type { RefObject } from "react";

/** One project. Copy comes from messages; only `key` and `name` are required —
 *  empty fields are not rendered. */
export interface WorkProject {
  key: string;
  name: string;
  desc?: string;
  field?: string;
  year?: string;
  /** Detail popup copy: paragraphs, then key features. */
  overview?: string[];
  features?: string[];
}

/** One layer of a project's tech stack (Web, Server, …). */
export interface WorkStackGroup {
  label: string;
  items: string[];
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
  /** The icon's key colour — tints the detail popup's backdrop gradient. */
  tint?: string;
}

export interface WorkIconTileProps {
  name: string;
  icon?: WorkIcon;
  /** Let the art open large in `WorkZoom`. */
  zoom?: boolean;
}

/** Store art for a featured project: an optional wide banner and either two or
 *  more portrait screenshots, or one long web page capture (`page`). */
export interface WorkFeature {
  key: string;
  banner?: string;
  shots: string[];
  page?: WorkPage;
  links?: WorkLinks;
  /** Key into `WORK_CLIENTS` — companies using the product. */
  clients?: string;
}

/** A company logo shown in a featured project's "used by" strip. */
export interface WorkClient {
  src: string;
  name: string;
}

export interface WorkClientsProps {
  clients: WorkClient[];
}

/** A full-length desktop page capture, shown inside a browser frame. */
export interface WorkPage {
  src: string;
  width: number;
  height: number;
}

export interface WorkPageFrameProps {
  page: WorkPage;
  alt: string;
  eager?: boolean;
  /** Show the whole page instead of cropping it to the 16:10 viewport. */
  full?: boolean;
  frameRef?: RefObject<HTMLDivElement | null>;
  imageRef?: RefObject<HTMLImageElement | null>;
}

/** Outbound links for a featured project — only the ones that exist. */
export interface WorkLinks {
  appStore?: string;
  playStore?: string;
  github?: string;
  /** A second repo when client and server are split. */
  githubServer?: string;
  web?: string;
}

export interface WorkFeaturedProps {
  feature: WorkFeature;
  project: WorkProject;
}

export interface WorkFeaturedInfoProps {
  project: WorkProject;
  links?: WorkLinks;
  /** Show a "view details" button that opens `WorkDetail`. */
  more?: boolean;
}

export interface WorkDetailProps {
  projects: WorkProject[];
}

/** A featured project paired with its copy. */
export interface WorkFeaturedItem {
  feature: WorkFeature;
  project: WorkProject;
}

export interface WorkFeaturedSceneProps {
  items: WorkFeaturedItem[];
}

export interface WorkFeaturedRowProps {
  items: WorkFeaturedItem[];
  index: number;
  count: number;
  /** Phone layout: one project per row, two shots in view. */
  compact: boolean;
}

/** DOM handles for one project (lane) inside a pinned row. */
export interface WorkLaneRefs {
  trackRef: RefObject<HTMLUListElement | null>;
  shotRefs: RefObject<(HTMLLIElement | null)[]>;
  edgeRef: RefObject<HTMLDivElement | null>;
  blurRef: RefObject<HTMLDivElement | null>;
  blurRightRef: RefObject<HTMLDivElement | null>;
  frameRef: RefObject<HTMLDivElement | null>;
  pageRef: RefObject<HTMLImageElement | null>;
}

export interface WorkFeaturedLaneProps {
  item: WorkFeaturedItem;
  refs: WorkLaneRefs;
  eager: boolean;
  /** Shots in view at once — sets each shot's width. */
  visible: number;
}

/** DOM handles one pinned row animates. */
export interface WorkFeaturedRowRefs {
  rootRef: RefObject<HTMLDivElement | null>;
  stickyRef: RefObject<HTMLElement | null>;
  runwayRef: RefObject<HTMLDivElement | null>;
  lanes: WorkLaneRefs[];
}
