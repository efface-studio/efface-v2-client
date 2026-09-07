import type { FooterTagline } from "./Footer.types";

/**
 * Splits the tagline around its `~struck~` word — same convention as the
 * efface scene's sentence copy. The marker is never treated as HTML; the three
 * parts are rendered as separate React nodes.
 */
export function parseTagline(tagline: string): FooterTagline {
  const m = tagline.match(/^(.*?)~(.+?)~(.*)$/);
  return m
    ? { before: m[1], struck: m[2], after: m[3] }
    : { before: tagline, struck: "", after: "" };
}
