"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface Zoomed {
  src: string;
  alt: string;
  /** App icons (`data-zoom-tile`) are shown on their tile, with its `bg` / `inset`. */
  tile: boolean;
  bg?: string;
  inset: boolean;
  /** Long page captures scroll at reading width instead of fitting the screen. */
  long: boolean;
}

/**
 * Click (or Enter on) any `img[data-zoom]` to see it large in a native modal
 * dialog. Delegated from the document so the image components stay server-side.
 * Esc, the close button or a click anywhere closes it.
 */
export default function WorkZoom() {
  const t = useTranslations("Work.featured");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState<Zoomed | null>(null);

  useEffect(() => {
    const open = (target: EventTarget | null) => {
      if (!(target instanceof HTMLImageElement) || !("zoom" in target.dataset)) return false;
      setZoomed({
        src: target.currentSrc || target.src,
        alt: target.alt,
        tile: "zoomTile" in target.dataset,
        bg: target.dataset.zoomBg,
        inset: "zoomInset" in target.dataset,
        long: target.naturalHeight > target.naturalWidth * 2.5,
      });
      dialogRef.current?.showModal();
      return true;
    };
    const onClick = (e: MouseEvent) => void open(e.target);
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && open(e.target)) e.preventDefault();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={zoomed?.alt || undefined}
      onClick={() => dialogRef.current?.close()}
      onClose={() => setZoomed(null)}
      className="fixed inset-0 h-dvh max-h-none w-dvw max-w-none overflow-y-auto bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
    >
      <button
        type="button"
        autoFocus
        aria-label={t("zoomClose")}
        className="fixed right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-fg ring-1 ring-white/15 transition-colors hover:bg-white/20 md:right-8 md:top-8"
      >
        <X aria-hidden className="h-5 w-5" />
      </button>

      {zoomed && (
        <div className="flex min-h-full items-center justify-center p-6 md:p-12">
          {zoomed.tile ? (
            <div
              className="flex aspect-square w-[min(70vw,20rem)] items-center justify-center overflow-hidden rounded-[22.5%] ring-1 ring-white/10"
              style={{ background: zoomed.bg }}
            >
              <img
                src={zoomed.src}
                alt={zoomed.alt}
                className={cn("h-full w-full object-contain", zoomed.inset && "p-[18%]")}
              />
            </div>
          ) : (
            <img
              src={zoomed.src}
              alt={zoomed.alt}
              className={cn(
                "rounded-2xl ring-1 ring-white/10",
                zoomed.long ? "w-full max-w-5xl" : "max-h-[calc(100dvh-6rem)] w-auto max-w-full",
              )}
            />
          )}
        </div>
      )}
    </dialog>
  );
}
