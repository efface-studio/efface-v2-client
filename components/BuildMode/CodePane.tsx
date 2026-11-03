"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Atom,
  Bell,
  Blocks,
  Bug,
  ChevronDown,
  ChevronRight,
  CircleUser,
  CircleX,
  Ellipsis,
  Files,
  GitBranch,
  Search,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { tokenize } from "./highlight";
import type { BuildFile, BuildToken } from "./BuildMode.types";

// VS Code's Dark+ theme: token colours and the workbench around them.
const TOKEN_CLASS: Record<BuildToken["kind"], string> = {
  tag: "text-[#569cd6]",
  component: "text-[#4ec9b0]",
  bracket: "text-[#808080]",
  attr: "text-[#9cdcfe]",
  str: "text-[#ce9178]",
  hex: "text-[#ce9178]",
  num: "text-[#b5cea8]",
  key: "text-[#9cdcfe]",
  keyword: "text-[#569cd6]",
  control: "text-[#c586c0]",
  fn: "text-[#dcdcaa]",
  comment: "text-[#6a9955]",
  punct: "text-[#d4d4d4]",
  plain: "text-[#d4d4d4]",
  copy: "text-[#d4d4d4]",
};
const ACTIVITY = [Files, Search, GitBranch, Bug, Blocks];
/** The repo's other top-level entries, collapsed in the explorer. */
const ROOT_FOLDERS = ["app", "lib", "messages", "public"];
const ROOT_FILES = ["next.config.ts", "package.json", "tsconfig.json"];

/** A typed piece of one line; `whole` once its token is typed to the end. */
type Piece = BuildToken & { whole: boolean };

interface CodePaneProps {
  files: BuildFile[];
  /** The file being written and how many of its characters are typed. */
  file: number;
  pos: number;
  label: string;
  typing: boolean;
}

function TsxIcon({ className }: { className?: string }) {
  return <Atom aria-hidden className={cn("h-3.5 w-3.5 shrink-0 text-[#519aba]", className)} />;
}

/** An explorer row, indented by depth the way the tree is. */
function TreeRow({
  depth,
  open,
  active,
  children,
}: {
  depth: number;
  open?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <li
      className={cn(
        "flex h-[22px] items-center gap-1 whitespace-nowrap pr-2",
        active ? "bg-[#37373d] text-white" : "text-[#cccccc]"
      )}
      style={{ paddingLeft: 8 + depth * 12 }}
    >
      {open === undefined ? <span className="w-3.5 shrink-0" /> : <Chevron aria-hidden className="h-3.5 w-3.5 shrink-0" />}
      {children}
    </li>
  );
}

/**
 * The editor, drawn as VS Code: title bar, activity bar, explorer (files
 * appear as they're written), tabs, breadcrumbs, the file typing itself out,
 * and the status bar with the caret's line and column.
 */
