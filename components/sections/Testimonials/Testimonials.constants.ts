/**
 * Stand-ins for the names and companies behind the blur. They are not the
 * clients' — the real ones never reach the page, where the source would give
 * them away — just text of a believable shape for the blur to soften.
 */
export const MASKS = [
  { name: "Jamie R.", company: "Studio Co.", color: "#fde68a" },
  { name: "Alex K.", company: "Northlab", color: "#bfdbfe" },
  { name: "Sam P.", company: "Atelier", color: "#fca5a5" },
  { name: "Robin L.", company: "Bright Inc.", color: "#bbf7d0" },
  { name: "Jordan C.", company: "Field Corp.", color: "#fbcfe8" },
  { name: "Casey H.", company: "Lumen", color: "#ddd6fe" },
  { name: "Taylor O.", company: "Orbit Inc.", color: "#fed7aa" },
  { name: "Morgan Y.", company: "Harbor", color: "#a7f3d0" },
  { name: "Riley S.", company: "Vector Tech", color: "#a5b4fc" },
  { name: "Quinn M.", company: "Tide", color: "#bae6fd" },
];

/** Seconds a row takes to drift one full set of cards. */
export const MARQUEE_S = 45;
/** Card sets per marquee half. 2 × 5 cards ≈ 4,400px — wider than any
 *  common screen, so a row never shows an empty stretch. */
export const SETS_PER_HALF = 2;
