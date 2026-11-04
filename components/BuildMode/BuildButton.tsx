"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ChevronDown, CodeXml, MousePointer2 } from "lucide-react";

// Each build loads on the first pick (or on intent), not with the page.
const loadStudio = () => import("./BuildStudio");
const loadSwarm = () => import("./swarm/SwarmBuild");
const BuildStudio = dynamic(loadStudio, { ssr: false });
const SwarmBuild = dynamic(loadSwarm, { ssr: false });

type BuildKind = "studio" | "swarm";

/** The nav's "Build" button — a menu of the two builds: the code studio and the swarm. */
export default function BuildButton() {
  const t = useTranslations("Build");
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState<BuildKind | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!menu) return;
    items.current[0]?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setMenu(false);
    };
    addEventListener("pointerdown", onDown);
    return () => removeEventListener("pointerdown", onDown);
  }, [menu]);

  const choose = (kind: BuildKind) => {
    setMenu(false);
    setOpen(kind);
  };
  const onMenuKey = (e: React.KeyboardEvent) => {
    const list = items.current.filter(Boolean) as HTMLButtonElement[];
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      setMenu(false);
      wrap.current?.querySelector<HTMLButtonElement>("[aria-haspopup]")?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      list[(at + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length]?.focus();
    }
  };

  const builds: { kind: BuildKind; icon: typeof CodeXml; load: () => Promise<unknown> }[] = [
    { kind: "studio", icon: CodeXml, load: loadStudio },
    { kind: "swarm", icon: MousePointer2, load: loadSwarm },
  ];

  return (
    // Hidden inside the studio's own preview (see `.build-stage`), and left out of the swarm's rebuild.
    <div ref={wrap} data-build-button data-build-menu className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menu}
        onClick={() => setMenu((v) => !v)}
        // Start fetching on intent, so whichever build is picked is there by the click.
        onPointerEnter={() => void loadStudio()}
        onFocus={() => void loadStudio()}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium text-fg-dim ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-expanded:bg-white/10 aria-expanded:text-fg"
      >
        <CodeXml aria-hidden className="h-3.5 w-3.5" />
        {t("open")}
        <ChevronDown aria-hidden className={`h-3 w-3 transition-transform ${menu ? "rotate-180" : ""}`} />
      </button>
      {menu && (
        <div
          role="menu"
          aria-label={t("menu.label")}
          onKeyDown={onMenuKey}
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl bg-surface p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
        >
          {builds.map(({ kind, icon: Icon, load }, i) => (
            <button
              key={kind}
              ref={(el) => {
                items.current[i] = el;
              }}
              type="button"
              role="menuitem"
              onClick={() => choose(kind)}
              onPointerEnter={() => void load()}
              onFocus={() => void load()}
              className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.06] focus-visible:outline-none"
            >
              <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-fg-dim" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-fg">{t(`menu.${kind}`)}</span>
                <span className="mt-0.5 block break-keep text-xs leading-relaxed text-fg-faint">{t(`menu.${kind}Hint`)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {/* Portalled out of the nav, which fades and slides away on scroll. */}
      {open === "studio" && createPortal(<BuildStudio onClose={() => setOpen(null)} />, document.body)}
      {open === "swarm" && <SwarmBuild onClose={() => setOpen(null)} />}
    </div>
  );
}
