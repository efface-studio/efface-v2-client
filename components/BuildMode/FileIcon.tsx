import { Atom, FileImage, FileText, Hash, Info, Settings2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** A file's icon the way VS Code's default (Seti) theme draws it, by extension. */
export default function FileIcon({ path, className }: { path: string; className?: string }) {
  const ext = path.split(".").at(-1)?.toLowerCase() ?? "";
  const base = cn("h-3.5 w-3.5 shrink-0", className);
  const glyph = (text: string, color: string) => (
    <span aria-hidden className={cn(base, "flex items-center justify-center font-bold leading-none", color)} style={{ fontSize: "8px" }}>
      {text}
    </span>
  );
  if (ext === "tsx" || ext === "jsx") return <Atom aria-hidden className={cn(base, "text-[#2ac3de]")} />;
  if (ext === "ts") return glyph("TS", "text-[#519aba]");
  if (ext === "js" || ext === "mjs") return glyph("JS", "text-[#cbcb41]");
  if (ext === "json") return glyph("{}", "text-[#e0af68]");
  if (ext === "css") return <Hash aria-hidden className={cn(base, "text-[#519aba]")} />;
  if (ext === "md") return <Info aria-hidden className={cn(base, "text-[#519aba]")} />;
  if (ext === "yml" || ext === "yaml") return <Settings2 aria-hidden className={cn(base, "text-[#a074c4]")} />;
  if (/^(png|jpe?g|webp|gif|ico|svg)$/.test(ext)) return <FileImage aria-hidden className={cn(base, "text-[#a074c4]")} />;
  return <FileText aria-hidden className={cn(base, "text-[#787c99]")} />;
}
