/**
 * Shape of the policy page content. The documents themselves live in `ko.ts`
 * and `en.ts` — one file per locale, since each runs to a few hundred lines.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; heading: string; text: string }
  | { kind: "pairs"; pairs: [string, string][] };

export type PolicySection = {
  id: string;
  num: string;
  kicker: string;
  title: string;
  date: string;
  blocks: Block[];
};

export type PolicyContent = {
  navLabel: string;
  pageTitle: string;
  pageLead: string;
  home: string;
  sections: PolicySection[];
};
