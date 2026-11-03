/** What a typed stretch of code does to the preview once the caret reaches it. */
export type BuildEvent = "layout" | "text" | "color" | "media";

/** One stretch of a section's code. `text` parts carry the section's copy, and
 *  their typing drives the letter-by-letter reveal in the preview. */
export interface BuildPart {
  code: string;
  event?: BuildEvent;
}

/** One file in the editor — the code that builds one block of the page. */
export interface BuildFile {
  name: string;
  /** Folder the file sits in, as the editor's explorer and breadcrumbs show it. */
  dir: "components" | "components/sections";
  parts: BuildPart[];
}

/** Where a section of the preview is on its way to finished. */
export type BuildStageName = "blank" | BuildEvent | "done";

/** Studio → preview. */
export type BuildCommand =
  | { type: "reset" }
  | { type: "enter"; sec: number }
  | { type: "stage"; sec: number; stage: BuildStageName; speed: number }
  | { type: "text"; sec: number; p: number }
  | { type: "finish" };

/** Preview → studio. */
export type BuildReply = { type: "ready"; sections: number };

/** Every message between the two carries this tag, so stray posts are ignored. */
export interface BuildEnvelope<T> {
  efface: "build";
  msg: T;
}

/** A highlighted token of the editor. */
export interface BuildToken {
  text: string;
  /** Token class, after VS Code's Dark+ scopes; `copy` is the page's own words. */
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
    | "plain"
    | "copy";
}

export type BuildStatus = "loading" | "playing" | "paused" | "done";
