"use client";

import CapabilityCard from "./CapabilityCard";
import MagnifierLens from "./MagnifierLens";
import SplitHeadline from "./SplitHeadline";
import { COLUMN_COUNT, MONO, SCENE_LENGTH_VH } from "./Capabilities.constants";
import type { CapabilitiesDesktopProps } from "./Capabilities.types";

/** Pinned 2×2 grid that deals itself out, with a magnifier over hovered rows. */
export default function CapabilitiesDesktop({
  groups,
  label,
  title,
  lead,
  rootRef,
  refs,
}: CapabilitiesDesktopProps) {
  const {
    spotRef,
    fitRef,
    typeRef,
    subRef,
    gridWrapRef,
    gridRef,
    lineHRef,
    lineVRef,
    lensRef,
    lensInnerRef,
    cursorDotRef,
    capRefs,
  } = refs;

  return (
    <section
      id="capabilities"
      ref={rootRef}
      style={{
        position: "relative",
        height: `${SCENE_LENGTH_VH}vh`,
        background: "var(--color-bg)",
        color: "#EDEDEF",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {/* The spotlight roams the whole pinned frame; feathering the frame's top
            and bottom keeps it from ending in a hard line where the frame meets
            the section above while it slides into view. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
            maskImage: "linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent)",
          }}
        >
          <div
            ref={spotRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 900,
              height: 900,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.06), rgba(0,0,0,0) 65%)",
              willChange: "transform",
            }}
          />
        </div>

        <div
          ref={fitRef}
          style={{
            position: "relative",
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: "0 48px",
            boxSizing: "border-box",
          }}
        >
          {/* label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: "0.34em",
              marginBottom: 34,
            }}
          >
            <span style={{ color: "#3B82F6" }}>//&nbsp;&nbsp;</span>
            <span ref={typeRef} style={{ color: "#82828B" }}>
              {label}
            </span>
            <span
              aria-hidden
              className="cap-caret"
              style={{
                display: "inline-block",
                width: 9,
                height: 16,
                background: "#3B82F6",
                marginLeft: 8,
              }}
            />
          </div>

          {/* headline — split into words, then letters */}
          <div style={{ position: "relative", margin: "0 0 26px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(44px, 5.6vw, 76px)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.04,
                color: "#F4F4F6",
                textWrap: "balance",
              }}
            >
              <SplitHeadline
                text={title}
                wordStyle={{ display: "inline-block", verticalAlign: "top" }}
                letterStyle={{
                  display: "inline-block",
                  opacity: 0,
                  willChange: "transform, opacity",
                }}
              />
            </h2>
          </div>

          <p
            ref={subRef}
            style={{
              margin: "0 0 96px",
              fontSize: 22,
              color: "#9A9AA3",
              opacity: 0,
              transform: "translateY(14px)",
              maxWidth: 720,
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {lead}
          </p>

          {/* grid */}
          <div ref={gridWrapRef} style={{ position: "relative" }}>
            <div
              ref={lineHRef}
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 1,
                background: "#232329",
                transform: "scaleX(0)",
                transformOrigin: "left",
              }}
            />
            <div
              ref={lineVRef}
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: 1,
                background: "#232329",
                transform: "scaleY(0)",
                transformOrigin: "top",
              }}
            />

            <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {groups.slice(0, COLUMN_COUNT).map((group, c) => (
                <CapabilityCard
                  key={group.no}
                  group={group}
                  column={c}
                  cardRef={(el) => {
                    capRefs.current[c] = el;
                  }}
                />
              ))}
            </div>

            <MagnifierLens
              lensRef={lensRef}
              lensInnerRef={lensInnerRef}
              cursorDotRef={cursorDotRef}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
