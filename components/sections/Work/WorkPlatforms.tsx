import { Globe, Monitor, Server, type LucideIcon } from "lucide-react";
import { siAndroid, siApple } from "simple-icons";
import { WORK_PLATFORM_LABELS } from "./Work.constants";
import type { WorkPlatform } from "./Work.types";

/** Brand marks where the platform has one; plain glyphs for the rest. */
const BRAND: Partial<Record<WorkPlatform, { path: string; color: string }>> = {
  ios: { path: siApple.path, color: "#f5f5f7" },
  android: { path: siAndroid.path, color: `#${siAndroid.hex}` },
};
const GLYPH: Partial<Record<WorkPlatform, LucideIcon>> = { web: Globe, desktop: Monitor, server: Server };

/** What a project runs on, each with its mark, in English in both locales. */
export default function WorkPlatforms({ platforms }: { platforms: WorkPlatform[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {platforms.map((p) => {
        const brand = BRAND[p];
        const Glyph = GLYPH[p];
        return (
          <span key={p} className="inline-flex items-center gap-1.5">
            {brand ? (
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill={brand.color}>
                <path d={brand.path} />
              </svg>
            ) : (
              Glyph && <Glyph aria-hidden className="h-3.5 w-3.5 shrink-0 text-fg-dim" strokeWidth={1.75} />
            )}
            {WORK_PLATFORM_LABELS[p]}
          </span>
        );
      })}
    </span>
  );
}
