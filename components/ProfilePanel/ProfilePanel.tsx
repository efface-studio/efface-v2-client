"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, X } from "lucide-react";
import type { ProfileCareer, ProfileLink, ProfileSkillGroup } from "./ProfilePanel.types";

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
      className="profile-panel fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-[520px] overflow-y-auto overscroll-contain border-l border-white/10 bg-surface p-0 text-fg backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="relative px-6 pb-12 pt-6 md:px-10 md:pt-8">
        <div className="flex items-center justify-between">
          <p className="label">
            <span className="text-accent">//</span> {t("title")}
          </p>
          <form method="dialog">
            <button
              aria-label={t("close")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/5 text-fg-dim ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-fg"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Header — photo, name, role. */}
        <header className="mt-8 flex items-end gap-5">
          <img
            src="/about/founder.webp"
            alt={t("photoAlt")}
            width={400}
            height={515}
            className="w-24 shrink-0 rounded-2xl object-cover ring-1 ring-white/10 md:w-28"
          />
          <div className="min-w-0 pb-1">
            <h2 id="profile-name" className="text-3xl font-semibold tracking-tight">
              {t("name")}
            </h2>
            <p className="mt-1 text-sm text-fg-faint">{t("nameAlt")}</p>
            <p className="mt-3 break-keep text-sm text-fg-dim">{t("role")}</p>
          </div>
        </header>

        {/* Links sit right under the name, where they're looked for first. */}
        <ul aria-label={t("linksLabel")} className="mt-6 flex flex-wrap gap-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                title={l.value}
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                className="group inline-flex items-center gap-1 rounded-full bg-white/5 py-2 pl-3.5 pr-3 text-sm text-fg ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-accent-bright"
              >
                {l.label}
                <ArrowUpRight
                  aria-hidden
                  className="h-3.5 w-3.5 text-fg-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
                />
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
              <li key={c.company} className="grid grid-cols-[1fr_auto] gap-x-4">
                <span className="break-keep font-medium">{c.company}</span>
                <span className="whitespace-nowrap text-sm tabular-nums text-fg-faint">{c.period}</span>
                <span className="col-span-2 mt-1 break-keep text-sm text-fg-dim">{c.role}</span>
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
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {g.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white/5 px-3 py-1 text-sm text-fg-dim ring-1 ring-white/10"
                    >
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
