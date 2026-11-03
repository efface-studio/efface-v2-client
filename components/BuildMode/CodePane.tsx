"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import { useTranslations } from "next-intl";
import {
  Bell,
  Blocks,
  Bug,
  ChevronRight,
  CircleUser,
  CircleX,
  Files,
  GitBranch,
  Search,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import Explorer from "./Explorer";
import FileIcon from "./FileIcon";
import { tokenize } from "./highlight";
import { REPO_FILE_URL } from "./BuildMode.constants";
import type { BuildFile, BuildRepoEntry, BuildToken } from "./BuildMode.types";

// The editor's own face, fetched with the studio rather than the page.
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

// Tokyo Night, on a darker workbench.
const TOKEN_CLASS: Record<BuildToken["kind"], string> = {
  tag: "text-[#f7768e]",
  component: "text-[#2ac3de]",
  bracket: "text-[#89ddff]/80",
  attr: "italic text-[#bb9af7]",
  str: "text-[#9ece6a]",
  hex: "text-[#9ece6a]",
  num: "text-[#ff9e64]",
  key: "text-[#73daca]",
  keyword: "text-[#bb9af7]",
  control: "italic text-[#bb9af7]",
  fn: "text-[#7aa2f7]",
  comment: "italic text-[#51597d]",
  punct: "text-[#89ddff]",
  plain: "text-[#a9b1d6]",
};
const IDLE_ACTIVITY = [Search, GitBranch, Bug, Blocks];
/** The status bar's language mode, by extension. */
const LANGUAGE: Record<string, string> = {
  tsx: "TypeScript JSX",
  ts: "TypeScript",
  mjs: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  css: "CSS",
  md: "Markdown",
  yml: "YAML",
  svg: "XML",
};
/** Editor width (px) from which the explorer shows on its own — `@[32rem]` below. */
const EXPLORER_FITS = 512;
/** Lexed as code; anything else shows as plain text. */
const CODE_FILE = /\.(tsx?|m?js|json|css|ya?ml|svg)$/;

/** A typed piece of one line; `whole` once its token is typed to the end. */
type Piece = BuildToken & { whole: boolean };

/** Tokens cut at `pos` characters and split into lines. */
function toRows(tokens: BuildToken[], pos: number): Piece[][] {
  const rows: Piece[][] = [[]];
  let left = pos;
  for (const tok of tokens) {
    if (left <= 0) break;
    const whole = left >= tok.text.length;
    const typed = whole ? tok.text : tok.text.slice(0, left);
    left -= tok.text.length;
    typed.split("\n").forEach((text, k) => {
      if (k > 0) rows.push([]);
      if (text) rows[rows.length - 1].push({ ...tok, text, whole });
    });
  }
  return rows;
}

/** Cuts a full line's pieces to its first `chars` characters. */
function cutRow(row: Piece[], chars: number): Piece[] {
  const out: Piece[] = [];
  let left = chars;
  for (const piece of row) {
    if (left <= 0) break;
    out.push(left >= piece.text.length ? piece : { ...piece, text: piece.text.slice(0, left), whole: false });
    left -= piece.text.length;
  }
  return out;
}

interface LineProps {
  pieces: Piece[];
  no: number;
  current: boolean;
  folded: boolean;
  caret: "typing" | "idle" | null;
}

/** One editor line. Memoised: while typing, only the line under the caret
 *  changes, so every finished line above it skips re-rendering. */
const Line = memo(function Line({ pieces, no, current, folded, caret }: LineProps) {
  return (
    <span className={cn("flex", current && "bg-[#16171f]")}>
      <span aria-hidden className={cn("w-14 shrink-0 select-none pr-5 text-right", current ? "text-[#9aa5ce]" : "text-[#363b54]")}>
        {no}
      </span>
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words pr-5">
        {pieces.map((x, i) => (
          <span key={i} className={TOKEN_CLASS[x.kind]}>
            {/* VS Code's colour decorator: a swatch before a colour value. */}
            {x.kind === "hex" && x.whole && (
              <span
                aria-hidden
                className="mx-0.5 inline-block h-[0.75em] w-[0.75em] translate-y-[0.05em] border border-white/50"
                style={{ background: x.text }}
              />
            )}
            {x.text}
          </span>
        ))}
        {caret && <span aria-hidden className={cn("build-caret", caret === "idle" && "build-caret--idle")} />}
        {/* Folded lines (imports, hooks) between the signature and the JSX. */}
        {folded && (
          <span aria-hidden className="ml-2 rounded-[3px] bg-[#1f2335] px-1.5 text-[#737aa2]">
            ⋯
          </span>
        )}
      </span>
    </span>
  );
});

/** Folders above a path, outermost first: "a/b/c.ts" → ["a", "a/b"]. */
const ancestors = (p: string) =>
  p
    .split("/")
    .slice(0, -1)
    .map((_, i, segs) => segs.slice(0, i + 1).join("/"));

interface CodePaneProps {
  files: BuildFile[];
  tree: BuildRepoEntry[];
  /** The file being written and how many of its characters are typed. */
  file: number;
  pos: number;
  label: string;
  typing: boolean;
}

/**
 * The editor, drawn and behaving as VS Code: the explorer lists the real repo
 * (folders open and close, files open), tabs switch and close, and the file
 * being written types itself out at its real line numbers while any other
 * opens whole. A new file being written takes the editor back to it.
 */
export default function CodePane({ files, tree, file, pos, label, typing }: CodePaneProps) {
  const t = useTranslations("Build.editor");
  const typingFile = files[file];
  const [tabs, setTabs] = useState<string[]>([]);
  const [active, setActive] = useState(typingFile.path);
  const [open, setOpen] = useState(() => new Set(ancestors(typingFile.path)));
  // null: the explorer shows when the editor is wide enough for it; the
  // explorer button then forces it either way.
  const [sidebar, setSidebar] = useState<boolean | null>(null);
  const [texts, setTexts] = useState<Record<string, string | null>>({});
  const bodyRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLLIElement>(null);

  const written = useMemo(() => new Set(files.slice(0, file + 1).map((f) => f.path)), [files, file]);
  const binary = useMemo(() => new Set(tree.filter((e) => e.binary).map((e) => e.path)), [tree]);

  // Stable, so the (memoised) explorer doesn't re-render with every keystroke.
  const openFile = useCallback((path: string) => {
    setTabs((ts) => (ts.includes(path) ? ts : [...ts, path]));
    setActive(path);
    setOpen((s) => new Set([...s, ...ancestors(path)]));
  }, []);
  const toggleFolder = useCallback(
    (p: string) =>
      setOpen((s) => {
        const next = new Set(s);
        if (!next.delete(p)) next.add(p);
        return next;
      }),
    []
  );

  // Each new file being written opens and takes the editor, as it would.
  useEffect(() => {
    openFile(typingFile.path);
  }, [typingFile.path, openFile]);

  const closeTab = (path: string) => {
    const at = tabs.indexOf(path);
    const rest = tabs.filter((p) => p !== path);
    setTabs(rest);
    if (path === active) setActive(rest[Math.min(at, rest.length - 1)] ?? "");
  };

  // Any other file is fetched whole the first time it's opened.
  const excerptOf = files.findIndex((f) => f.path === active);
  const showsExcerpt = excerptOf >= 0 && excerptOf <= file;
  const needsText = active && !showsExcerpt && !binary.has(active) && !(active in texts);
  useEffect(() => {
    if (!needsText) return;
    const path = active;
    setTexts((m) => ({ ...m, [path]: null }));
    fetch(REPO_FILE_URL + path)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((text) => setTexts((m) => ({ ...m, [path]: text })))
      .catch(() => setTexts((m) => ({ ...m, [path]: "" })));
  }, [needsText, active]);

  // What the editor shows: the file being typed (to the caret), a written
  // file's excerpt (whole), or any other file as it is in the repo.
  const typingView = active === typingFile.path;
  const shownFile = showsExcerpt ? files[excerptOf] : null;
  const text = shownFile ? shownFile.code : (texts[active] ?? null);
  const tokens = useMemo(
    () => (text === null ? [] : CODE_FILE.test(active) || shownFile ? tokenize(text) : [{ text, kind: "plain" as const }]),
    [text, active, shownFile]
  );
  // Every line of the file, split once; typing shows the finished lines as they
  // are and only cuts the one under the caret.
  const fullRows = useMemo(() => toRows(tokens, Infinity), [tokens]);
  const lineStarts = useMemo(() => {
    const starts = [0];
    for (const row of fullRows) starts.push(starts[starts.length - 1] + row.reduce((n, x) => n + x.text.length, 0) + 1);
    return starts;
  }, [fullRows]);
  let lastRow = fullRows.length - 1;
  let caretRow: Piece[] = fullRows[lastRow] ?? [];
  if (typingView) {
    lastRow = 0;
    while (lastRow + 1 < fullRows.length && lineStarts[lastRow + 1] <= pos) lastRow++;
    caretRow = cutRow(fullRows[lastRow] ?? [], pos - lineStarts[lastRow]);
  }
  const rows = fullRows.slice(0, lastRow + 1);
  const lineNo = (r: number) => (shownFile ? shownFile.lineNumbers[r] : r + 1);
  const col = typingView ? caretRow.reduce((n, x) => n + x.text.length, 0) + 1 : 1;

  // Typing keeps the caret in sight; opening another file starts at its top.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (body && typingView) body.scrollTop = body.scrollHeight;
  }, [typingView, pos]);
  useLayoutEffect(() => {
    if (bodyRef.current && !typingView) bodyRef.current.scrollTop = 0;
    tabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active, typingView]);

  const ext = active.split(".").at(-1) ?? "";

  return (
    <section
      aria-label={label}
      className="@container flex min-h-0 flex-1 flex-col overflow-hidden rounded-[6px] bg-[#101118] text-[13px] text-[#a9b1d6] ring-1 ring-white/[0.06] [font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',system-ui,sans-serif]"
    >
      {/* Title bar */}
      <div className="relative flex h-[30px] shrink-0 items-center border-b border-black/60 bg-[#0b0c10] px-3 text-[12px]">
        <span aria-hidden className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="pointer-events-none absolute inset-x-20 truncate text-center text-[#787c99]">
          {active ? `${active.split("/").at(-1)} — ` : ""}efface-v2-client
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Activity bar — the explorer button shows and hides the sidebar. */}
        <nav className="hidden w-12 shrink-0 flex-col items-center border-r border-black/50 bg-[#0b0c10] md:flex">
          <button
            type="button"
            aria-label={t("explorer")}
            aria-pressed={sidebar ?? undefined}
            onClick={(e) => {
              // From "auto", flip whatever is showing now.
              const showing = (e.currentTarget.closest("section")?.clientWidth ?? 0) >= EXPLORER_FITS;
              setSidebar((v) => !(v ?? showing));
            }}
            className={cn(
              "flex h-12 w-full cursor-pointer items-center justify-center border-l-2 transition-colors",
              sidebar !== false ? "border-[#7aa2f7] text-[#c0caf5]" : "border-transparent text-[#565f89] hover:text-[#a9b1d6]"
            )}
          >
            <Files aria-hidden className="h-6 w-6" strokeWidth={1.5} />
          </button>
          {IDLE_ACTIVITY.map((Icon, i) => (
            <span key={i} aria-hidden className="flex h-12 w-full items-center justify-center text-[#3b4261]">
              <Icon className="h-6 w-6" strokeWidth={1.5} />
            </span>
          ))}
          <span aria-hidden className="mt-auto flex flex-col items-center gap-5 pb-4 text-[#3b4261]">
            <CircleUser className="h-6 w-6" strokeWidth={1.5} />
            <Settings className="h-6 w-6" strokeWidth={1.5} />
          </span>
        </nav>

        {sidebar !== false && (
          <div className={cn(sidebar ? "flex" : "hidden @[32rem]:flex")}>
            <Explorer
              title={t("explorer")}
              repo="efface-v2-client"
              entries={tree}
              open={open}
              active={active}
              written={written}
              onToggle={toggleFolder}
              onOpen={openFile}
            />
          </div>
        )}

        {/* Editor group */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ol className="flex h-[35px] shrink-0 overflow-x-auto border-b border-black/50 bg-[#0d0e13] [scrollbar-width:none]">
            {tabs.map((path) => {
              const isActive = path === active;
              return (
                <li
                  key={path}
                  ref={isActive ? tabRef : undefined}
                  className={cn(
                    "group flex shrink-0 items-center border-r border-black/40",
                    isActive ? "bg-[#101118] text-[#c0caf5] shadow-[inset_0_1px_0_#7aa2f7]" : "text-[#4f5573] hover:text-[#787c99]"
                  )}
                >
                  <button type="button" onClick={() => setActive(path)} className="flex h-full cursor-pointer items-center gap-1.5 pl-3">
                    <FileIcon path={path} />
                    {path.split("/").at(-1)}
                    {/* The file still being written shows VS Code's unsaved dot. */}
                    {path === typingFile.path && typing && !isActive && <span aria-hidden className="h-2 w-2 rounded-full bg-[#a9b1d6]" />}
                  </button>
                  <button
                    type="button"
                    aria-label={t("closeTab", { file: path.split("/").at(-1) ?? path })}
                    onClick={() => closeTab(path)}
                    className={cn(
                      "ml-1 mr-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded hover:bg-white/10",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <X aria-hidden className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ol>
          {active && (
            <div aria-hidden className="flex h-[22px] shrink-0 items-center gap-1 overflow-hidden whitespace-nowrap px-4 text-[12px] text-[#565f89]">
              {active.split("/").map((seg, i, all) => (
                <span key={i} className="flex items-center gap-1">
                  {i === all.length - 1 && <FileIcon path={active} className="h-3 w-3" />}
                  {seg}
                  {i < all.length - 1 && <ChevronRight className="h-3 w-3" />}
                </span>
              ))}
            </div>
          )}

          <div
            ref={bodyRef}
            className={cn(
              mono.className,
              "min-h-0 flex-1 overflow-auto pb-6 text-[11.5px] leading-[18px] [scrollbar-width:thin] md:text-[12.5px] md:leading-[20px]"
            )}
          >
            {!active ? null : binary.has(active) ? (
              <p className="px-6 py-8 text-[13px] text-[#565f89] [font-family:system-ui,sans-serif]">{t("binary")}</p>
            ) : text === null ? null : (
              <pre className="font-[inherit]">
                <code className="block font-[inherit]">
                  {rows.map((row, r) => {
                    const current = typingView && r === lastRow;
                    return (
                      <Line
                        key={r}
                        pieces={current ? caretRow : row}
                        no={lineNo(r)}
                        current={current}
                        folded={!!shownFile?.folds.includes(r) && r < lastRow}
                        caret={current ? (typing ? "typing" : "idle") : null}
                      />
                    );
                  })}
                </code>
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div aria-hidden className="flex h-[22px] shrink-0 items-center gap-3 overflow-hidden whitespace-nowrap border-t border-black/60 bg-[#0b0c10] pr-2.5 text-[12px] text-[#565f89]">
        <span className="flex h-full items-center gap-1 bg-[#7aa2f7] px-2.5 text-[#0b0c10]">
          <GitBranch className="h-3.5 w-3.5" />
          main
        </span>
        <span className="flex items-center gap-1">
          <CircleX className="h-3.5 w-3.5" />0
          <TriangleAlert className="ml-1 h-3.5 w-3.5" />0
        </span>
        <span className="ml-auto tabular-nums">
          Ln {typingView ? lineNo(lastRow) : 1}, Col {col}
        </span>
        {/* The less-needed items drop first as the editor narrows. */}
        <span className="hidden @[44rem]:inline">Spaces: 2</span>
        <span className="hidden @[38rem]:inline">UTF-8</span>
        <span className="hidden @[44rem]:inline">LF</span>
        {LANGUAGE[ext] && (
          <span className="hidden items-center gap-1 @[30rem]:flex">
            <span className="text-[11px]">{"{}"}</span>
            {LANGUAGE[ext]}
          </span>
        )}
        <Bell className="h-3.5 w-3.5" />
      </div>
    </section>
  );
}
