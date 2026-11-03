"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { siAppstore, siGithub } from "simple-icons";
import LinkedInMark from "@/components/LinkedInMark";
import LogoMark from "@/components/LogoMark";
import { cn } from "@/lib/cn";
import StackMark from "@/components/StackMark";
import { CAREER_LOGOS } from "./ProfilePanel.constants";
import type { ProfileCareer, ProfileLink, ProfileSkillGroup } from "./ProfilePanel.types";

/** A company's logo as the company draws it; its initial when we carry none. */
function CareerLogo({ career }: { career: ProfileCareer }) {
  const logo = CAREER_LOGOS[career.key];
  return (
    <span aria-hidden className="flex h-11 w-16 shrink-0 items-center justify-center">
      {career.key === "efface" ? (
        <LogoMark className="h-9 w-9 text-fg" />
      ) : logo ? (
        <img src={logo.src} alt="" className={cn("max-h-8 max-w-16 object-contain", logo.className)} />
      ) : (
        <span className="text-base font-semibold text-fg-dim">{career.company.replace(/^㈜\s*/, "").charAt(0)}</span>
      )}
    </span>
  );
}

/** Each link's brand mark as the brand itself shows it on a dark surface. */
function LinkMark({ href }: { href: string }) {
  if (href.includes("linkedin.com"))
    return (
      <span aria-hidden className="flex">
        <LinkedInMark size={16} />
      </span>
    );
  // GitHub's mark stands alone, in white, on dark backgrounds.
  if (href.includes("github.com"))
    return (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-fg" fill="currentColor">
        <path d={siGithub.path} />
      </svg>
    );
  // The App Store icon: a sky-to-blue rounded square with the white "A".
  if (href.includes("apps.apple.com"))
    return (
      <span
        aria-hidden
        className="flex h-4 w-4 items-center justify-center rounded-[4px] text-white"
        style={{ background: "linear-gradient(180deg, #18BFFB, #2072F3)" }}
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
          <path d={siAppstore.path} />
        </svg>
      </span>
    );
  return null;
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

  // Slide out before the dialog actually closes; the close lands on the
  // animation's end. Reduced motion closes at once.
  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open || dialog.dataset.closing !== undefined) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return dialog.close();
    dialog.dataset.closing = "";
  }, []);

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
      onClick={(e) => e.target === e.currentTarget && close()}
      // Esc animates out too, instead of the browser's instant close.
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onAnimationEnd={(e) => {
        const dialog = e.currentTarget;
        if (e.target !== dialog || e.animationName !== "profile-out") return;
        delete dialog.dataset.closing;
        dialog.close();
      }}
      className="profile-panel fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-[880px] overflow-hidden rounded-l-[5px] p-0 text-fg outline-none backdrop:bg-black/40 backdrop:backdrop-blur-[3px]"
    >
      {/* The glass rim and sheen are pseudo-elements of the dialog, so the copy
          scrolls inside this layer instead and they stay put. */}
      <div className="profile-body relative h-full overflow-y-auto overscroll-contain px-6 pb-12 pt-6 md:px-10 md:pt-8">
        <button
          type="button"
          aria-label={t("close")}
          onClick={close}
          className="absolute right-5 top-5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/5 text-fg-dim ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-fg md:right-8 md:top-7"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>

        {/* Header — photo, name, email. */}
        <header className="mt-6 flex flex-wrap items-end gap-5 pr-12">
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
          {/* The motto and summary fill the space opposite the name from sm up;
              on a phone they follow it. */}
          <div className="w-full pb-1 sm:ml-auto sm:w-auto sm:max-w-[26rem]">
            <p className="break-keep text-lg font-medium leading-snug tracking-tight md:text-xl">{t("headline")}</p>
            <p className="mt-2.5 break-keep text-sm leading-relaxed text-fg-dim">{t("summary")}</p>
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

        <section className="mt-10 border-t border-line pt-7">
          <h3 className="label">{t("careerLabel")}</h3>
          <ol className="mt-5 space-y-5">
            {career.map((c) => (
              <li key={c.key} className="flex items-center gap-4">
                <CareerLogo career={c} />
                {/* Period and site sit right of the name from sm up; on a phone they drop under the role. */}
                <div className="grid min-w-0 flex-1 gap-x-4 sm:grid-cols-[1fr_auto]">
                  <span className="break-keep font-medium">{c.company}</span>
                  <span className="order-last mt-1 flex flex-col gap-1 sm:order-none sm:row-span-2 sm:mt-0 sm:items-end">
                    <span className="whitespace-nowrap text-sm tabular-nums text-fg-faint">{c.period}</span>
                    {c.site && (
                      <a
                        href={c.site}
                        target="_blank"
                        rel="noreferrer"
                        className="w-fit whitespace-nowrap text-sm text-fg-dim underline decoration-white/20 underline-offset-4 transition-colors hover:text-fg hover:decoration-white/60"
                      >
                        {new URL(c.site).hostname}
                      </a>
                    )}
                  </span>
                  <span className="mt-1 break-keep text-sm text-fg-dim">{c.role}</span>
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
