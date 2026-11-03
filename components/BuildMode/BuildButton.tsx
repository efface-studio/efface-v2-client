"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { CodeXml } from "lucide-react";

// The studio (and its editor) loads on the first press, not with the page.
const loadStudio = () => import("./BuildStudio");
const BuildStudio = dynamic(loadStudio, { ssr: false });

/** The nav's "Build" button — opens build mode over the page. */
export default function BuildButton() {
  const t = useTranslations("Build");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        // Hidden inside the studio's own preview (see `.build-stage`).
        data-build-button
        onClick={() => setOpen(true)}
        // Start fetching on intent, so the studio is there by the click.
        onPointerEnter={() => void loadStudio()}
        onFocus={() => void loadStudio()}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium text-fg-dim ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <CodeXml aria-hidden className="h-3.5 w-3.5" />
        {t("open")}
      </button>
      {/* Portalled out of the nav, which fades and slides away on scroll. */}
      {open && createPortal(<BuildStudio onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
