import type { WorkClient, WorkFeature, WorkIcon, WorkLinks, WorkStackGroup } from "./Work.types";

/** Icon art per project `key`. Projects missing here get a monogram tile. */
export const WORK_ICONS: Record<string, WorkIcon> = {
  hinest: { src: "/work/hinest.webp", tint: "#2f5bea" },
  hwaso: { src: "/work/hwaso.webp", tint: "#1fae5b" },
  luckgluck: { src: "/work/luckgluck.webp", tint: "#c8913f" },
  "efface-v1": { src: "/work/efface-v1.svg", bg: "#f6f6f7", inset: true, tint: "#3b62e5" },
  "efface-v2": { src: "/work/efface-v2.svg", tint: "#3b62e5" },
  cheezefilm: { src: "/work/cheezefilm.webp", tint: "#6b2fc4" },
  "2pick": { src: "/work/2pick.svg", tint: "#b6f03c" },
  cutephoto: { src: "/work/cutephoto.webp", tint: "#ef4f4f" },
  "design-system": { src: "/work/design-system.svg", tint: "#3b62e5" },
  rooti: { src: "/work/rooti.webp", tint: "#2cc7a0" },
  "rooti-admin": { src: "/work/rooti-admin.webp", tint: "#7a3fd1" },
  goms: { src: "/work/goms.svg", bg: "#ffa600", tint: "#ffa600" },
};

/** Outbound links for projects that aren't featured (featured ones carry theirs
 *  on `WORK_FEATURED`), shown in the detail popup. */
export const WORK_LINKS: Record<string, WorkLinks> = {
  luckgluck: {
    github: "https://github.com/efface-studio/Luckgluck-Client",
    githubServer: "https://github.com/efface-studio/Luckgluck-Server",
    web: "https://luckgluck.efface.dev",
  },
  "efface-v1": {
    github: "https://github.com/efface-studio/efface-v1-client",
    web: "https://efface.dev",
  },
  "efface-v2": {
    github: "https://github.com/efface-studio/efface-v2-client",
    web: "https://v2.efface.dev",
  },
  cheezefilm: {
    github: "https://github.com/efface-studio/CheezeFilm-Client",
    web: "https://cheeze.efface.dev",
  },
  // The app repo is private; its public support page is the outward link.
  cutephoto: {
    web: "https://efface-studio.github.io/cutephoto-site/",
  },
  "design-system": {
    github: "https://github.com/efface-studio/efface-component",
    web: "https://ds.efface.dev",
  },
};

/** Desktop screen captures (1440×900 @2×) for projects without store shots,
 *  shown in the detail popup. Captured from each project's live site or local repo. */
const screens = (key: string, count: number): string[] =>
  Array.from({ length: count }, (_, i) => `/work/${key}/screen-${i + 1}.webp`);

export const WORK_SCREENS: Record<string, string[]> = {
  luckgluck: screens("luckgluck", 4),
  "efface-v1": screens("efface-v1", 4),
  "efface-v2": screens("efface-v2", 4),
  cheezefilm: screens("cheezefilm", 4),
  cutephoto: screens("cutephoto", 3),
  "design-system": screens("design-system", 4),
};

/** Tech stack per project `key`, grouped by layer, for the detail popup. Taken
 *  from each project's own repo; tool names are not translated. */
export const WORK_STACKS: Record<string, WorkStackGroup[]> = {
  hinest: [
    { label: "Web · App", items: ["React", "TypeScript", "React Router", "Tiptap", "Capacitor"] },
    { label: "Desktop", items: ["Electron", "electron-updater", "Swift (macOS widget)"] },
    { label: "Server", items: ["Node.js", "Express", "Prisma", "PostgreSQL", "Supabase", "Zod"] },
    { label: "Infra", items: ["AWS S3", "AWS SES", "WebAuthn", "Vercel"] },
  ],
  hwaso: [
    { label: "Web", items: ["Next.js 16", "TypeScript", "Tailwind CSS 4", "TanStack Query", "Zustand"] },
    { label: "App", items: ["Expo", "React Native", "React Navigation", "expo-notifications"] },
    { label: "Server", items: ["NestJS 11", "Prisma 6", "PostgreSQL 16", "Redis 7", "Socket.IO"] },
    { label: "Infra", items: ["pnpm workspaces", "Docker", "S3 (RustFS)", "CDN", "Zod"] },
  ],
  luckgluck: [
    { label: "Web", items: ["Next.js 16", "TypeScript", "Tailwind CSS 4", "TanStack Query", "Tiptap", "Orval"] },
    { label: "Server", items: ["NestJS 11", "Prisma", "PostgreSQL 16", "Swagger", "argon2", "sharp"] },
    { label: "Infra", items: ["AWS S3", "AWS SES"] },
    { label: "Test", items: ["Vitest", "Testing Library", "supertest"] },
  ],
  "efface-v1": [
    { label: "Web", items: ["Next.js 15", "TypeScript", "Tailwind CSS 4", "next-intl", "motion"] },
    { label: "Form · Mail", items: ["React Hook Form", "Zod", "Resend", "Supabase"] },
    { label: "Infra", items: ["Vercel"] },
  ],
  "efface-v2": [
    { label: "Web", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "next-intl"] },
    { label: "Motion · 3D", items: ["motion", "three.js"] },
    { label: "Infra", items: ["Vercel", "GitHub Actions"] },
  ],
  cheezefilm: [
    { label: "Web", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4"] },
    { label: "Data", items: ["Supabase Postgres", "Supabase Storage", "YouTube Data API v3", "ExcelJS"] },
    { label: "Infra", items: ["Vercel", "ISR", "jose"] },
  ],
  "2pick": [
    { label: "Web", items: ["React 19", "Vite", "TanStack Query", "Zustand"] },
    { label: "Server", items: ["Node.js 22", "Fastify 5", "Drizzle", "PostgreSQL 16", "Redis 7", "Zod 4", "pino", "decimal.js"] },
    { label: "Integration", items: ["Toss Securities Open API"] },
    { label: "Test", items: ["Vitest", "fast-check"] },
  ],
  cutephoto: [
    { label: "Web", items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS 4"] },
    { label: "Real-time", items: ["WebRTC", "Socket.IO", "Canvas API", "MediaPipe"] },
    { label: "Desktop", items: ["Tauri"] },
  ],
  "design-system": [
    { label: "Web", items: ["React 19", "TypeScript", "Vite", "Tailwind CSS 4", "React Router"] },
    { label: "Motion · 3D", items: ["motion", "three.js"] },
    { label: "Infra", items: ["Cloudflare Workers", "oxlint", "node:test"] },
  ],
  rooti: [
    { label: "Web", items: ["React 18", "Vite", "TypeScript", "React Router", "TanStack Query", "Zustand", "Tailwind CSS", "Radix UI"] },
    { label: "App", items: ["Expo", "React Native", "expo-router", "Reanimated", "expo-notifications"] },
    { label: "Server", items: ["Python 3.12", "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Firebase (FCM)"] },
    { label: "AI", items: ["Google Cloud Vision", "pgvector", "OpenAI", "pydantic-ai"] },
  ],
  "rooti-admin": [
    { label: "App", items: ["Expo", "React Native", "expo-router", "TanStack Query"] },
    { label: "Server", items: ["Python 3.12", "FastAPI", "PostgreSQL", "Firebase (FCM)"] },
  ],
  goms: [
    { label: "iOS", items: ["Swift", "Tuist", "Swift Package Manager"] },
    { label: "Role", items: ["PM", "iOS"] },
  ],
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
    links: {
      github: "https://github.com/efface-studio/2Pick",
    },
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
