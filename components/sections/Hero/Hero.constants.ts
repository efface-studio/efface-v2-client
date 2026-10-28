/** How far the hero copy lifts as the section scrolls away. */
export const COPY_LIFT: [string, string] = ["0%", "-24%"];
/** Scroll fraction over which the copy fades out entirely. */
export const COPY_FADE_END = 0.55;
/** Scroll fraction over which the scroll cue fades out. */
export const CUE_FADE_END = 0.15;

/** Left scrim — keeps the copy legible without flattening the studio light. */
export const LEFT_SCRIM =
  "bg-[linear-gradient(90deg,rgba(10,10,11,0.92)_0%,rgba(10,10,11,0.68)_28%,rgba(10,10,11,0.18)_52%,transparent_74%)]";
/** The WebGL scene's own backdrop colour, so there is no flash before it paints. */
export const SCENE_BACKDROP = "bg-[#0b0c10]";
