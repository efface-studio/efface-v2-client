"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";

/**
 * KO / EN switch. Keeps the current path, swaps the locale via next-intl's
 * locale-aware router (writes the locale cookie + updates the URL prefix).
 */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: "ko" | "en") => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  const base =
    "text-xs tracking-wide transition-colors duration-200 disabled:opacity-100";

  return (
    <div
      className={`flex items-center gap-1.5 font-mono ${isPending ? "opacity-60" : ""} ${className}`}
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("ko")}
        className={`${base} ${locale === "ko" ? "text-fg" : "text-fg-faint hover:text-fg-dim"}`}
        aria-current={locale === "ko"}
      >
        KO
      </button>
      <span className="text-fg-faint/50" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`${base} ${locale === "en" ? "text-fg" : "text-fg-faint hover:text-fg-dim"}`}
        aria-current={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
