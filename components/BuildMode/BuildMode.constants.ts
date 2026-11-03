/** Query flag that turns a page into the studio's preview stage. */
export const BUILD_PARAM = "build";

/** Where the studio fetches the source it types (see app/build-source.json),
 *  and any other repo file the editor opens (see app/build-source/[...path]). */
export const BUILD_SOURCE_URL = "/build-source.json";
export const REPO_FILE_URL = "/build-source/";

/** The components typed out, in page order — one per block of the preview. */
export const BUILD_SOURCES = [
  "components/sections/Hero/Hero.tsx",
  "components/sections/EffaceIntro/EffaceIntro.tsx",
  "components/sections/Work/Work.tsx",
  "components/sections/CapabilitiesScene/CapabilitiesDesktop.tsx",
  "components/sections/Approach/Approach.tsx",
  "components/sections/About/About.tsx",
  "components/sections/Testimonials/Testimonials.tsx",
  "components/sections/Contact/Contact.tsx",
  "components/Footer/Footer.tsx",
];

/** Typing speed at 1×, in characters per second — real files are long. */
export const TYPE_CPS = 230;
/** Typing cost of a line break, and of a comment's characters (skimmed). */
export const NEWLINE_COST = 3;
export const COMMENT_COST = 0.3;

/** Time for the preview to scroll to a section before its code starts. */
export const ENTER_WAIT_MS = 800;
/** Beat on the finished section before the next file opens. */
export const SECTION_END_WAIT_MS = 700;
/** How long "Done" stays up before the studio closes itself. */
export const DONE_CLOSE_MS = 2000;
/** The opening splash: shortest it stays, and its lift-off (match globals.css). */
export const SPLASH_MIN_MS = 1800;
export const SPLASH_LIFT_MS = 900;
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
export const CAMERA_MAX_ZOOM = 1.7;
export const CAMERA_FILL = 0.62;

/** The preview's share of the studio, and how far the divider may drag it. */
export const SPLIT_DEFAULT = 0.6;
export const SPLIT_MIN = 0.3;
export const SPLIT_MAX = 0.85;
