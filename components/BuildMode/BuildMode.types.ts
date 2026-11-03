import type { SourceBlock } from "./excerpt";

/** What reaching a point in the code does to the preview. */
export type BuildEvent = "layout" | "text" | "color" | "media";

/** One component's source as `/build-source.json` serves it. */
export interface BuildSource {
  path: string;
  blocks: SourceBlock[];
}

/** A file of the repo as the explorer lists it. */
export interface BuildRepoEntry {
  path: string;
  /** Listed, but not opened as text (images, fonts, media). */
  binary: boolean;
}

/** What `/build-source.json` serves: the files to type, and the repo around them. */
export interface BuildSourceIndex {
  files: BuildSource[];
  tree: BuildRepoEntry[];
}

/** One file in the editor, ready to type: its code and where things happen in it. */
export interface BuildFile {
  name: string;
  /** Repo-relative path, for the explorer and breadcrumbs. */
  path: string;
  code: string;
  /** The real line number of each line of `code`. */
  lineNumbers: number[];
  /** Lines followed by folded-away code. */
  folds: number[];
  /** Offsets where the preview moves to its next stage. */
  events: { at: number; event: BuildEvent }[];
  /** Where the letters fill in: from the first of the copy the JSX renders to the last. */
  textSpan: [number, number];
  /** Typing cost of each character (indent is free, comments are skimmed). */
  cost: number[];
}

/** Where a section of the preview is on its way to finished. */
export type BuildStageName = "blank" | BuildEvent | "done";

/** Studio → preview. */
export type BuildCommand =
  | { type: "reset" }
  | { type: "enter"; sec: number }
  | { type: "stage"; sec: number; stage: BuildStageName; speed: number }
  | { type: "layout"; sec: number; p: number }
  | { type: "text"; sec: number; p: number }
  | { type: "finish" };

/** A box in the preview's viewport, in its own (unscaled) pixels. */
export interface BuildRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Preview → studio. `focus` is what's being built right now, for the camera. */
export type BuildReply = { type: "ready"; sections: number } | { type: "focus"; rect: BuildRect | null };

/** Every message between the two carries this tag, so stray posts are ignored. */
export interface BuildEnvelope<T> {
  efface: "build";
  msg: T;
}

/** A highlighted token of the editor. */
export interface BuildToken {
  text: string;
  /** Token class, after the editor theme's scopes. */
  kind:
    | "tag"
    | "component"
    | "bracket"
    | "attr"
    | "str"
    | "hex"
    | "num"
    | "comment"
    | "punct"
    | "key"
    | "keyword"
    | "control"
    | "fn"
    | "plain";
}

export type BuildStatus = "loading" | "playing" | "paused" | "done";
