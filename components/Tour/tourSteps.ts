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
    id: "more",
    focus: "[data-tour='more']",
    scroll: { target: "[data-tour='more']", mode: "start" },
    pointer: { target: "[data-tour='more'] summary", click: true },
  },
  { id: "capabilities", scroll: { target: "#capabilities", mode: "through" } },
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
    pointer: { target: "[data-tour='about-logo']", click: true },
  },
  {
    id: "contact",
    focus: "#contact a[href^='mailto:']",
    scroll: { target: "#contact", mode: "start" },
    pointer: { target: "#contact a[href^='mailto:']" },
  },
];

/** Gap between the nav and a section top the tour scrolls to (px). */
export const TOUR_TOP_OFFSET = 96;
/** Room (px) the spotlight leaves around what it frames. */
export const TOUR_FOCUS_PAD = 18;
/** Pause between steps (ms). */
export const TOUR_STEP_GAP = 450;
/** Cursor glide time (ms). */
export const TOUR_GLIDE_MS = 900;