export default function CodePane({ files, file, pos, label, typing }: CodePaneProps) {
  const tokens = useMemo(() => files.map((f) => tokenize(f.parts)), [files]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLLIElement>(null);
  const current = files[file];
  const written = files.slice(0, file + 1);

  // Keep the caret in sight as the code grows, and the open tab in the strip.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [file, pos]);
  useLayoutEffect(() => {
    tabRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [file]);

  // The typed stretch of the file, cut at the caret and split into lines so
  // each wraps beside its own number.
  const rows: Piece[][] = [[]];
  let left = pos;
  for (const tok of tokens[file]) {
    if (left <= 0) break;
    const whole = left >= tok.text.length;
    const typed = whole ? tok.text : tok.text.slice(0, left);
    left -= tok.text.length;
    typed.split("\n").forEach((text, k) => {
      if (k > 0) rows.push([]);
      if (text) rows[rows.length - 1].push({ ...tok, text, whole });
    });
  }
  const col = rows[rows.length - 1].reduce((n, t) => n + t.text.length, 0) + 1;

  const fileRow = (f: BuildFile, depth: number) => (
    <TreeRow key={f.name} depth={depth} active={f === current}>
      <TsxIcon />
      <span className="truncate">{f.name}</span>
    </TreeRow>
  );

  return (
    <section
      aria-label={label}
      className="flex min-h-0 flex-col overflow-hidden rounded-[6px] bg-[#1e1e1e] text-[13px] text-[#cccccc] ring-1 ring-black/60 [font-family:-apple-system,BlinkMacSystemFont,'Segoe_UI',system-ui,sans-serif]"
    >
      {/* Title bar */}
      <div className="relative flex h-[30px] shrink-0 items-center bg-[#3c3c3c] px-3 text-[12px]">
        <span aria-hidden className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </span>
        <span className="pointer-events-none absolute inset-x-20 truncate text-center text-[#cccccc]">
          {current.name} — efface-v2-client
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Activity bar */}
        <nav aria-hidden className="hidden w-12 shrink-0 flex-col items-center bg-[#333333] md:flex">
          {ACTIVITY.map((Icon, i) => (
            <span
              key={i}
              className={cn(
                "flex h-12 w-full items-center justify-center border-l-2",
                i === 0 ? "border-white text-white" : "border-transparent text-[#858585]"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={1.5} />
            </span>
          ))}
          <span className="mt-auto flex flex-col items-center gap-5 pb-4 text-[#858585]">
            <CircleUser className="h-6 w-6" strokeWidth={1.5} />
            <Settings className="h-6 w-6" strokeWidth={1.5} />
          </span>
        </nav>

        {/* Explorer */}
        <aside aria-hidden className="hidden w-52 shrink-0 flex-col bg-[#252526] xl:flex">
          <div className="flex h-[35px] items-center justify-between px-5 text-[11px] uppercase tracking-wide text-[#bbbbbb]">
            Explorer
            <Ellipsis className="h-4 w-4" />
          </div>
          <ul className="min-h-0 flex-1 overflow-hidden text-[13px]">
            <TreeRow depth={0} open>
              <span className="text-[11px] font-bold uppercase">efface-v2-client</span>
            </TreeRow>
            {ROOT_FOLDERS.slice(0, 1).map((d) => (
              <TreeRow key={d} depth={1} open={false}>
                {d}
              </TreeRow>
            ))}
            <TreeRow depth={1} open>
              components
            </TreeRow>
            <TreeRow depth={2} open>
              sections
            </TreeRow>
            {written.filter((f) => f.dir === "components/sections").map((f) => fileRow(f, 3))}
            {written.filter((f) => f.dir === "components").map((f) => fileRow(f, 2))}
            {ROOT_FOLDERS.slice(1).map((d) => (
              <TreeRow key={d} depth={1} open={false}>
                {d}
              </TreeRow>
            ))}
            {ROOT_FILES.map((f) => (
              <TreeRow key={f} depth={1}>
                <span className="w-3.5 shrink-0 text-center text-[11px] font-bold text-[#cbcb41]">{"{}"}</span>
                {f}
              </TreeRow>
            ))}
          </ul>
        </aside>

        {/* Editor group */}
        <div className="flex min-w-0 flex-1 flex-col">
          <ol className="flex h-[35px] shrink-0 overflow-x-auto bg-[#252526] [scrollbar-width:none]">
            {written.map((f) => {
              const active = f === current;
              return (
                <li
                  key={f.name}
                  ref={active ? tabRef : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-r border-[#252526] pl-3 pr-2",
                    active ? "bg-[#1e1e1e] text-white" : "bg-[#2d2d2d] text-[#969696]"
                  )}
                >
                  <TsxIcon />
                  {f.name}
                  <X aria-hidden className={cn("ml-1.5 h-3.5 w-3.5", active ? "opacity-100" : "opacity-0")} />
                </li>
              );
            })}
          </ol>
          <div aria-hidden className="flex h-[22px] shrink-0 items-center gap-1 truncate px-4 text-[12px] text-[#a9a9a9]">
            {[...current.dir.split("/"), current.name].map((seg, i, all) => (
              <span key={seg} className="flex items-center gap-1">
                {i === all.length - 1 && <TsxIcon className="h-3 w-3" />}
                {seg}
                {i < all.length - 1 && <ChevronRight className="h-3 w-3" />}
              </span>
            ))}
          </div>

          <div
            ref={bodyRef}
            className="min-h-0 flex-1 overflow-y-auto pb-6 font-mono text-[12px] leading-[19px] [scrollbar-width:none] md:text-[13px] md:leading-[20px]"
          >
            <pre>
              <code className="block">
                {rows.map((row, r) => {
                  const last = r === rows.length - 1;
                  return (
                    <span key={r} className={cn("flex", last && "shadow-[inset_0_1px_0_#282828,inset_0_-1px_0_#282828]")}>
                      <span
                        aria-hidden
                        className={cn("w-14 shrink-0 select-none pr-6 text-right", last ? "text-[#c6c6c6]" : "text-[#6e7681]")}
                      >
                        {r + 1}
                      </span>
                      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words pr-5">
                        {row.map((t, i) => (
                          <span key={i} className={TOKEN_CLASS[t.kind]}>
                            {/* VS Code's colour decorator: a swatch before a colour value. */}
                            {t.kind === "hex" && t.whole && (
                              <span
                                aria-hidden
                                className="mx-0.5 inline-block h-[0.75em] w-[0.75em] translate-y-[0.05em] border border-white/60"
                                style={{ background: t.text }}
                              />
                            )}
                            {t.text}
                          </span>
                        ))}
                        {last && <span aria-hidden className={cn("build-caret", !typing && "build-caret--idle")} />}
                      </span>
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div aria-hidden className="flex h-[22px] shrink-0 items-center gap-3 bg-[#007acc] px-2.5 text-[12px] text-white">
        <span className="flex items-center gap-1">
          <GitBranch className="h-3.5 w-3.5" />
          main
        </span>
        <span className="flex items-center gap-1">
          <CircleX className="h-3.5 w-3.5" />0
          <TriangleAlert className="ml-1 h-3.5 w-3.5" />0
        </span>
        <span className="ml-auto tabular-nums">
          Ln {rows.length}, Col {col}
        </span>
        <span className="hidden sm:inline">Spaces: 2</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span className="hidden sm:inline">LF</span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="text-[11px]">{"{}"}</span>
          TypeScript JSX
        </span>
        <Bell className="h-3.5 w-3.5" />
      </div>
    </section>
  );
}
