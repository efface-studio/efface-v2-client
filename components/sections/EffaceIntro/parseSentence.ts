import type { Token } from "./EffaceIntro.types";

/**
 * Parses the sentence copy into words and orbs.
 * `~word~` is struck through, `*word*` takes the accent colour, `{orb1}` is a
 * popping bead. Keeping the markup in the message means translators can move
 * the emphasis to wherever it lands naturally in their language.
 *
 * The markup is never interpreted as HTML — every token is rendered as a React
 * element, so copy can't inject markup into the page.
 */
export function parseSentence(src: string): Token[] {
  return src
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const orb = raw.match(/^\{(orb\d)\}$/);
      if (orb) return { kind: "orb", id: orb[1] } as Token;
      const strike = raw.startsWith("~");
      const accentAll = raw.startsWith("*");
      let text = raw;
      if (strike) text = text.replace(/^~/, "").replace(/~(?=[^~]*$)/, "");
      if (accentAll) text = text.replace(/^\*/, "").replace(/\*/, "");
      // `*efface*의` — accent only the starred run, keep the suffix attached
      return { kind: "word", text, strike, accent: accentAll } as Token;
    });
}
