"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Pause, Play, SkipForward, X } from "lucide-react";
import LogoMark from "@/components/LogoMark";
import { cn } from "@/lib/cn";
import BuildSplash from "./BuildSplash";
import CodePane from "./CodePane";
import PreviewPane from "./PreviewPane";
import SplitHandle from "./SplitHandle";
import { toBuildFile } from "./buildScript";
import { useBuildPlayer } from "./useBuildPlayer";
import {
  BUILD_PARAM,
  BUILD_SOURCE_URL,
  DONE_CLOSE_MS,
  OUTRO_MS,
  RETURN_MS,
  SPEEDS,
  SPLIT_DEFAULT,
  SPLASH_LIFT_MS,
  SPLASH_MIN_MS,
} from "./BuildMode.constants";
import type { BuildFile, BuildRepoEntry, BuildSourceIndex } from "./BuildMode.types";

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const CONTROL =
  "flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-xs font-medium text-fg-dim ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Build mode: the site writing itself. The editor types each block's code
 * while the preview — the real page in a frame — rebuilds that block in step:
 * outlines, letters, colour, then images. Opens behind the efface splash,
 * closes on its own when done, and hands back to the page through it again.
 */
export default function BuildStudio({ onClose }: { onClose: () => void }) {
  const t = useTranslations("Build");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(SPEEDS[0]);
  // The preview's share of the studio; the divider between the panes drags it.
  const [split, setSplit] = useState(SPLIT_DEFAULT);

  // The components' real source, read at build time (app/build-source.json).
  const [files, setFiles] = useState<BuildFile[] | null>(null);
  const [tree, setTree] = useState<BuildRepoEntry[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(BUILD_SOURCE_URL, { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<BuildSourceIndex>) : Promise.reject(r.status)))
      .then((index) => {
        setFiles(index.files.map(toBuildFile));
        setTree(index.tree);
      })
      .catch(() => !ctrl.signal.aborted && setFailed(true));
    return () => ctrl.abort();
  }, []);

  // intro (splash up) → lifting (splash zooms away) → run → leaving (splash back, then gone)
  const [phase, setPhase] = useState<"intro" | "lifting" | "run" | "leaving">("intro");
  const [minSplash, setMinSplash] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinSplash(true), reducedMotion() ? 0 : SPLASH_MIN_MS);
    return () => clearTimeout(id);
  }, []);

  const player = useBuildPlayer(files, frameRef, speed, phase !== "intro");
  const { loaded, status, view, progress, focus, skip } = player;

  // The splash lifts once the studio behind it is ready (or has failed to be).
  useEffect(() => {
    if (phase === "intro" && minSplash && (loaded || failed)) setPhase("lifting");
  }, [phase, minSplash, loaded, failed]);
  useEffect(() => {
    if (phase !== "lifting") return;
    const id = setTimeout(() => setPhase("run"), reducedMotion() ? 0 : SPLASH_LIFT_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // Leaving: the splash comes back over the studio, then the page fades up.
  const leave = useCallback(() => {
    if (reducedMotion()) return onClose();
    setPhase("leaving");
    setTimeout(() => {
      const html = document.documentElement;
      html.classList.add("build-return");
      setTimeout(() => html.classList.remove("build-return"), RETURN_MS);
      onClose();
    }, OUTRO_MS);
  }, [onClose]);
  // Built only on the client (the studio never server-renders).
  const src = useMemo(() => `${location.pathname}?${BUILD_PARAM}`, []);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Reduced motion: no typing — straight to the finished page.
  useEffect(() => {
    if (status === "playing" && reducedMotion()) skip();
  }, [status, skip]);

  useEffect(() => {
    if (status !== "done") return;
    const id = setTimeout(leave, DONE_CLOSE_MS);
    return () => clearTimeout(id);
  }, [status, leave]);

  const current = files?.[view.file].name ?? "";
  const statusLabel = status === "done" ? t("done") : t("building", { file: current });

  return (
    <dialog
      ref={dialogRef}
      aria-label={t("title")}
      onCancel={(e) => {
        e.preventDefault();
        if (phase !== "leaving") leave();
      }}
      data-leaving={phase === "leaving" ? "" : undefined}
      className="build-studio fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-[#050506] p-0 text-fg outline-none backdrop:bg-black/80"
    >
      {phase !== "run" && (
        <BuildSplash
          phase={phase === "leaving" ? "outro" : "intro"}
          leaving={phase === "lifting"}
          caption={phase === "leaving" ? t("outro") : failed ? t("error") : t("intro")}
        />
      )}
      <div className="build-studio__chrome flex h-full flex-col gap-3 p-3 md:gap-4 md:p-5">
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
            <button type="button" aria-label={t("close")} onClick={leave} className={cn(CONTROL, "w-9 justify-center px-0")}>
              <X aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Preview and editor, 7:3 to start and dragged from there — side by
            side from md up, stacked (preview on top) on a phone. */}
        <div className={cn("flex min-h-0 flex-1 flex-col md:flex-row", phase !== "intro" && "build-studio__panes")}>
          <div className="flex min-h-0 min-w-0 shrink-0 flex-col" style={{ flexBasis: `${split * 100}%` }}>
            <PreviewPane
              frameRef={frameRef}
              src={src}
              title={t("preview")}
              loadingLabel={failed ? t("error") : status === "loading" ? t("loading") : null}
              status={statusLabel}
              focus={focus}
            />
          </div>
          <SplitHandle value={split} onChange={setSplit} label={t("resize")} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {files ? (
              <CodePane files={files} tree={tree} file={view.file} pos={view.pos} label={t("code")} typing={status === "playing"} />
            ) : (
              <div aria-hidden className="flex-1 rounded-[6px] bg-[#101118] ring-1 ring-white/[0.06]" />
            )}
          </div>
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
