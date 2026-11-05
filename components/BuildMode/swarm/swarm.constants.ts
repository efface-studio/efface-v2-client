/** Most layers a page is read into (very long pages stop there). */
export const SWARM_MAX_LAYERS = 2400;
/** Boxes smaller than this (px, either side) aren't drawn. */
export const SWARM_MIN_BOX = 6;

/** Agents at the start, and the most that join while the backlog grows. */
export const SWARM_AGENTS = 14;
export const SWARM_MAX_AGENTS = 26;
/** Cursor colours, one per agent in turn. */
export const SWARM_COLORS = [
  "#ff5b4f", "#ff9f1a", "#ffd23f", "#2ec27e", "#14b8a6", "#0d99ff",
  "#3b62e5", "#8b5cf6", "#d946ef", "#f43f5e", "#22c55e", "#06b6d4",
];
/** Initials on the toolbar's avatars. */
export const SWARM_INITIALS = ["E", "F", "F", "A", "C"];

/** Selection blue and guide red, as in a design tool. */
export const SWARM_BLUE = "#0d99ff";
export const SWARM_RED = "#ff3b30";

/** Timings at 1× (ms). */
export const SWARM_FADE_MS = 350;
export const SWARM_ORBIT_MS = 1600;
export const SWARM_FAN_MS = 450;
export const SWARM_DRAG_MS = 420;
export const SWARM_REVEAL_MS = 380;
export const SWARM_SWEEP_MS = 700;
/** Typing: characters a second for one agent, and the longest a block may take. */
export const SWARM_TYPE_CPS = 34;
export const SWARM_TYPE_MAX_MS = 2200;
/** Carrying the page's own motion: most agents on it at once, the reach to grab, the longest hold. */
export const SWARM_MAX_CARRY = 6;
export const SWARM_CARRY_REACH_MS = 220;
export const SWARM_CARRY_MAX_MS = 2600;
/** During the build, an agent with nothing to do this long goes to rest in the house. */
export const SWARM_REST_MS = 700;
/** Through the door: how near it starts, how long going in and coming out take (ms). */
export const SWARM_DOOR_REACH = 22;
export const SWARM_ENTER_MS = 340;
export const SWARM_EXIT_MS = 280;
/** In the finale, the cursors go home once the pointer has rested this long. */
export const SWARM_HOME_IDLE_MS = 1200;
/** The site's pages, in the order a run goes through them (from wherever it starts). Just the
 *  page it starts on for now; the engine can turn to more (see `turn`). */
export const SWARM_ROUTES: readonly string[] = [];
/** The whole run, splash and every page included (ms at 1×). */
export const SWARM_DURATION_MS = 90_000;
/** Pacing: where it starts and its bounds (multiples of the 1× timings). */
export const SWARM_PACE_START = 1.6;
export const SWARM_PACE_MIN = 0.5;
export const SWARM_PACE_MAX = 12;
/** The first page's share of the build time (the rest goes to the pages after), and a page turn's length. */
export const SWARM_FIRST_SHARE = 0.74;
export const SWARM_TURN_MS = 1100;
/** On the first page, how long each block takes against its height: the opening gets
 *  more time to be watched, the reviews and footer go by quicker. */
export const SWARM_WEIGHTS: Record<string, number> = {
  hero: 2.6,
  efface: 1.4,
  testimonials: 0.4,
  footer: 0.9,
};
/** Speeds the toolbar offers. */
export const SWARM_SPEEDS = [1, 2, 3];

/** Layers count as on screen within this band of the viewport (shares of its height). */
export const SWARM_VIEW_TOP = -0.2;
export const SWARM_VIEW_BOTTOM = 1.1;
/** Tour: the build front is kept at this share of the viewport, scrolling at most this fast (px/s). */
export const SWARM_TOUR_FRONT = 0.42;
export const SWARM_TOUR_MAX = 520;
/** …and this fast over stretches with nothing left to build on screen. */
export const SWARM_TOUR_EMPTY = 950;
/** Width below which the rulers stay away (they'd crowd a phone). */
export const SWARM_RULERS_FROM = 768;
export const SWARM_RULER = 20;
