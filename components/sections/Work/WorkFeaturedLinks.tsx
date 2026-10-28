import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { BRAND_LOGOS, GITHUB_PATH } from "./brandIcons";
import type { WorkIcon, WorkLinks } from "./Work.types";

/** Render order for the link row. */
const ORDER = ["appStore", "playStore", "github", "githubServer", "web"] as const;

interface WorkFeaturedLinksProps {
  links?: WorkLinks;
  /** The service's own app icon, used on the website button. */
  webIcon?: WorkIcon;
}

/** Outbound pill links under a featured project. Renders nothing when empty. */
export default function WorkFeaturedLinks({ links, webIcon }: WorkFeaturedLinksProps) {
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
            className="inline-flex items-center gap-2 rounded-full border border-line py-1.5 pl-3 pr-3.5 text-sm text-fg-dim transition-colors hover:border-line-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {key === "web" ? (
              webIcon && (
                <span
                  aria-hidden
                  className="flex h-4 w-4 shrink-0 overflow-hidden rounded-[4px]"
                  style={{ background: webIcon.bg }}
                >
                  <img
                    src={webIcon.src}
                    alt=""
                    className={cn("h-full w-full object-contain", webIcon.inset && "p-[18%]")}
                  />
                </span>
              )
            ) : key === "github" || key === "githubServer" ? (
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-fg" fill="currentColor">
                <path d={GITHUB_PATH} />
              </svg>
            ) : (
              <img src={BRAND_LOGOS[key]} alt="" aria-hidden className="h-4 w-4 shrink-0 object-contain" />
            )}
            {t(key)}
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 opacity-60" fill="none">
              <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <span className="sr-only">({t("newTab")})</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
