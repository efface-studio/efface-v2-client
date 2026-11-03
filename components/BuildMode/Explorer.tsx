"use client";

import { memo, useMemo } from "react";
import { ChevronDown, ChevronRight, Ellipsis } from "lucide-react";
import { cn } from "@/lib/cn";
import FileIcon from "./FileIcon";
import type { BuildRepoEntry } from "./BuildMode.types";

interface Folder {
  name: string;
  path: string;
  folders: Folder[];
  files: BuildRepoEntry[];
}

const byName = (a: { path: string }, b: { path: string }) =>
  a.path.localeCompare(b.path, "en", { sensitivity: "base" });

/** The flat list as a tree, each level folders first, then files, by name. */
function toTree(entries: BuildRepoEntry[]): Folder {
  const root: Folder = { name: "", path: "", folders: [], files: [] };
  const index = new Map<string, Folder>([["", root]]);
  for (const entry of entries) {
    const segs = entry.path.split("/");
    let at = root;
    segs.slice(0, -1).forEach((seg, i) => {
      const p = segs.slice(0, i + 1).join("/");
      let next = index.get(p);
      if (!next) {
        next = { name: seg, path: p, folders: [], files: [] };
        index.set(p, next);
        at.folders.push(next);
      }
      at = next;
    });
    at.files.push(entry);
  }
  const sort = (f: Folder) => {
    f.folders.sort(byName).forEach(sort);
    f.files.sort(byName);
  };
  sort(root);
  return root;
}

const ROW = "flex h-[18px] w-full cursor-pointer items-center gap-1 whitespace-nowrap pr-2 text-left hover:bg-[#16171f]";

interface ExplorerProps {
  title: string;
  repo: string;
  entries: BuildRepoEntry[];
  open: Set<string>;
  active: string;
  /** Files written so far — VS Code marks them as new ("U"). */
  written: Set<string>;
  onToggle: (folder: string) => void;
  onOpen: (file: string) => void;
}

/** VS Code's explorer over the real repo: folders open and close, files open in the editor. */
function Explorer({ title, repo, entries, open, active, written, onToggle, onOpen }: ExplorerProps) {
  const root = useMemo(() => toTree(entries), [entries]);

  const render = (folder: Folder, depth: number): React.ReactNode[] => [
    ...folder.folders.flatMap((f) => {
      const isOpen = open.has(f.path);
      const Chevron = isOpen ? ChevronDown : ChevronRight;
      return [
        <li key={f.path}>
          <button type="button" aria-expanded={isOpen} onClick={() => onToggle(f.path)} className={cn(ROW, "text-[#787c99]")} style={{ paddingLeft: 6 + depth * 8 }}>
            <Chevron aria-hidden className="h-3 w-3 shrink-0" />
            {f.name}
          </button>
        </li>,
        ...(isOpen ? render(f, depth + 1) : []),
      ];
    }),
    ...folder.files.map((f) => {
      const name = f.path.split("/").at(-1);
      const isActive = f.path === active;
      return (
        <li key={f.path}>
          <button
            type="button"
            onClick={() => onOpen(f.path)}
            aria-current={isActive || undefined}
            className={cn(ROW, isActive ? "bg-[#1a1b26] text-[#c0caf5] shadow-[inset_1px_0_0_#7aa2f7]" : written.has(f.path) ? "text-[#73daca]" : "text-[#787c99]")}
            style={{ paddingLeft: 6 + depth * 8 + 12 }}
          >
            <FileIcon path={f.path} className="h-3 w-3" />
            <span className="min-w-0 flex-1 truncate">{name}</span>
            {written.has(f.path) && <span className="text-[9px] text-[#73daca]">U</span>}
          </button>
        </li>
      );
    }),
  ];

  return (
    <aside className="flex w-[180px] shrink-0 flex-col border-r border-black/50 bg-[#0d0e13]">
      <div className="flex h-[28px] shrink-0 items-center justify-between px-4 text-[9px] uppercase tracking-wide text-[#565f89]">
        {title}
        <Ellipsis aria-hidden className="h-3.5 w-3.5" />
      </div>
      <div className="flex h-[18px] shrink-0 items-center gap-1 pl-1.5 text-[9px] font-bold uppercase text-[#a9b1d6]">
        <ChevronDown aria-hidden className="h-3 w-3" />
        {repo}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto pb-4 text-[10.5px] [scrollbar-width:thin]">{render(root, 1)}</ul>
    </aside>
  );
}

export default memo(Explorer);
