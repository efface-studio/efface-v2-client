import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LogoMark from "./LogoMark";

const NAV = [
  { key: "work", href: "#work" },
  { key: "apps", href: "#apps" },
  { key: "capabilities", href: "#capabilities" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;

export default function Footer() {
  const t = useTranslations("Footer");
  const tn = useTranslations("Nav");
  const tc = useTranslations("Contact");

  return (
    <footer className="border-t border-line bg-bg-soft">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20">
        <div className="flex flex-col gap-14 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-6 w-6 text-fg" />
              <span className="text-lg font-semibold lowercase tracking-tight">
                efface
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-fg-dim">
              {t("tagline")}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.15em] text-fg-faint">
              {t("studio")}
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-16 sm:gap-24">
            <nav>
              <p className="label mb-5">{t("navTitle")}</p>
              <ul className="space-y-3">
                {NAV.map((item) => (
                  <li key={item.key}>
                    <a
                      href={item.href}
                      className="text-sm text-fg-dim transition-colors hover:text-fg"
                    >
                      {tn(`items.${item.key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="label mb-5">{t("contactTitle")}</p>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`mailto:${tc("email")}`}
                    className="text-sm text-fg-dim transition-colors hover:text-fg"
                  >
                    {tc("email")}
                  </a>
                </li>
                <li className="text-sm text-fg-dim">
                  <span className="text-fg-faint">{t("founderLabel")}</span>{" "}
                  {t("founder")}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col-reverse gap-4 border-t border-line pt-8 text-xs text-fg-faint sm:flex-row sm:items-center sm:justify-between">
          <p>{t("rights")}</p>
          <a
            href="#top"
            className="uppercase tracking-[0.15em] transition-colors hover:text-fg-dim"
          >
            {t("backToTop")} ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
