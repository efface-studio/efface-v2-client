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

  // Each build gets an app-icon tile, as a macOS menu would show it.
  const builds: { kind: BuildKind; icon: typeof CodeXml; tile: string; load: () => Promise<unknown> }[] = [
    { kind: "studio", icon: CodeXml, tile: "from-[#3b8bff] to-[#2456d6]", load: loadStudio },
    { kind: "swarm", icon: MousePointer2, tile: "from-[#b46cff] to-[#6a3be5]", load: loadSwarm },
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
        // A macOS-style menu: frosted, hairline-edged, softly lifted.
        <div
          role="menu"
          aria-label={t("menu.label")}
          onKeyDown={onMenuKey}
          className="build-menu absolute right-0 top-full z-50 mt-2 w-[19rem] origin-top-right rounded-[12px] border-[0.5px] border-white/15 bg-[rgba(36,36,40,0.72)] p-[5px] shadow-[0_0_0_0.5px_rgba(0,0,0,0.6),0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl backdrop-saturate-[1.8]"
        >
          {builds.map(({ kind, icon: Icon, tile, load }, i) => (
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
              className="group flex w-full cursor-pointer items-center gap-3 rounded-[7px] px-2.5 py-2 text-left hover:bg-[#0a84ff] focus-visible:bg-[#0a84ff] focus-visible:outline-none"
            >
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-b ${tile} shadow-[inset_0_0.5px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.4)]`}
              >
                <Icon className="h-[15px] w-[15px] text-white" strokeWidth={2.25} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium leading-tight tracking-[-0.01em] text-white">{t(`menu.${kind}`)}</span>
                <span className="mt-0.5 block break-keep text-[11.5px] leading-snug text-white/55 group-hover:text-white/85 group-focus-visible:text-white/85">
                  {t(`menu.${kind}Hint`)}
                </span>
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
