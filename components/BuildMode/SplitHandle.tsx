"use client";

import type { KeyboardEvent, PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { SPLIT_DEFAULT, SPLIT_MAX, SPLIT_MIN } from "./BuildMode.constants";

interface SplitHandleProps {
  /** The preview's share, 0–1. */
  value: number;
  onChange: (value: number) => void;
  label: string;
}

const clamp = (v: number) => Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, v));

/**
 * The divider between preview and editor: drag it (sideways from md up, up
 * and down on a phone, where the panes stack) or nudge it with the arrow keys.
 */
export default function SplitHandle({ value, onChange, label }: SplitHandleProps) {
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const handle = e.currentTarget;
    const box = handle.parentElement?.getBoundingClientRect();
    if (!box) return;
    const across = matchMedia("(min-width: 768px)").matches;
    handle.setPointerCapture(e.pointerId);
    document.documentElement.style.cursor = across ? "col-resize" : "row-resize";
    const move = (ev: globalThis.PointerEvent) =>
      onChange(clamp(across ? (ev.clientX - box.left) / box.width : (ev.clientY - box.top) / box.height));
    const up = () => {
      document.documentElement.style.cursor = "";
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -0.02, ArrowUp: -0.02, ArrowRight: 0.02, ArrowDown: 0.02 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    onChange(clamp(value + step));
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuemin={Math.round(SPLIT_MIN * 100)}
      aria-valuemax={Math.round(SPLIT_MAX * 100)}
      aria-valuenow={Math.round(value * 100)}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => onChange(SPLIT_DEFAULT)}
      className={cn(
        "group relative flex shrink-0 touch-none items-center justify-center outline-none",
        "h-3 w-full cursor-row-resize md:h-auto md:w-3 md:cursor-col-resize"
      )}
    >
      <span
        aria-hidden
        className="h-1 w-10 rounded-full bg-white/15 transition-colors group-hover:bg-accent-bright group-focus-visible:bg-accent-bright group-active:bg-accent-bright md:h-10 md:w-1"
      />
    </div>
  );
}
