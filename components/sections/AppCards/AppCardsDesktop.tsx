"use client";

import type { CSSProperties } from "react";
import CardFace from "./CardFace";
import {
  CARD_GAP,
  CARDS,
  CFG,
  ICON_SIZE_DESKTOP,
  PERSPECTIVE,
  SCENE_LENGTH_VH,
} from "./AppCards.constants";
import type { AppCardsDesktopProps } from "./AppCards.types";

const WORD_STYLE: CSSProperties = {
  position: "absolute",
  left: 0,
  width: "100%",
  textAlign: "center",
  fontFamily: "'Archivo Black', sans-serif",
  fontSize: "clamp(110px, 15.5vw, 250px)",
  lineHeight: 0.82,
  color: "#fff",
  zIndex: 1,
  pointerEvents: "none",
  userSelect: "none",
  whiteSpace: "nowrap",
};

/** One oversized backing word, split into letters the scene can light up. */
function DisplayWord({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} style={{ color: "#3A3A40" }}>
          {ch}
        </span>
      ))}
    </>
  );
}

/** The pinned scene: a fanned deck dealing in over two parallaxing display words. */
export default function AppCardsDesktop({
  cards,
  word1,
  word2,
  refs,
}: AppCardsDesktopProps) {
  const { sceneRef, wordTopRef, wordBottomRef, rowRef, cardRefs } = refs;

  return (
    <section
      id="apps"
      ref={sceneRef}
      style={{
        height: `${SCENE_LENGTH_VH}vh`,
        position: "relative",
        background: "var(--color-bg)",
      }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* The source scene used a flat #131315 fill, which left a visible seam
            against the page background. Same tone comes back as a soft radial
            wash that fades to the page colour at the edges — no seam. */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(125% 85% at 50% 45%, #17171a 0%, #101012 42%, var(--color-bg) 78%)",
          }}
        />
        <div ref={wordTopRef} style={{ ...WORD_STYLE, top: 0 }}>
          <DisplayWord text={word1} />
        </div>
        <div
          ref={wordBottomRef}
          style={{ ...WORD_STYLE, bottom: "-1vh", letterSpacing: "0.12em" }}
        >
          <DisplayWord text={word2} />
        </div>

        {/* Perspective lives on the row, so every card is a real plane in one
            shared space rather than a rectangle with a 2D rotation on it. */}
        <div
          ref={rowRef}
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: `${PERSPECTIVE}px`,
            perspectiveOrigin: "50% 46%",
            gap: CARD_GAP,
          }}
        >
          {CARDS.map((card, i) => (
            <div
              key={card.key}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{
                position: "relative",
                flex: "none",
                transform: `translate3d(0px, ${CFG[i].oy}px, 0px) rotateZ(${CFG[i].rot}deg)`,
                transformStyle: "preserve-3d",
                // `opacity` is left out on purpose — hinting it makes the box a
                // grouping context, which flattens the preserve-3d subtree and
                // would park the cast shadow flat against the face.
                willChange: "transform",
              }}
            >
              {/* Sits behind the face in Z, so the perspective divide offsets and
                  spreads it on its own as the card tilts — no shadow maths, and
                  nothing here repaints. */}
              <div className="app-card__shadow" aria-hidden />
              <CardFace card={card} copy={cards[i]} iconSize={ICON_SIZE_DESKTOP} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
