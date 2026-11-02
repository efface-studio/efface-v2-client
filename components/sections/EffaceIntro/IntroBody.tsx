"use client";

import { MONO, ORB_SHADOW, ORB_STYLES } from "./EffaceIntro.constants";
import type { IntroBodyProps } from "./EffaceIntro.types";

/**
 * Label, dictionary definition and the animated sentence. Shared by both
 * layouts — only the type scale and padding change below `md`.
 */
export default function IntroBody({
  tokens,
  label,
  definition,
  isMobile,
  refs,
}: IntroBodyProps) {
  const { fitRef, typeRef, defRef, wordRefs, lineRefs, orbRefs } = refs;

  return (
    <div
      ref={fitRef}
      style={{
        position: "relative",
        maxWidth: 1080,
        width: "100%",
        margin: "0 auto",
        padding: isMobile ? "0 24px" : "0 48px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: "0.34em",
          marginBottom: 28,
        }}
      >
        <span style={{ color: "#3B82F6" }}>//&nbsp;&nbsp;</span>
        <span ref={typeRef}>{label}</span>
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

      <p
        ref={defRef}
        style={{
          margin: isMobile ? "0 0 36px" : "0 0 52px",
          fontFamily: MONO,
          fontSize: isMobile ? 13 : 14.5,
          color: "#8A8A93",
          lineHeight: 1.9,
          maxWidth: 760,
          minHeight: "3.8em",
        }}
      >
        {definition}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: isMobile ? "clamp(20px, 6vw, 28px)" : "clamp(30px, 3.4vw, 50px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.52,
          color: "#F4F4F6",
          maxWidth: 1000,
          textWrap: "pretty",
        }}
      >
        {tokens.map((tk, i) =>
          tk.kind === "orb" ? (
            <span
              key={i}
              ref={(el) => {
                orbRefs.current[i] = el;
              }}
              aria-hidden
              style={{
                display: "inline-block",
                width: "0.8em",
                height: "0.8em",
                borderRadius: "50%",
                background: ORB_STYLES[tk.id],
                boxShadow: ORB_SHADOW[tk.id],
                verticalAlign: "-0.06em",
                margin: "0 0.1em",
                transform: "scale(0)",
              }}
            />
          ) : (
            <span key={i}>
              <span
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                style={{
                  color: "#33333B",
                  fontWeight: tk.accent ? 800 : undefined,
                  position: tk.strike ? "relative" : undefined,
                  display: tk.strike ? "inline-block" : undefined,
                }}
              >
                {tk.text}
                {tk.strike && (
                  <span
                    ref={(el) => {
                      lineRefs.current[i] = el;
                    }}
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: "-2%",
                      right: "-2%",
                      top: "52%",
                      height: "0.09em",
                      background: "#3B82F6",
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                      borderRadius: 2,
                    }}
                  />
                )}
              </span>{" "}
            </span>
          )
        )}
      </p>
    </div>
  );
}
