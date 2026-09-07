"use client";

import CardFace from "./CardFace";
import { CARDS, ICON_SIZE_MOBILE } from "./AppCards.constants";
import type { AppCardsMobileProps } from "./AppCards.types";

/**
 * The pinned scene scales everything to ~26%, which drops body copy to ~5px.
 * Below `md` the deck falls back to a plain stacked list at full type size.
 */
export default function AppCardsMobile({
  cards,
  word1,
  word2,
  refs,
}: AppCardsMobileProps) {
  const { rootRef, cardRefs } = refs;

  return (
    <section id="apps" ref={rootRef} className="bg-bg px-6 py-20">
      <p className="label">
        <span className="text-accent">//</span> {word1} {word2}
      </p>
      <div className="mt-10 flex flex-col items-center gap-6">
        {CARDS.map((card, i) => (
          <div
            key={card.key}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{ opacity: 0, willChange: "transform, opacity" }}
          >
            <CardFace card={card} copy={cards[i]} iconSize={ICON_SIZE_MOBILE} />
          </div>
        ))}
      </div>
    </section>
  );
}
