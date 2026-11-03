"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Pause, Play, SkipForward, X } from "lucide-react";
import LogoMark from "@/components/LogoMark";
import { cn } from "@/lib/cn";
import CodePane from "./CodePane";
import PreviewPane from "./PreviewPane";
import { buildFiles, type BuildCopy } from "./buildScript";
import { useBuildPlayer } from "./useBuildPlayer";
import { BUILD_PARAM, DONE_CLOSE_MS, SPEEDS } from "./BuildMode.constants";

/** Copy as it reads on the page: placeholders and the inline marks stripped. */
const clean = (s: string) =>
  s
    .replace(/\{\w+\}\s*/g, "")
    .replace(/[~*]/g, "")
    .trim();

const CONTROL =
  "flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-xs font-medium text-fg-dim ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Build mode: the site writing itself. The editor types each block's code
 * while the preview — the real page in a frame — rebuilds that block in step:
 * outlines, letters, colour, then images. Closes on its own when done.
 */
export default function BuildStudio({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Build");
  const all = useTranslations();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(SPEEDS[0]);

  const files = useMemo(() => {
    const section = (ns: string) => ({
      label: all(`${ns}.label`),
      title: all(`${ns}.title`),
      lead: all(`${ns}.lead`),
    });
    const copy: BuildCopy = {
      heroTitle1: all("Hero.titleLine1"),
      heroTitle2: all("Hero.titleLine2"),
      heroSub: all("Hero.sub"),
      effaceLabel: all("Efface.label"),
      effaceDefinition: all("Efface.definition"),
      effaceSentence: clean(all.raw("Efface.sentence") as string),
      work: section("Work"),
      capabilities: section("Capabilities"),
      approach: section("Approach"),
      about: { label: all("About.label"), title: all("About.title"), lead: (all.raw("About.paragraphs") as string[])[0] },
      testimonials: { label: all("Testimonials.label"), title: all("Testimonials.title"), lead: all("Testimonials.note") },
      contact: { ...section("Contact"), email: all("Contact.email") },
      footerTagline: clean(all.raw("Footer.tagline") as string),
      footerRights: all("Footer.rights"),
    };
    return buildFiles(copy);
  }, [all]);

  const player = useBuildPlayer(files, frameRef, speed);
  const { status, view, progress, skip } = player;
  // Built only on the client (the studio never server-renders).
  const src = useMemo(() => `${location.pathname}?${BUILD_PARAM}`, []);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Reduced motion: no typing — straight to the finished page.
  useEffect(() => {
    if (status === "playing" && matchMedia("(prefers-reduced-motion: reduce)").matches) skip();
  }, [status, skip]);

  useEffect(() => {
    if (status !== "done") return;
    const id = setTimeout(onClose, DONE_CLOSE_MS);
    return () => clearTimeout(id);
  }, [status, onClose]);

  const current = files[view.file].name;
  const statusLabel = status === "done" ? t("done") : t("building", { file: current });

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("title")}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="build-studio fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-bg/95 p-0 text-fg outline-none backdrop:bg-black/60"
    >
      <div className="flex h-full flex-col gap-3 p-3 md:gap-4 md:p-5">
        <header className="flex shrink-0 items-center gap-3">
          <LogoMark className="h-5 w-5 shrink-0 text-fg" />
          <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight">{t("title")}</h2>
          <span
            className={cn(
              "hidden items-center gap-1.5 truncate font-mono text-xs md:flex",
              status === "done" ? "text-accent-bright" : "text-fg-faint"
            )}
          >
            {status === "done" && <Check aria-hidden className="h-3.5 w-3.5" />}
            {statusLabel}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {status !== "done" && (
              <>
                <button
                  type="button"
                  disabled={status === "loading"}
                  onClick={status === "paused" ? player.resume : player.pause}
                  className={cn(CONTROL, "disabled:cursor-default disabled:opacity-40")}
                >
                  {status === "paused" ? (
                    <Play aria-hidden className="h-3.5 w-3.5 fill-current" />
                  ) : (
                    <Pause aria-hidden className="h-3.5 w-3.5 fill-current" />
                  )}
                  <span className="hidden sm:inline">{status === "paused" ? t("resume") : t("pause")}</span>
                </button>
                <button
                  type="button"
                  aria-label={t("speed")}
                  onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])}
                  className={cn(CONTROL, "w-12 justify-center font-mono tabular-nums")}
                >
                  {speed}×
                </button>
                <button type="button" disabled={status === "loading"} onClick={skip} className={cn(CONTROL, "disabled:cursor-default disabled:opacity-40")}>
                  <SkipForward aria-hidden className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("skip")}</span>
                </button>
              </>
            )}
            <button type="button" aria-label={t("close")} onClick={onClose} className={cn(CONTROL, "w-9 justify-center px-0")}>
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Code beside the preview from md up; stacked, code on top, on a phone. */}
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,2fr)] gap-3 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 xl:grid-cols-2 md:gap-4">
          <CodePane files={files} file={view.file} pos={view.pos} label={t("code")} typing={status === "playing"} />
          <PreviewPane
            frameRef={frameRef}
            src={src}
            title={t("preview")}
            loadingLabel={status === "loading" ? t("loading") : null}
            status={statusLabel}
          />
        </div>

        <div
          role="progressbar"
          aria-label={t("progress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          className="h-0.5 shrink-0 overflow-hidden rounded-full bg-white/10"
        >
          <div className="h-full origin-left bg-accent" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </dialog>
  );
}
