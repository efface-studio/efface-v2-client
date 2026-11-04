"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/cn";
import {
  CAMERA_CLOSER,
  CAMERA_DWELL_MS,
  CAMERA_FILL,
  CAMERA_MARGIN,
  CAMERA_MAX_ZOOM,
  PREVIEW_DESKTOP_WIDTH,
  PREVIEW_MIN_ASPECT,
  PREVIEW_PHONE_BELOW,
  PREVIEW_PHONE_WIDTH,
} from "./BuildMode.constants";
import type { BuildRect } from "./BuildMode.types";

interface PreviewPaneProps {
  frameRef: RefObject<HTMLIFrameElement | null>;
  src: string;
  title: string;
  /** Shown over the frame until the preview reports ready. */
  loadingLabel: string | null;
  status: string;
  /** What the page is building right now; the camera eases in on it. */
  focus: BuildRect | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** How close the camera comes to a shot: it fills a share of the pane, within limits. */
const zoomFor = (r: BuildRect, box: { w: number; h: number }, scale: number) =>
  clamp(Math.min((box.w * CAMERA_FILL) / (r.w * scale), (box.h * CAMERA_FILL) / (r.h * scale)), 1, CAMERA_MAX_ZOOM);

/**
 * A browser window around the page being built. The page renders at a real
 * device width and is scaled to the pane, so it keeps its desktop (or phone)
 * layout instead of reflowing into whatever the pane happens to be.
 */
export default function PreviewPane({ frameRef, src, title, loadingLabel, status, focus }: PreviewPaneProps) {
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

  // The camera holds each shot a moment before moving on, and stays put while
  // what's being built is already in frame, so it moves only when the build
  // leaves the frame instead of chasing every line back and forth.
  const [shot, setShot] = useState<BuildRect | null>(null);
  const movedAt = useRef(0);
  const view = useRef({ tx: 0, ty: 0, z: 1 });
  useEffect(() => {
    const { tx, ty, z } = view.current;
    const inFrame =
      !!shot &&
      !!focus &&
      focus.x * z + tx >= box.w * CAMERA_MARGIN &&
      (focus.x + focus.w) * z + tx <= box.w * (1 - CAMERA_MARGIN) &&
      focus.y * z + ty >= box.h * CAMERA_MARGIN &&
      (focus.y + focus.h) * z + ty <= box.h * (1 - CAMERA_MARGIN);
    // …unless it could come much closer: the shot was wide, the copy is small.
    const closer =
      !!focus && zoomFor(focus, box, scale) > (z / scale) * CAMERA_CLOSER;
    if ((inFrame && !closer) || shot === focus) return;
    const id = setTimeout(
      () => {
        movedAt.current = performance.now();
        setShot(focus);
      },
      Math.max(0, movedAt.current + CAMERA_DWELL_MS - performance.now())
    );
    return () => clearTimeout(id);
  }, [focus, shot, box, scale]);

  // One transform on the frame — the fit-to-pane scale and the camera's zoom
  // and pan together, on whole pixels — so the page isn't resampled twice and
  // its text doesn't shimmer as the camera moves. Reduced motion keeps it still.
  const [still, setStill] = useState(false);
  useLayoutEffect(() => setStill(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  let zoom = 1;
  let tx = left;
  let ty = 0;
  if (shot && box.w && !still) {
    zoom = zoomFor(shot, box, scale);
    const cx = left + (shot.x + shot.w / 2) * scale;
    const cy = (shot.y + shot.h / 2) * scale;
    tx = zoom * left + clamp(box.w / 2 - zoom * cx, box.w * (1 - zoom), 0);
    ty = clamp(box.h / 2 - zoom * cy, box.h * (1 - zoom), 0);
  }
  const z = zoom * scale;
  useLayoutEffect(() => {
    view.current = { tx: Math.round(tx), ty: Math.round(ty), z };
  }, [tx, ty, z]);
  const frameTransform = `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0) scale(${z.toFixed(4)})`;

  return (
    <section aria-label={title} className="build-pane flex min-h-0 flex-1 flex-col overflow-hidden rounded-[6px]">
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
              "pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-[opacity,transform] duration-[500ms,1400ms] ease-[ease,cubic-bezier(0.45,0,0.2,1)]",
              loadingLabel ? "opacity-0" : "opacity-100"
            )}
            style={{ width, height: box.h / scale, transform: frameTransform }}
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
