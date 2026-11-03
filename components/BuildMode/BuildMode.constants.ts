/** Query flag that turns a page into the studio's preview stage. */
export const BUILD_PARAM = "build";

/** Typing speed at 1×, in characters per second. */
export const TYPE_CPS = 90;
/** Extra pause after a line break, in characters' worth of time. */
export const NEWLINE_PAUSE = 4;

/** Time for the preview to scroll to a section before its code starts. */
export const ENTER_WAIT_MS = 800;
/** Beat on the finished section before the next file opens. */
export const SECTION_END_WAIT_MS = 700;
/** How long "Done" stays up before the studio closes itself. */
export const DONE_CLOSE_MS = 2400;

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
