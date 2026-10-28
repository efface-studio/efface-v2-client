import type { AppIconProps } from "./AppCards.types";

/** Share of the slot the tile fills, and of the tile the glyph fills. */
const TILE_RATIO = 0.6;
const GLYPH_RATIO = 0.6;

/** A flat app icon: a solid rounded tile with the SVG glyph laid on top. */
export default function AppIcon({ src, color, size = 300 }: AppIconProps) {
  const tile = Math.round(size * TILE_RATIO);
  const glyph = Math.round(tile * GLYPH_RATIO);

  return (
    <div
      aria-hidden="true"
      style={{
        width: tile,
        height: tile,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "22.5%",
        background: color,
        boxShadow: "0 18px 36px rgba(0, 0, 0, 0.28)",
      }}
    >
      <img src={src} alt="" width={glyph} height={glyph} draggable={false} />
    </div>
  );
}
