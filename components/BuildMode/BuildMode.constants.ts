import type { BuildPlanEntry } from "./BuildMode.types";

/** Query flag that turns a page into the studio's preview stage. */
export const BUILD_PARAM = "build";

/** Where the studio fetches the source it types (see app/build-source.json),
 *  and any other repo file the editor opens (see app/build-source/[...path]). */
export const BUILD_SOURCE_URL = "/build-source.json";
export const REPO_FILE_URL = "/build-source/";

/**
 * The source typed out, in page order, and what each builds in the preview:
 * `sec` is the block; `regions` builds the block's parts one after another as
 * the page scrolls through them; `detail` opens a view (by clicking it) and
 * builds that; `grow` is one animated piece of the block, kept back until its
 * own file grows it. `pace` sets each file's typing speed against the default:
 * the regions type slower so each part gets its moment; the long detail and
 * animation files pour in faster. `speed` plays a whole file faster, its
 * letters included (`pace` alone still waits on the letters).
 */
export const BUILD_SOURCES: { path: string; plan: BuildPlanEntry; pace?: number; speed?: number; whole?: boolean }[] = [
  { path: "components/sections/Hero/Hero.tsx", plan: { sec: 0 } },
  { path: "components/three/glassScene.ts", plan: { sec: 0, grow: "main > section:first-of-type canvas", land: true }, pace: 5, whole: true },
  { path: "components/sections/EffaceIntro/EffaceIntro.tsx", plan: { sec: 1 } },
  {
    path: "components/sections/Work/Work.tsx",
    plan: { sec: 2, regions: '#work > div:first-child, [data-tour="featured"] > div > *, [data-tour="more"]' },
    pace: 0.7,
    speed: 1.8,
  },
  { path: "components/sections/Work/WorkDetail.tsx", plan: { sec: 2, detail: "#work [data-tour='more'] button[data-project]" }, pace: 1.8 },
  { path: "components/sections/CapabilitiesScene/CapabilitiesDesktop.tsx", plan: { sec: 3 } },
  { path: "components/sections/Approach/Approach.tsx", plan: { sec: 4 } },
  { path: "components/sections/About/About.tsx", plan: { sec: 5 } },
  { path: "components/LogoParticle/ParticleLogo.tsx", plan: { sec: 5, grow: '[data-tour="about-logo"]' }, pace: 3, whole: true },
  { path: "components/sections/Testimonials/Testimonials.tsx", plan: { sec: 6 } },
  { path: "components/sections/Contact/Contact.tsx", plan: { sec: 7 } },
  { path: "components/FluidInk/FluidInk.tsx", plan: { sec: 7, grow: "#contact canvas" }, pace: 4.5, whole: true },
  { path: "components/Footer/Footer.tsx", plan: { sec: 8 } },
  { path: "components/Footer/wordmarkCanvas.ts", plan: { sec: 8, grow: "footer canvas" }, pace: 3, whole: true },
];

/** Typing speed at 1×, in characters per second — real files are long. */
export const TYPE_CPS = 345;
/** However fast the code goes, letters appear at most this fast (per second, at
 *  1×): the typing slows through a letters phase so each one can be seen. */
export const LETTERS_PER_SEC = 42;
/** Typing cost of a line break, and of a comment's characters (skimmed). */
export const NEWLINE_COST = 3;
export const COMMENT_COST = 0.3;
/** The code after a block's colour lands (closing tags, mostly) types this much faster:
 *  by then the preview has nothing left to show for it. */
export const TAIL_SPEED = 3;

/** Time for the preview to scroll to a section before its code starts. */
export const ENTER_WAIT_MS = 540;
/** Beat on the finished section before the next file opens. */
export const SECTION_END_WAIT_MS = 470;
/** How long "Done" stays up before the studio closes itself. */
export const DONE_CLOSE_MS = 2000;
/** The opening splash: shortest it stays, and its lift-off (match globals.css). */
export const SPLASH_MIN_MS = 1800;
export const SPLASH_LIFT_MS = 900;
/** The preview page loads only after the splash's entrance (see BuildStudio). */
export const FRAME_DELAY_MS = 1400;
/** The hand-back to the site, and the page's own fade-up after (match globals.css). */
export const OUTRO_MS = 1500;
export const RETURN_MS = 1100;

export const SPEEDS = [1, 2] as const;

/** The preview renders the page at a real device width and is scaled to fit,
 *  so it shows the desktop (or phone) layout rather than a squeezed one. */
export const PREVIEW_DESKTOP_WIDTH = 1440;
export const PREVIEW_PHONE_WIDTH = 390;
/** The shortest the preview's viewport may be, as a share of its width — a
 *  wide, short pane would squash the hero (it is one viewport tall). The phone
 *  preview then shrinks to fit, centred, instead. */
export const PREVIEW_MIN_ASPECT = { desktop: 0.56, phone: 1.6 };
/** Below this pane width the preview switches to the phone layout. */
export const PREVIEW_PHONE_BELOW = 560;

/** The camera's closest zoom, and how much of the pane the focused block may fill. */
export const CAMERA_MAX_ZOOM = 1.45;
export const CAMERA_FILL = 0.62;
/** The camera moves on once what's being built comes this close (a share of the pane) to the frame's edge… */
export const CAMERA_MARGIN = 0.06;
/** …or once it could come this many times closer than it is. */
export const CAMERA_CLOSER = 1.25;
/** Shortest hold on one shot before the camera moves to the next. */
export const CAMERA_DWELL_MS = 600;

/** The preview's share of the studio, and how far the divider may drag it. */
export const SPLIT_DEFAULT = 0.6;
export const SPLIT_MIN = 0.3;
export const SPLIT_MAX = 0.85;
