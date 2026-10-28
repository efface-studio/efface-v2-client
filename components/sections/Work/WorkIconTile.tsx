import { cn } from "@/lib/cn";
import type { WorkIconTileProps } from "./Work.types";

const TILE =
  "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[22.5%] ring-1 ring-white/10";

/** First three letters of a Latin name, or the first syllable of a Hangul one. */
const monogram = (name: string): string => name.slice(0, /^[A-Za-z0-9]/.test(name) ? 3 : 1);

/** A home-screen style app icon. Falls back to a monogram when there's no art. */
export default function WorkIconTile({ name, icon }: WorkIconTileProps) {
  if (!icon) {
    return (
      <div aria-hidden className={cn(TILE, "bg-surface-2")}>
        <span className="text-2xl font-semibold tracking-tight text-fg-dim md:text-3xl">
          {monogram(name)}
        </span>
      </div>
    );
  }

  return (
    <div aria-hidden className={TILE} style={{ background: icon.bg }}>
      <img
        src={icon.src}
        alt=""
        draggable={false}
        className={cn("h-full w-full object-contain", icon.inset && "p-[18%]")}
      />
    </div>
  );
}
