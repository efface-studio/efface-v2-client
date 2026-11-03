"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { PREVIEW_DESKTOP_WIDTH, PREVIEW_MIN_ASPECT, PREVIEW_PHONE_BELOW, PREVIEW_PHONE_WIDTH } from "./BuildMode.constants";

interface PreviewPaneProps {
  frameRef: RefObject<HTMLIFrameElement | null>;
  src: string;
  title: string;
  /** Shown over the frame until the preview reports ready. */
  loadingLabel: string | null;
  status: string;
}

/**
 * A browser window around the page being built. The page renders at a real
 * device width and is scaled to the pane, so it keeps its desktop (or phone)
 * layout instead of reflowing into whatever the pane happens to be.
 */
export default function PreviewPane({ frameRef, src, title, loadingLabel, status }: PreviewPaneProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const phone = box.w < PREVIEW_PHONE_BELOW;
  const width = phone ? PREVIEW_PHONE_WIDTH : PREVIEW_DESKTOP_WIDTH;
  const minHeight = width * PREVIEW_MIN_ASPECT[phone ? "phone" : "desktop"];
  const scale = box.w ? Math.min(box.w / width, box.h / minHeight) : 1;
  const left = (box.w - width * scale) / 2;

  return (
    <section aria-label={title} className="build-pane flex min-h-0 flex-col overflow-hidden rounded-[6px]">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-white/[0.05] px-3 py-1 text-center font-mono text-[11px] text-fg-dim">
          efface.dev
        </span>
        <span className="hidden shrink-0 font-mono text-[11px] text-fg-faint sm:block" aria-live="polite">
          {status}
        </span>
      </div>
      <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden bg-bg">
        {box.w > 0 && (
          <iframe
            ref={frameRef}
            src={src}
            title={title}
            tabIndex={-1}
            // Watch-only: input would drive the page's own scroll scenes.
            className={cn(
              "pointer-events-none absolute top-0 origin-top-left border-0 transition-opacity duration-500",
              loadingLabel ? "opacity-0" : "opacity-100"
            )}
            style={{ left, width, height: box.h / scale, transform: `scale(${scale})` }}
          />
        )}
        {loadingLabel && (
          <p className="absolute inset-0 flex items-center justify-center gap-2.5 font-mono text-xs text-fg-faint">
            <span aria-hidden className="build-caret" />
            {loadingLabel}
          </p>
        )}
      </div>
    </section>
  );
}
