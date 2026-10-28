"use client";

import { Fragment, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";
import type { LanguageToggleProps } from "./LanguageToggle.types";

const BUTTON_BASE =
  "text-xs tracking-wide transition-colors duration-200 disabled:opacity-100";

/**
 * KO / EN switch. Keeps the current path, swaps the locale via next-intl's
 * locale-aware router (writes the locale cookie + updates the URL prefix).
 */
export default function LanguageToggle({ className }: LanguageToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      className={cn("flex items-center gap-1.5 font-mono", isPending && "opacity-60", className)}
      aria-label="Language"
    >
      {routing.locales.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span className="text-fg-faint/50" aria-hidden>
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => switchTo(l)}
            className={cn(
              BUTTON_BASE,
              locale === l ? "text-fg" : "text-fg-faint hover:text-fg-dim"
            )}
            aria-current={locale === l}
          >
            {l.toUpperCase()}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
