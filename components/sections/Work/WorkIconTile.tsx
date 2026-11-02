import { cn } from "@/lib/cn";
import type { WorkIconTileProps } from "./Work.types";

const TILE =
  "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[22.5%] ring-1 ring-white/10";

/** First three letters of a Latin name, or the first syllable of a Hangul one. */
const monogram = (name: string): string => name.slice(0, /^[A-Za-z0-9]/.test(name) ? 3 : 1);

/** A home-screen style app icon. Falls back to a monogram when there's no art. */
export default function WorkIconTile({ name, icon, zoom }: WorkIconTileProps) {
  if (!icon) {
    return (
      <div aria-hidden className={cn(TILE, "@container bg-surface-2")}>
        {/* Sized off the tile, so the monogram fits a 40px row icon and a 96px one alike. */}
        <span className="text-[30cqw] font-semibold tracking-tight text-fg-dim">
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
        data-zoom={zoom || undefined}
        data-zoom-tile
        data-zoom-bg={icon.bg}
        data-zoom-inset={icon.inset || undefined}
        className={cn("h-full w-full object-contain", icon.inset && "p-[18%]")}
      />
    </div>
  );
}
