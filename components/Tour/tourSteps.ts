import type { TourStep } from "./Tour.types";

/**
 * The guided tour, top to bottom. Each step's line lives in
 * `messages/*.json` under `Tour.steps.<id>`; selectors point at the live page.
 */
export const TOUR_STEPS: TourStep[] = [
  { id: "hero", focus: "#hero-title", scroll: { target: "#top", mode: "start" }, pointer: { target: "#hero-title" } },
  { id: "efface", scroll: { target: "#efface", mode: "through" } },
  { id: "work", focus: "#work h2", scroll: { target: "#work", mode: "start" }, pointer: { target: "#work h2" } },
  {
    id: "detail",
    focus: "[data-tour='featured'] article",
    scroll: { target: "[data-tour='featured']", mode: "start" },
    pointer: { target: "[data-tour='featured'] [data-project]", click: true },
    after: "closeDialog",
  },
  { id: "featured", scroll: { target: "[data-tour='featured']", mode: "through" } },
  {
    id: "clients",
    focus: "[data-tour='clients']",
    scroll: { target: "[data-tour='clients-row']", mode: "start" },
    expand: true,
  },
  {
    id: "more",
    focus: "[data-tour='more']",
    scroll: { target: "[data-tour='more']", mode: "start" },
    pointer: { target: "[data-tour='more'] [data-project]" },
  },
  {
    id: "capabilities",
    scroll: { target: "#capabilities", mode: "through", share: 0.45 },
    pointer: { target: "#capabilities h3", each: true },
  },
  {
    id: "approach",
    focus: "#approach ul",
    scroll: { target: "#approach", mode: "start" },
    pointer: { target: "#approach h2" },
  },
  {
    id: "about",
    focus: "[data-tour='about-logo']",
    scroll: { target: "#about", mode: "start" },
    pointer: { target: "[data-tour='about-logo']", click: true, sweep: true },
  },
  {
    id: "testimonials",
    focus: "#testimonials",
    scroll: { target: "#testimonials", mode: "start" },
    pointer: { target: "#testimonials p[title]" },
  },
  {
    id: "contact",
    focus: "#contact ul",
    scroll: { target: "#contact", mode: "start" },
    // Sweeping the inbox rows stirs the ink behind them.
    pointer: { target: "#contact ul", sweep: true, linger: true },
  },
  {
    id: "footer",
    focus: "footer",
    scroll: { target: "footer", mode: "start" },
    pointer: { target: "footer canvas", sweep: true, linger: true },
  },
  {
    id: "policies",
    focus: "[data-tour='policy']",
    pointer: { target: "[data-tour='policy'] a", click: true },
    open: "/policies#privacy",
  },
  { id: "privacy", scrollPreview: true, after: "closePreview" },
];

/** Gap between the nav and a section top the tour scrolls to (px). */
export const TOUR_TOP_OFFSET = 96;
/** Room (px) the spotlight leaves around what it frames. */
export const TOUR_FOCUS_PAD = 18;
/** Pause between steps (ms). */
export const TOUR_STEP_GAP = 450;
/** How long an opened popup takes to scroll to its end, and back up (ms). */
export const TOUR_DIALOG_SCROLL_MS = 3200;
export const TOUR_DIALOG_RETURN_MS = 700;
/** Narration speed range the mixer drags across (voice and motion together). */
export const TOUR_SPEED_MIN = 0.5;
export const TOUR_SPEED_MAX = 2;
/** Time the cursor takes to read across one title, left to right (ms). */
export const TOUR_READ_MS = 1300;
/** Cursor glide time (ms). */
export const TOUR_GLIDE_MS = 900;
