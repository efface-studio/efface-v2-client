"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { DURATION, menuItem, overlayFade } from "@/lib/motion";
import { useUIStore } from "@/store/ui.store";
import BuildButton from "@/components/BuildMode";
import LanguageToggle from "@/components/LanguageToggle";
import { NAV_ITEMS } from "./Nav.constants";
import type { NavOverlayProps } from "./Nav.types";

/** Full-screen menu: numbered links wiping up out of their own clipped rows. */
export default function NavOverlay({ onNavigate }: NavOverlayProps) {
  const t = useTranslations("Nav");
  const tc = useTranslations("Contact");
  const reduce = useReducedMotion();
  const setTourMenuSlot = useUIStore((s) => s.setTourMenuSlot);

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-y-auto bg-bg/95 backdrop-blur-xl"
      variants={overlayFade}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <nav className="mx-auto flex min-h-full max-w-[1400px] flex-col justify-center px-6 pb-8 pt-20 md:px-10 md:py-0">
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
          className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-5 md:mt-14 md:pt-8"
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
          <div className="flex w-full flex-wrap items-center justify-between gap-2 md:contents">
            <LanguageToggle />
            <div ref={setTourMenuSlot} className="empty:hidden md:hidden" />
            <div className="md:hidden">
              <BuildButton onChoose={onNavigate} />
            </div>
          </div>
        </motion.div>
      </nav>
    </motion.div>
  );
}
