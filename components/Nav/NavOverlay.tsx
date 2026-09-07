"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { DURATION, menuItem, overlayFade } from "@/lib/motion";
import LanguageToggle from "@/components/LanguageToggle";
import { NAV_ITEMS } from "./Nav.constants";
import type { NavOverlayProps } from "./Nav.types";

/** Full-screen menu: numbered links wiping up out of their own clipped rows. */
export default function NavOverlay({ onNavigate }: NavOverlayProps) {
  const t = useTranslations("Nav");
  const tc = useTranslations("Contact");
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl"
      variants={overlayFade}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <nav className="mx-auto flex h-full max-w-[1400px] flex-col justify-center px-6 md:px-10">
        <ul className="space-y-2 md:space-y-3">
          {NAV_ITEMS.map((item, i) => (
            <li key={item.key} className="overflow-hidden">
              <motion.a
                href={item.href}
                onClick={onNavigate}
                className="group flex items-baseline gap-5 py-1"
                variants={menuItem(i)}
                initial={reduce ? false : "hidden"}
                animate="visible"
                exit="exit"
              >
                <span className="font-mono text-sm text-fg-faint">0{i + 1}</span>
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
          transition={{ duration: DURATION.fast, delay: 0.35 }}
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
  );
}
