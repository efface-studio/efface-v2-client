"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence } from "motion/react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/store/ui.store";
import LanguageToggle from "@/components/LanguageToggle";
import LogoMark from "@/components/LogoMark";
import NavOverlay from "./NavOverlay";
import { HIDE_BAR_AFTER } from "./Nav.constants";
import { useNavOverlay } from "./useNavOverlay";
import { useScrolledPast } from "./useScrolledPast";

export default function Nav() {
  const t = useTranslations("Nav");
  const isOpen = useUIStore((s) => s.isNavOpen);
  const toggleNav = useUIStore((s) => s.toggleNav);
  const closeNav = useUIStore((s) => s.closeNav);
  const scrolled = useScrolledPast(HIDE_BAR_AFTER);

  useNavOverlay();

  return (
    <>
      {/* Visible only at the very top of the page: the oversized display type in
          the scenes below runs right under the viewport edge, and a persistent
          bar clipped it. Stays put while the overlay menu is open so the close
          button remains reachable. */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[transform,opacity] duration-300 ease-out",
          scrolled && !isOpen
            ? "pointer-events-none -translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="efface home">
            <LogoMark className="h-6 w-6 text-fg transition-transform duration-500 group-hover:rotate-[-8deg]" />
            <span className="text-lg font-semibold lowercase tracking-tight text-fg">
              efface
            </span>
          </Link>

          <div className="flex items-center gap-5 md:gap-7">
            <LanguageToggle />
            <button
              type="button"
              onClick={toggleNav}
              className="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
              aria-label={isOpen ? t("close") : t("menu")}
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "h-px w-6 bg-fg transition-all duration-300",
                  isOpen && "translate-y-[3px] rotate-45"
                )}
              />
              <span
                className={cn(
                  "h-px w-6 bg-fg transition-all duration-300",
                  isOpen && "-translate-y-[3px] -rotate-45"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>{isOpen && <NavOverlay onNavigate={closeNav} />}</AnimatePresence>
    </>
  );
}
