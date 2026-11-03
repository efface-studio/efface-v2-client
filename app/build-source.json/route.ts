import { readFile } from "node:fs/promises";
import path from "node:path";
import { BUILD_SOURCES } from "@/components/BuildMode/BuildMode.constants";
import { excerpt } from "@/components/BuildMode/excerpt";
import { listRepo } from "@/components/BuildMode/repoFiles";

// Read once at build time: build mode types out the components' real source,
// and its explorer lists the real repo (each file is served by build-source/[...path]).
export const dynamic = "force-static";

export async function GET() {
  const files = await Promise.all(
    BUILD_SOURCES.map(async (rel) => ({
      path: rel,
      blocks: excerpt(await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), rel), "utf8")),
    }))
  );
  return Response.json({ files, tree: await listRepo() });
}
