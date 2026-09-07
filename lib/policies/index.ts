/**
 * Policy page content. Kept out of `messages/*.json` on purpose — it's long-form
 * prose, not UI copy, and the JSON files are already sizeable.
 *
 * These are drafts; the page says so explicitly. Legal review is still needed.
 */

import { EN } from "./en";
import { KO } from "./ko";
import type { PolicyContent } from "./policies.types";

export type { Block, PolicyContent, PolicySection } from "./policies.types";

/** Falls back to English for any locale that has no translated documents. */
export function getPolicies(locale: string): PolicyContent {
  return locale === "ko" ? KO : EN;
}
