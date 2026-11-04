/** One piece of the page the swarm rebuilds. */
export interface SwarmLayer {
  id: number;
  /** A painted box, a single-side border (drawn as a pen line), media, or a text block. */
  kind: "box" | "line" | "media" | "text";
  el: Element;
  /** The painted box this sits in; it waits for that one (-1: none). */
  parent: number;
  /** A repeated sibling: copied off this layer rather than drawn fresh. */
  master?: number;
  /** For a line: which side of the box it runs along. */
  side?: "top" | "right" | "bottom" | "left";
  /** For text: the nodes it types, and how many characters in all. */
  text?: Text[];
  chars: number;
}

export type SwarmPhase = "scan" | "orbit" | "build" | "done";

/** What the toolbar shows; the engine sends it a few times a second. */
export interface SwarmState {
  phase: SwarmPhase;
  agents: number;
  done: number;
  total: number;
  tour: boolean;
  speed: number;
  sound: boolean;
}

export type SwarmCursorMode = "arrow" | "cross" | "ibeam";
