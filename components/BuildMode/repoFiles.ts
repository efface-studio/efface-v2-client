import { readdir } from "node:fs/promises";
import path from "node:path";
import type { BuildRepoEntry } from "./BuildMode.types";

/** What the editor's explorer shows: the site's own source. Nothing local, and
 *  none of the team's internal notes, scripts or CI (CLAUDE.md, docs, scripts, .github). */
const ROOT_DIRS = ["app", "components", "i18n", "lib", "messages", "public", "store"];
const ROOT_FILES = [
  "README.md",
  "middleware.ts",
  "next.config.ts",
  "package.json",
  "package-lock.json",
  "postcss.config.mjs",
  "tsconfig.json",
];
/** Never listed, wherever they sit: local env, build output, OS clutter. */
const SKIP = /(^|\/)(\.env[^/]*|\.DS_Store|node_modules|\.next|_frame[^/]*\.png)$/;
/** Shown in the tree but not opened as text. */
const BINARY = /\.(png|jpe?g|webp|gif|ico|mp4|webm|mp3|m4a|wav|ogg|woff2?|ttf|otf|pdf)$/i;

/** Every file the explorer lists, repo-relative, read at build time. */
export async function listRepo(): Promise<BuildRepoEntry[]> {
  const out: BuildRepoEntry[] = ROOT_FILES.map((p) => ({ path: p, binary: false }));
  const walk = async (dir: string) => {
    for (const ent of await readdir(path.join(/*turbopackIgnore: true*/ process.cwd(), dir), { withFileTypes: true })) {
      const rel = `${dir}/${ent.name}`;
      if (SKIP.test(rel)) continue;
      if (ent.isDirectory()) await walk(rel);
      else if (ent.isFile()) out.push({ path: rel, binary: BINARY.test(ent.name) });
    }
  };
  for (const dir of ROOT_DIRS) await walk(dir);
  return out;
}
