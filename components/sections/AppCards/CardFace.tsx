"use client";

import AppIcon from "./AppIcon";
import type { CardFaceProps } from "./AppCards.types";

/**
 * The card face itself — identical markup in both layouts, so the mobile
 * fallback keeps the exact look, just at a size that stays readable.
 */
export default function CardFace({ card, copy, iconSize }: CardFaceProps) {
  return (
    <div
      className="app-card"
      style={{
        background: card.gradient,
        // consumed by .app-card::before for the diagonal sheen
        ["--sheen" as string]: String(card.sheen),
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 500,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "-0.01em",
        }}
      >
        {copy?.sub}
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#fff",
          marginTop: 6,
          letterSpacing: "-0.02em",
        }}
      >
        {copy?.title}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <AppIcon {...card.icon} size={iconSize} />
      </div>
    </div>
  );
}
