import type { WorkClient, WorkFeature, WorkIcon } from "./Work.types";

/** Icon art per project `key`. Projects missing here get a monogram tile. */
export const WORK_ICONS: Record<string, WorkIcon> = {
  hinest: { src: "/work/hinest.png" },
  hwaso: { src: "/work/hwaso.png" },
  luckgluck: { src: "/work/luckgluck.png" },
  "efface-v1": { src: "/work/efface-v1.svg", bg: "#f6f6f7", inset: true },
  "efface-v2": { src: "/work/efface-v2.svg" },
  cheezefilm: { src: "/work/cheezefilm.png" },
  "2pick": { src: "/work/2pick.svg" },
  cutephoto: { src: "/work/cutephoto.png" },
  "design-system": { src: "/work/design-system.svg" },
  rooti: { src: "/work/rooti.png" },
  "rooti-admin": { src: "/work/rooti-admin.png" },
  goms: { src: "/work/goms.svg", bg: "#ffa600" },
};

/** Projects shown large above the grid, in this order. Add one when its store
 *  art is ready. */
export const WORK_FEATURED: WorkFeature[] = [
  {
    key: "hwaso",
    shots: ["/work/hwaso/shot-1.webp", "/work/hwaso/shot-2.webp", "/work/hwaso/shot-3.webp"],
    links: {
      github: "https://github.com/efface-studio/hwaso",
      web: "https://hwaso.efface.dev",
    },
  },
  {
    key: "hinest",
    shots: Array.from({ length: 7 }, (_, i) => `/work/hinest/shot-${i + 1}.webp`),
    links: {
      appStore:
        "https://apps.apple.com/kr/app/hinest-%ED%9A%8C%EC%82%AC%EC%9D%98-%EB%AA%A8%EB%93%A0-%EC%9D%BC%EC%9D%B4-%EC%82%AC%EB%8A%94-%EA%B3%B3/id6775715605",
      github: "https://github.com/efface-studio/HiNest-Client",
      web: "https://nest.hi-vits.com/",
    },
  },
  {
    key: "rooti",
    shots: ["/work/rooti/shot-1.webp", "/work/rooti/shot-2.webp", "/work/rooti/shot-3.webp"],
    links: {
      appStore: "https://apps.apple.com/kr/app/%EB%A3%A8%ED%8B%B0-rooti/id6812195678",
      playStore: "https://play.google.com/store/apps/details?id=com.hivits.rooti&hl=ko",
      web: "https://v2.rooti.work/",
    },
    clients: "rooti",
  },
  {
    key: "rooti-admin",
    shots: [
      "/work/rooti-admin/shot-1.webp",
      "/work/rooti-admin/shot-2.webp",
      "/work/rooti-admin/shot-3.webp",
    ],
    links: {
      web: "https://dev.rooti.work",
    },
    clients: "rooti",
  },
  {
    key: "goms",
    shots: ["/work/goms/shot-1.webp", "/work/goms/shot-2.webp"],
    links: {
      appStore: "https://apps.apple.com/kr/app/goms/id6502936560",
      playStore: "https://play.google.com/store/apps/details?id=com.goms.goms_android_v2&hl=ko",
      github: "https://github.com/team-haribo",
      web: "https://team-haribo.vercel.app/",
    },
  },
  {
    key: "2pick",
    shots: [],
    page: { src: "/work/2pick/home.webp", width: 1280, height: 2899 },
  },
];

/** Companies using a featured product, from that product's own landing page
 *  (Rooti: `Rooti-V2-Home` partners). Names are proper nouns, not translated.
 *  The assets keep their colours; only the white backdrop around each mark is
 *  removed, and black type is lifted to light grey so it reads on the dark page. */
export const WORK_CLIENTS: Record<string, WorkClient[]> = {
  rooti: [
    { src: "/work/rooti/clients/sga.png", name: "SGA솔루션" },
    { src: "/work/rooti/clients/yonsei.png", name: "연세올바른재활의학과의원" },
    { src: "/work/rooti/clients/kcc.png", name: "KCC" },
    { src: "/work/rooti/clients/bitplanet.png", name: "비트플래닛" },
    { src: "/work/rooti/clients/kisca.png", name: "KISCA" },
    { src: "/work/rooti/clients/kuh.png", name: "건국대학교병원" },
    { src: "/work/rooti/clients/moez.png", name: "moez" },
    { src: "/work/rooti/clients/useplace.png", name: "유즈플레이스" },
    { src: "/work/rooti/clients/kpr.png", name: "KPR" },
    { src: "/work/rooti/clients/ckd.png", name: "종근당" },
    { src: "/work/rooti/clients/daiso.png", name: "다이소" },
  ],
};

/* ── Pinned featured scene ───────────────────────────────────────────
   Each featured project pins on its own runway, measured in units: every
   screenshot takes one unit to slide in, then the project holds for
   FEATURED_HOLD before the pin releases and the page scrolls on to the next. */

/** Units a project rests after its last shot lands, before it scrolls away. */
export const FEATURED_HOLD = 0.6;

/** Scroll length (vh) per unit — sets the pace. */
export const FEATURED_PACE_VH = 34;

/** How far (px) a shot travels in from the right. */
export const FEATURED_SLIDE = 520;

/** Shots visible at once; past this the track slides left. */
export const FEATURED_VISIBLE = 3;

/** Width (rem) of the soft left edge once the track starts sliding. */
export const FEATURED_EDGE_REM = 4.5;

/** Units a web page capture takes to scroll from top to bottom in its frame. */
export const FEATURED_PAGE_UNITS = 4;

/** Featured projects pinned side by side in one row. */
export const FEATURED_PER_ROW = 2;
