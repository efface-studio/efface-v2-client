import {
  siAnthropic,
  siApple,
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
  siHtml5,
  siJsonwebtokens,
  siMediapipe,
  siNestjs,
  siNextdotjs,
  siNodedotjs,
  siOxc,
  siPino,
  siPnpm,
  siPostgresql,
  siPrisma,
  siPydantic,
  siRadixui,
  siReact,
  siReacthookform,
  siReactivex,
  siReactquery,
  siReactrouter,
  siRedis,
  siResend,
  siRustfs,
  siSharp,
  siSocketdotio,
  siSqlalchemy,
  siSqlite,
  siSupabase,
  siSwagger,
  siSwift,
  siTailwindcss,
  siTauri,
  siTestinglibrary,
  siThreedotjs,
  siVercel,
  siVite,
  siVitest,
  siWebauthn,
  siWebrtc,
  siYoutube,
  siZod,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import { Boxes, Calculator, FlaskConical, Globe, KeyRound, Layers, type LucideIcon } from "lucide-react";

type Mark = Pick<SimpleIcon, "path" | "hex">;

/** OpenAI's mark left simple-icons in v14; this is its v13.21 path (source:
 *  openai.com/brand). The brand is monochrome, so it renders light. */
const OPENAI: Mark = {
  hex: "000000",
  path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
};

/** Amazon's service marks left simple-icons in v14; these are their v13.21
 *  paths (source: aws.amazon.com/architecture/icons). */
const AMAZON_S3: Mark = {
  hex: "569A31",
  path: "M20.913 13.147l.12-.895c.947.576 1.258.922 1.354 1.071-.16.031-.562.046-1.474-.176zm-2.174 7.988a.547.547 0 0 0-.005.073c0 .084-.207.405-1.124.768a10.28 10.28 0 0 1-1.438.432c-1.405.325-3.128.504-4.853.504-4.612 0-7.412-1.184-7.412-1.704a.547.547 0 0 0-.005-.073L1.81 5.602c.135.078.28.154.432.227.042.02.086.038.128.057.134.062.272.122.417.18l.179.069c.154.058.314.114.478.168.043.013.084.029.13.043.207.065.423.127.646.187l.176.044c.175.044.353.087.534.127a23.414 23.414 0 0 0 .843.17l.121.023c.252.045.508.085.768.122.071.011.144.02.216.03.2.027.4.053.604.077l.24.027c.245.026.49.05.74.07l.081.009c.275.022.552.04.83.056l.233.012c.21.01.422.018.633.025a33.088 33.088 0 0 0 2.795-.026l.232-.011c.278-.016.555-.034.83-.056l.08-.008c.25-.02.497-.045.742-.072l.238-.026c.205-.024.408-.05.609-.077.07-.01.141-.019.211-.03.261-.037.519-.078.772-.122l.111-.02c.215-.04.427-.082.634-.125l.212-.047c.186-.041.368-.085.546-.13l.166-.042c.225-.06.444-.122.654-.189.04-.012.077-.026.115-.038a10.6 10.6 0 0 0 .493-.173c.058-.021.114-.044.17-.066.15-.06.293-.12.43-.185.038-.017.079-.034.116-.052.153-.073.3-.15.436-.228l-.976 7.245c-2.488-.78-5.805-2.292-7.311-3a1.09 1.09 0 0 0-1.088-1.085c-.6 0-1.088.489-1.088 1.088 0 .6.488 1.089 1.088 1.089.196 0 .378-.056.537-.148 1.72.812 5.144 2.367 7.715 3.15zm-7.42-20.047c5.677 0 9.676 1.759 9.75 2.736l-.014.113c-.01.033-.031.067-.048.101-.015.028-.026.057-.047.087-.024.033-.058.068-.09.102-.028.03-.051.06-.084.09-.038.035-.087.07-.133.105-.04.03-.074.06-.119.091-.053.036-.116.071-.177.107-.05.03-.095.06-.15.09-.068.036-.147.073-.222.11-.059.028-.114.057-.177.085-.084.038-.177.074-.268.111-.068.027-.13.054-.203.082-.097.036-.205.072-.31.107-.075.026-.148.053-.228.079-.111.035-.233.069-.35.103-.085.024-.165.05-.253.073-.124.034-.258.065-.389.098-.093.022-.181.046-.278.068-.139.032-.287.061-.433.091-.098.02-.191.041-.293.06-.155.03-.32.057-.482.084-.1.018-.198.036-.302.052-.166.026-.342.048-.515.072-.11.014-.213.03-.325.044-.181.023-.372.041-.56.06-.11.012-.218.025-.332.036-.188.016-.386.029-.58.043-.122.009-.24.02-.364.028-.207.012-.422.02-.635.028-.12.005-.234.012-.354.016a35.605 35.605 0 0 1-2.069 0c-.12-.004-.234-.011-.352-.016-.214-.008-.43-.016-.637-.028-.122-.008-.238-.02-.36-.027-.195-.015-.394-.028-.584-.044-.11-.01-.215-.024-.324-.035-.19-.02-.384-.038-.568-.06l-.315-.044c-.176-.024-.355-.046-.525-.073-.1-.015-.192-.033-.29-.05-.167-.028-.335-.055-.494-.086-.096-.018-.183-.038-.276-.056-.151-.032-.305-.062-.45-.095-.09-.02-.173-.043-.26-.064-.138-.034-.277-.067-.407-.102-.082-.022-.157-.046-.235-.069a11.75 11.75 0 0 1-.368-.108c-.075-.024-.141-.049-.213-.073-.11-.037-.223-.075-.325-.113-.067-.025-.125-.051-.188-.077-.096-.038-.195-.076-.282-.115-.06-.027-.11-.054-.166-.08-.08-.039-.162-.077-.233-.116-.052-.028-.094-.055-.142-.084-.063-.038-.13-.075-.185-.113-.043-.029-.075-.058-.113-.086-.048-.037-.098-.073-.139-.11-.032-.029-.054-.057-.08-.087-.033-.035-.069-.07-.093-.104-.02-.03-.031-.058-.046-.086-.018-.035-.039-.068-.049-.102l-.015-.113c.076-.977 4.074-2.736 9.748-2.736zm12.182 12.124c-.118-.628-.84-1.291-2.31-2.128l.963-7.16a.531.531 0 0 0 .005-.073C22.16 1.581 16.447 0 11.32 0 6.194 0 .482 1.581.482 3.851a.58.58 0 0 0 .005.072L2.819 21.25c.071 2.002 5.236 2.75 8.5 2.75 1.805 0 3.615-.188 5.098-.531.598-.138 1.133-.3 1.592-.48 1.18-.467 1.789-1.053 1.813-1.739l.945-7.018c.557.131 1.016.197 1.389.197.54 0 .902-.137 1.134-.413a.956.956 0 0 0 .21-.804Z",
};
const AMAZON_SES: Mark = {
  hex: "DD344C",
  path: "M11.9996 0C5.3833 0 0 5.3834 0 11.9998c0 2.5316.7813 4.9544 2.2599 7.0051l.6955-.5014C1.5827 16.5993.8571 14.3505.8571 11.9998.8571 5.856 5.856.8572 12.0004.8572c6.144 0 11.1425 4.999 11.1425 11.1426 0 2.3508-.7256 4.5995-2.0983 6.5037l.6955.5014C23.2187 16.9542 24 14.5314 24 11.9998 24 5.3834 18.6163 0 11.9996 0zM6 16.7142a.4285.4285 0 0 0-.4286.4285v1.7598c-.9643.2048-1.7143 1.0822-1.7143 2.0974 0 1.1615.9815 2.143 2.1429 2.143s2.1429-.9815 2.1429-2.143c0-1.0152-.75-1.8926-1.7143-2.0974v-1.3312h5.1428v2.1883c-.9643.2049-1.7143 1.0822-1.7143 2.0975C9.8571 23.0186 10.8386 24 12 24s2.1429-.9814 2.1429-2.1429c0-1.0153-.75-1.8926-1.7143-2.0975v-2.1883h5.1428v1.3312c-.9643.2048-1.7143 1.0822-1.7143 2.0974 0 1.1615.9815 2.143 2.1429 2.143s2.1429-.9815 2.1429-2.143c0-1.0152-.75-1.8926-1.7143-2.0974v-1.7598A.4285.4285 0 0 0 18 16.7142h-5.5714v-2.5715H18c.237 0 .4286-.192.4286-.4286V5.9997A.4285.4285 0 0 0 18 5.571H6a.4285.4285 0 0 0-.4286.4286v7.7144c0 .2366.1916.4286.4286.4286h5.5714v2.5715H6zm1.2857 4.2857c0 .697-.5889 1.2858-1.2857 1.2858s-1.2857-.5889-1.2857-1.2858c0-.6968.5889-1.2857 1.2857-1.2857S7.2857 20.3031 7.2857 21zm12 0c0 .697-.5889 1.2858-1.2857 1.2858s-1.2857-.5889-1.2857-1.2858c0-.6968.5889-1.2857 1.2857-1.2857s1.2857.5889 1.2857 1.2857zm-1.7143-8.248L14.259 9.7703l3.3124-2.8389v5.8205zm-.7298-6.3236-4.842 4.1499-4.8412-4.15h9.6832zm-10.413.5031L9.741 9.7707 6.4286 12.752V6.9314zm.6878 6.3541 3.2807-2.9525 1.3239 1.135a.4253.4253 0 0 0 .2786.1032.4253.4253 0 0 0 .2785-.1033l1.3243-1.1349 3.2812 2.9525H7.1164zM12 20.5714c.6968 0 1.2857.5888 1.2857 1.2857 0 .6969-.5889 1.2857-1.2857 1.2857s-1.2857-.5888-1.2857-1.2857c0-.6969.5889-1.2857 1.2857-1.2857z",
};

/** Brand marks (simple-icons) by tool name, without its version. */
const ICONS: Record<string, Mark> = {
  Anthropic: siAnthropic,
  "AWS S3": AMAZON_S3,
  "AWS SES": AMAZON_SES,
  "Canvas API": siHtml5,
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
  // ISR is a Next.js rendering mode, jose a JWT library.
  ISR: siNextdotjs,
  jose: siJsonwebtokens,
  MediaPipe: siMediapipe,
  NestJS: siNestjs,
  OpenAI: OPENAI,
  "Next.js": siNextdotjs,
  "Node.js": siNodedotjs,
  "node:test": siNodedotjs,
  oxlint: siOxc,
  pino: siPino,
  "pnpm workspaces": siPnpm,
  PostgreSQL: siPostgresql,
  pgvector: siPostgresql,
  "Supabase Postgres": siSupabase,
  Prisma: siPrisma,
  "pydantic-ai": siPydantic,
  "Radix UI": siRadixui,
  React: siReact,
  "React Native": siReact,
  "React Hook Form": siReacthookform,
  "TanStack Query": siReactquery,
  "React Router": siReactrouter,
  Redis: siRedis,
  Resend: siResend,
  "S3 (RustFS)": siRustfs,
  sharp: siSharp,
  "Socket.IO": siSocketdotio,
  SQLAlchemy: siSqlalchemy,
  Supabase: siSupabase,
  "Supabase Storage": siSupabase,
  Swagger: siSwagger,
  "Swift (macOS widget)": siSwift,
  "Swift Package Manager": siSwift,
  "Tailwind CSS": siTailwindcss,
  Tauri: siTauri,
  "Testing Library": siTestinglibrary,
  "three.js": siThreedotjs,
  Vercel: siVercel,
  Vite: siVite,
  Vitest: siVitest,
  WebAuthn: siWebauthn,
  WebRTC: siWebrtc,
  "YouTube Data API v3": siYoutube,
  Zod: siZod,
  // Apple's own frameworks carry no mark of their own — the Apple logo stands in.
  Combine: siApple,
  UIKit: siApple,
  RxSwift: siReactivex,
  SQLite: siSqlite,
};

/** Marks simple-icons doesn't carry, as 96px PNGs in `public/stack/` taken
 *  from each project's own site, devicon or svgl. Near-black marks (Tiptap,
 *  Reanimated) were lightened the same way `isDark` does for the paths. */
const IMAGES: Record<string, string> = {
  // Official multi-colour marks, where the single-colour simple-icons glyph
  // reads as a different logo.
  C: "/stack/c.svg",
  "C++": "/stack/cplusplus.svg",
  JavaScript: "/stack/javascript.svg",
  Python: "/stack/python.svg",
  Swift: "/stack/swift.svg",
  "Swift Concurrency": "/stack/swift.svg",
  SwiftUI: "/stack/swift.svg",
  TypeScript: "/stack/typescript.svg",
  ExcelJS: "/stack/exceljs.png",
  "fast-check": "/stack/fast-check.png",
  motion: "/stack/motion.png",
  "next-intl": "/stack/next-intl.png",
  Orval: "/stack/orval.png",
  "React Navigation": "/stack/react-navigation.png",
  Reanimated: "/stack/reanimated.png",
  Tiptap: "/stack/tiptap.png",
  "Toss Securities Open API": "/stack/toss.png",
  Tuist: "/stack/tuist.png",
  Zustand: "/stack/zustand.png",
};

/** Libraries and concepts with no logo of their own get a plain glyph for what
 *  they do, so every item in a list still lines up behind a mark. */
const GLYPHS: Partial<Record<string, LucideIcon>> = {
  argon2: KeyRound,
  CDN: Globe,
  "decimal.js": Calculator,
  MVC: Boxes,
  MVVM: Layers,
  supertest: FlaskConical,
};

/** Near-black brand colours vanish on the dark surface; those marks go light. */
const isDark = (hex: string): boolean => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.25;
};

export type StackIcon =
  | { kind: "path"; path: string; color: string }
  | { kind: "image"; src: string }
  | { kind: "glyph"; Glyph: LucideIcon };

/** The mark for a stack item like "Next.js 16" or "Prisma 6", if there is one. */
export function stackIcon(item: string): StackIcon | undefined {
  const name = item.replace(/\s+v?\d+(\.\d+)*$/, "");
  const icon = ICONS[item] ?? ICONS[name];
  if (icon) return { kind: "path", path: icon.path, color: isDark(icon.hex) ? "#f6f6f7" : `#${icon.hex}` };
  const src = IMAGES[item] ?? IMAGES[name];
  if (src) return { kind: "image", src };
  const Glyph = GLYPHS[item] ?? GLYPHS[name];
  return Glyph ? { kind: "glyph", Glyph } : undefined;
}
