import { readFile } from "node:fs/promises";
import path from "node:path";
import { stripComments } from "@/components/BuildMode/highlight";
import { listRepo } from "@/components/BuildMode/repoFiles";

/** Code whose comments come out before it's shown. */
const CODE = /\.(tsx?|m?js|css)$/;

// One repo file as text, for build mode's editor — every one pre-rendered at
// build time, and nothing outside the explorer's list is ever served.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listRepo()).filter((f) => !f.binary).map((f) => ({ path: f.path.split("/") }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const rel = (await params).path.join("/");
  const raw = await readFile(path.join(/*turbopackIgnore: true*/ process.cwd(), rel), "utf8");
  const text = CODE.test(rel) ? stripComments(raw) : raw;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
