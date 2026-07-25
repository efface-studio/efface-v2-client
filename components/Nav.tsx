"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import LanguageToggle from "./LanguageToggle";
import LogoMark from "./LogoMark";

const ITEMS = [
  { key: "work", href: "#work" },
  { key: "apps", href: "#apps" },
  { key: "capabilities", href: "#capabilities" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;

export default function Nav() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Contact");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  // Darken + hairline the bar once the hero scrolls past.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Visible only at the very top of the page: the oversized display type in
          the scenes below runs right under the viewport edge, and a persistent
          bar clipped it. Stays put while the overlay menu is open so the close
          button remains reachable. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[transform,opacity] duration-300 ease-out ${
          scrolled && !open
            ? "pointer-events-none -translate-y-full opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="efface home"
          >
            <LogoMark className="h-6 w-6 text-fg transition-transform duration-500 group-hover:rotate-[-8deg]" />
            <span className="text-lg font-semibold lowercase tracking-tight text-fg">
              efface
            </span>
          </Link>

          <div className="flex items-center gap-5 md:gap-7">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative z-50 flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
              aria-label={open ? t("close") : t("menu")}
              aria-expanded={open}
            >
              <span
                className={`h-px w-6 bg-fg transition-all duration-300 ${
                  open ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-6 bg-fg transition-all duration-300 ${
                  open ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 md:px-10">
              <ul className="space-y-2 md:space-y-3">
                {ITEMS.map((item, i) => (
                  <li key={item.key} className="overflow-hidden">
                    <motion.a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-5 py-1"
                      initial={reduce ? false : { y: "100%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "100%", opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.08 + i * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <span className="font-mono text-sm text-fg-faint">
                        0{i + 1}
                      </span>
                      <span className="text-4xl font-semibold tracking-tight text-fg-dim transition-colors duration-300 group-hover:text-fg sm:text-5xl md:text-6xl">
                        {t(`items.${item.key}`)}
                      </span>
                    </motion.a>
                  </li>
                ))}
              </ul>

              <motion.div
                className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-8"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <a
                  href={`mailto:${tc("email")}`}
                  className="link-underline text-sm text-fg-dim hover:text-fg"
                >
                  {tc("email")}
                </a>
                <LanguageToggle />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
