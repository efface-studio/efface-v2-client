"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { siAppstore, siGithub } from "simple-icons";
import LinkedInMark from "@/components/LinkedInMark";
import LogoMark from "@/components/LogoMark";
import StackMark from "@/components/StackMark";
import { CAREER_LOGOS } from "./ProfilePanel.constants";
import type { ProfileCareer, ProfileLink, ProfileSkillGroup } from "./ProfilePanel.types";

/** A small brand-coloured tile, matching LinkedIn's own "in" badge. */
function Tile({ bg, children }: { bg: string; children: ReactNode }) {
  return (
    <span aria-hidden className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-white" style={{ background: bg }}>
      {children}
    </span>
  );
}

/** A company's logo on a small dark plate; its initial when we carry none. */
function CareerLogo({ career }: { career: ProfileCareer }) {
  const src = CAREER_LOGOS[career.key];
  return (
    <span aria-hidden className="flex h-11 w-16 shrink-0 items-center justify-center rounded-[5px] bg-white/[0.04] ring-1 ring-white/10">
      {career.key === "efface" ? (
        <LogoMark className="h-6 w-6 text-fg" />
      ) : src ? (
        <img src={src} alt="" className="max-h-5 max-w-12 object-contain" />
      ) : (
        <span className="text-base font-semibold text-fg-dim">{career.company.replace(/^\(주\)\s*/, "").charAt(0)}</span>
      )}
    </span>
  );
}

/** Each link's brand mark, picked by where it points. */
function LinkMark({ href }: { href: string }) {
  if (href.includes("linkedin.com"))
    return (
      <span aria-hidden className="flex h-4 w-4 items-center leading-none">
        <LinkedInMark size={16} />
      </span>
    );
  const icon = href.includes("github.com") ? siGithub : href.includes("apps.apple.com") ? siAppstore : null;
  if (!icon) return null;
  return (
    <Tile bg={`#${icon.hex}`}>
      <svg viewBox="0 0 24 24" className="h-[11px] w-[11px]" fill="currentColor">
        <path d={icon.path} />
      </svg>
    </Tile>
  );
}

/**
 * The founder's introduction in a drawer from the right edge, so a click on the
 * name stays on the site. Any `a[data-profile]` opens it (delegated, so callers
 * stay server-side); with script off the link still goes to LinkedIn.
 */
export default function ProfilePanel() {
  const t = useTranslations("Profile");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const career = t.raw("career") as ProfileCareer[];
  const skills = t.raw("skills") as ProfileSkillGroup[];
  const links = t.raw("links") as ProfileLink[];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      // Modified clicks keep the browser's own new-tab behaviour.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (!e.target.closest("a[data-profile]")) return;
      e.preventDefault();
      dialogRef.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="profile-name"
      // A click on the dialog itself (not its content) is a click on the backdrop.
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      className="profile-panel fixed inset-y-2 left-auto right-2 m-0 h-[calc(100dvh-1rem)] max-h-none w-[calc(100%-1rem)] max-w-[640px] overflow-y-auto overscroll-contain rounded-[5px] border border-white/10 bg-surface p-0 text-fg backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="relative px-6 pb-12 pt-6 md:px-10 md:pt-8">
        <form method="dialog" className="absolute right-5 top-5 md:right-8 md:top-7">
          <button
            aria-label={t("close")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/5 text-fg-dim ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-fg"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </form>

        {/* Header — photo, name, email. */}
        <header className="mt-6 flex items-end gap-5 pr-12">
          <img
            src="/about/founder-photo.webp"
            alt={t("photoAlt")}
            width={400}
            height={514}
            // A cut-out on transparency — no frame, the panel is its background.
            className="w-24 shrink-0 md:w-28"
          />
          <div className="min-w-0 pb-1">
            <h2 id="profile-name" className="text-3xl font-semibold tracking-tight">
              {t("name")}
            </h2>
            <p className="mt-1 text-sm text-fg-faint">{t("nameAlt")}</p>
            <a
              href={`mailto:${t("email")}`}
              className="mt-3 inline-block text-sm text-fg-dim underline decoration-white/20 underline-offset-4 transition-colors hover:text-fg hover:decoration-white/60"
            >
              {t("email")}
            </a>
          </div>
        </header>

        {/* Links sit right under the name, where they're looked for first. */}
        <ul aria-label={t("linksLabel")} className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                title={l.value}
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="flex items-center gap-2 text-sm text-fg-dim transition-colors hover:text-fg"
              >
                <LinkMark href={l.href} />
                <span className="underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-white/60">
                  {l.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 break-keep text-xl font-medium leading-snug tracking-tight">
          {t("headline")}
        </p>
        <p className="mt-4 break-keep leading-relaxed text-fg-dim">{t("summary")}</p>

        <section className="mt-10 border-t border-line pt-7">
          <h3 className="label">{t("careerLabel")}</h3>
          <ol className="mt-5 space-y-5">
            {career.map((c) => (
              <li key={c.key} className="flex items-center gap-4">
                <CareerLogo career={c} />
                {/* Period sits right of the name from sm up; on a phone it drops under the role. */}
                <div className="grid min-w-0 flex-1 gap-x-4 sm:grid-cols-[1fr_auto]">
                  <span className="break-keep font-medium">{c.company}</span>
                  <span className="order-last mt-1 whitespace-nowrap text-sm tabular-nums text-fg-faint sm:order-none sm:mt-0">
                    {c.period}
                  </span>
                  <span className="mt-1 break-keep text-sm text-fg-dim sm:col-span-2">{c.role}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 border-t border-line pt-7">
          <h3 className="label">{t("skillsLabel")}</h3>
          <dl className="mt-5 space-y-4">
            {skills.map((g) => (
              <div key={g.label}>
                <dt className="text-sm text-fg-faint">{g.label}</dt>
                <dd className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2.5">
                  {g.items.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 text-sm text-fg">
                      <StackMark item={item} />
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </dialog>
  );
}
