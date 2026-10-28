"use client";

import { ACCENTS, DOT_COLORS, MONO } from "./Capabilities.constants";
import type { CapabilityCardProps } from "./Capabilities.types";

/**
 * One column of the desktop grid: a numbered discipline, its deliverables as
 * dashed rows, and its tool stack as dotted chips. Every animated part is
 * tagged (`data-row`, `data-dash`, `data-chip`, `data-glow`) so the scene's
 * loop can find it without prop drilling a ref per element.
 */
export default function CapabilityCard({ group, column, cardRef }: CapabilityCardProps) {
  const accent = ACCENTS[column];

  return (
    <div
      ref={cardRef}
      className="cap-card"
      style={{
        ["--acc" as string]: accent.hex,
        position: "relative",
        padding: "58px 56px 62px",
        opacity: 0,
        willChange: "transform",
      }}
    >
      <div
        data-glow=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.35s",
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 15,
            marginBottom: 32,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 13, color: accent.hex }}>
            {group.no}
          </span>
          <h3
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 650,
              letterSpacing: "-0.01em",
              color: "#F2F2F4",
            }}
          >
            {group.title}
          </h3>
        </div>

        {group.items.map((item) => (
          <div
            key={item}
            data-row=""
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "11px 0",
              opacity: 0,
            }}
          >
            <span
              data-dash=""
              aria-hidden
              style={{
                width: 20,
                height: 1.5,
                background: `rgba(${accent.rgb},0.6)`,
                transform: "scaleX(0)",
                transformOrigin: "left",
                flex: "none",
              }}
            />
            <span style={{ fontSize: 15.5, color: "#B4B4BC" }}>{item}</span>
          </div>
        ))}

        <div style={{ display: "flex", gap: "12px 24px", marginTop: 30, flexWrap: "wrap" }}>
          {group.tools.map((tool, ti) => (
            <span
              key={tool}
              data-chip=""
              className="cap-chip"
              style={{ ["--dot" as string]: DOT_COLORS[ti % DOT_COLORS.length] }}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
