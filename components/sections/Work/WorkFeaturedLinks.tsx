import { useTranslations } from "next-intl";
import type { WorkLinks } from "./Work.types";

/** Render order for the link row. */
const ORDER = ["appStore", "playStore", "github", "web"] as const;

/** Outbound pill links under a featured project. Renders nothing when empty. */
export default function WorkFeaturedLinks({ links }: { links?: WorkLinks }) {
  const t = useTranslations("Work.featured.links");
  const items = ORDER.flatMap((key) => (links?.[key] ? [{ key, href: links[key] }] : []));
  if (items.length === 0) return null;

  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {items.map(({ key, href }) => (
        <li key={key}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-fg-dim transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t(key)}
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="none">
              <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className="sr-only">({t("newTab")})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
