import { cn } from "@/lib/cn";
import { stackIcon } from "@/lib/stackIcons";
import type { StackMarkProps } from "./StackMark.types";

/** A tool's brand mark in its own colour, a plain glyph for tools without one,
 *  or nothing if we don't carry either. */
export default function StackMark({ item, className }: StackMarkProps) {
  const icon = stackIcon(item);
  if (!icon) return null;
  const size = cn("h-4 w-4 shrink-0", className);

  if (icon.kind === "image") {
    return <img src={icon.src} alt="" aria-hidden width={16} height={16} loading="lazy" className={cn(size, "object-contain")} />;
  }
  if (icon.kind === "glyph") {
    return <icon.Glyph aria-hidden className={cn(size, "text-fg-faint")} strokeWidth={1.75} />;
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={size} fill={icon.color}>
      <path d={icon.path} />
    </svg>
  );
}
