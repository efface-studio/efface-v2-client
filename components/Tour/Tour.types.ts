/** Where a step scrolls the page before (or while) it speaks. */
export interface TourScroll {
  /** Element to scroll to. */
  target: string;
  /** `start` lands the element's top under the nav; `through` scrolls from its
   *  top to its bottom while the line plays, so a pinned scene runs like video. */
  mode: "start" | "through";
}

/** What the pretend cursor does in a step. */
export interface TourPointer {
  /** Element to glide to (its centre). Omitted: the cursor drifts mid-screen. */
  target?: string;
  /** Press it once it arrives. */
  click?: boolean;
}

export interface TourStep {
  /** Message key under `Tour.steps`. */
  id: string;
  scroll?: TourScroll;
  pointer?: TourPointer;
  /** Runs after the line has played — e.g. closes the popup a click opened. */
  after?: "closeDialog";
}

export type TourStatus = "idle" | "playing";

export interface TourCursorState {
  x: number;
  y: number;
  /** Bumped on every press, to replay the ring animation. */
  press: number;
}

export interface TourCaptionProps {
  line: string;
  /** Character the voice has reached. */
  progress: number;
  index: number;
  total: number;
  stopLabel: string;
  onStop: () => void;
}
