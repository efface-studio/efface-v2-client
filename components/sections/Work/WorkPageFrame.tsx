import type { WorkPageFrameProps } from "./Work.types";

/**
 * A desktop browser window showing a long page capture. The image is laid out at
 * its full height inside a 16:10 viewport; the pinned scene scrolls it by
 * transform, the static list just shows the top of the page.
 */
export default function WorkPageFrame({ page, alt, eager, full, frameRef, imageRef }: WorkPageFrameProps) {
  return (
    <figure className="overflow-hidden rounded-2xl bg-surface ring-1 ring-white/10">
      <div aria-hidden className="flex gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      </div>
      <div ref={frameRef} className={full ? undefined : "aspect-[16/10] overflow-hidden"}>
        <img
          ref={imageRef}
          src={page.src}
          alt={alt}
          width={page.width}
          height={page.height}
          loading={eager ? "eager" : "lazy"}
          data-zoom
          tabIndex={0}
          className="block w-full will-change-transform"
        />
      </div>
    </figure>
  );
}
