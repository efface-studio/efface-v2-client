import { readFile } from "node:fs/promises";
import path from "node:path";
import { BUILD_SOURCES } from "@/components/BuildMode/BuildMode.constants";
import { excerpt } from "@/components/BuildMode/excerpt";
import { stripComments } from "@/components/BuildMode/highlight";
import { listRepo } from "@/components/BuildMode/repoFiles";

// Read once at build time: build mode types out the components' real source
// (comments stripped — they're notes for us, not for visitors), and its
// explorer lists the repo (each file is served by build-source/[...path]).
export const dynamic = "force-static";

export async function GET() {
  const files = await Promise.all(
    BUILD_SOURCES.map(async ({ path: rel, plan, pace, whole }) => {
      const src = stripComments(await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), rel), "utf8"));
      // An animation's file is the animation: shown whole, not cut to its JSX.
      return { path: rel, plan, pace, blocks: whole ? [{ start: 1, code: src.trimEnd() }] : excerpt(src) };
    })
  );
  return Response.json({ files, tree: await listRepo() });
}
