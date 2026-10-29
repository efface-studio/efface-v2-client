import { cn } from "@/lib/cn";
import { stackIcon } from "@/lib/stackIcons";
import type { StackMarkProps } from "./StackMark.types";

/** A tool's brand mark in its own colour, or nothing if we don't carry one. */
export default function StackMark({ item, className }: StackMarkProps) {
  const icon = stackIcon(item);
  if (!icon) return null;

  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("h-4 w-4 shrink-0", className)} fill={icon.color}>
      <path d={icon.path} />
    </svg>
  );
}
