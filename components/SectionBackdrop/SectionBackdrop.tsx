import type { SectionBackdropProps } from "./SectionBackdrop.types";

/**
 * A photo as atmosphere behind a section's copy: blurred and dimmed, feathered
 * into the page colour at the top and bottom so the section never starts or
 * ends on a hard line, and darker on the left where the copy sits. Scaled up so
 * the blur has no soft rim. The parent section needs `relative isolate
 * overflow-hidden`.
 */
export default function SectionBackdrop({ src, width, height }: SectionBackdropProps) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <img
        src={src}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        className="h-full w-full scale-110 object-cover blur-md brightness-[0.38] saturate-[0.7]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-bg/30 to-transparent" />
    </div>
  );
}
