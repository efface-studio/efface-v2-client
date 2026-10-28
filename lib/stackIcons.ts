import {
  siAnthropic,
  siCapacitor,
  siCloudflare,
  siCloudflareworkers,
  siDocker,
  siDrizzle,
  siElectron,
  siExpo,
  siExpress,
  siFastapi,
  siFastify,
  siFirebase,
  siFramer,
  siGithubactions,
  siGooglecloud,
  siMediapipe,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siPino,
  siPnpm,
  siPostgresql,
  siPrisma,
  siPydantic,
  siPython,
  siRadixui,
  siReact,
  siReacthookform,
  siReactquery,
  siReactrouter,
  siRedis,
  siResend,
  siSharp,
  siSocketdotio,
  siSqlalchemy,
  siSupabase,
  siSwagger,
  siSwift,
  siTailwindcss,
  siTauri,
  siTestinglibrary,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVite,
  siVitest,
  siWebauthn,
  siWebrtc,
  siYoutube,
  siZod,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

type Mark = Pick<SimpleIcon, "path" | "hex">;

/** OpenAI's mark left simple-icons in v14; this is its v13.21 path (source:
 *  openai.com/brand). The brand is monochrome, so it renders light. */
const OPENAI: Mark = {
  hex: "000000",
  path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
};

/** Brand marks (simple-icons) by tool name, without its version. Tools simple-icons
 *  doesn't carry (Zustand, Tiptap, AWS, …) are left out and show as text. */
const ICONS: Record<string, Mark> = {
  Anthropic: siAnthropic,
  Capacitor: siCapacitor,
  Cloudflare: siCloudflare,
  "Cloudflare Workers": siCloudflareworkers,
  Docker: siDocker,
  Drizzle: siDrizzle,
  Electron: siElectron,
  "electron-updater": siElectron,
  Expo: siExpo,
  "expo-notifications": siExpo,
  "expo-router": siExpo,
  Express: siExpress,
  FastAPI: siFastapi,
  Fastify: siFastify,
  "Firebase (FCM)": siFirebase,
  "Framer Motion": siFramer,
  "GitHub Actions": siGithubactions,
  "Google Cloud Vision": siGooglecloud,
  MediaPipe: siMediapipe,
  NestJS: siNestjs,
  OpenAI: OPENAI,
  "Next.js": siNextdotjs,
  "Node.js": siNodedotjs,
  "node:test": siNodedotjs,
  pino: siPino,
  "pnpm workspaces": siPnpm,
  PostgreSQL: siPostgresql,
  "Supabase Postgres": siSupabase,
  Prisma: siPrisma,
  "pydantic-ai": siPydantic,
  Python: siPython,
  "Radix UI": siRadixui,
  React: siReact,
  "React Native": siReact,
  "React Hook Form": siReacthookform,
  "TanStack Query": siReactquery,
  "React Router": siReactrouter,
  Redis: siRedis,
  Resend: siResend,
  sharp: siSharp,
  "Socket.IO": siSocketdotio,
  SQLAlchemy: siSqlalchemy,
  Supabase: siSupabase,
  "Supabase Storage": siSupabase,
  Swagger: siSwagger,
  Swift: siSwift,
  "Swift (macOS widget)": siSwift,
  "Swift Package Manager": siSwift,
  "Tailwind CSS": siTailwindcss,
  Tauri: siTauri,
  "Testing Library": siTestinglibrary,
  "three.js": siThreedotjs,
  TypeScript: siTypescript,
  Vercel: siVercel,
  Vite: siVite,
  Vitest: siVitest,
  WebAuthn: siWebauthn,
  WebRTC: siWebrtc,
  "YouTube Data API v3": siYoutube,
  Zod: siZod,
};

/** Near-black brand colours vanish on the dark surface; those marks go light. */
const isDark = (hex: string): boolean => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.25;
};

export interface StackIcon {
  path: string;
  color: string;
}

/** The brand mark for a stack item like "Next.js 16" or "Prisma 6", if there is one. */
export function stackIcon(item: string): StackIcon | undefined {
  const icon = ICONS[item] ?? ICONS[item.replace(/\s+v?\d+(\.\d+)*$/, "")];
  if (!icon) return undefined;
  return { path: icon.path, color: isDark(icon.hex) ? "#f6f6f7" : `#${icon.hex}` };
}
