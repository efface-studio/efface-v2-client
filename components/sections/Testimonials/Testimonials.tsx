import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";
import SectionBackdrop from "@/components/SectionBackdrop";
import { MARQUEE_S, MASKS, SETS_PER_HALF } from "./Testimonials.constants";
import type { TestimonialItem } from "./Testimonials.types";

function Card({ item, mask }: { item: TestimonialItem; mask: (typeof MASKS)[number] }) {
  return (
    <figure className="flex w-[340px] shrink-0 flex-col border-l border-white/10 px-6 py-1 md:w-[420px] md:px-8">
      <blockquote className="flex-1 text-[15px] leading-relaxed text-fg md:text-base">{item.quote}</blockquote>
      {item.metric && (
        <p className="mt-4 flex items-center gap-2 text-xs text-fg/85">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {item.metric}
        </p>
      )}
      <figcaption className="mt-5 flex items-center gap-3">
        {/* Name and company stay private: placeholder text, blurred. */}
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold text-bg blur-[3px]"
          style={{ backgroundColor: mask.color }}
        >
          {mask.name[0]}
        </span>
        <span className="min-w-0 text-sm">
          <span aria-hidden className="block select-none font-medium text-fg blur-[4px]">
            {mask.name}
          </span>
          <span className="flex items-center gap-1.5 text-fg/85">
            {item.role}
            <span aria-hidden>·</span>
            <span aria-hidden className="select-none blur-[3.5px]">
              {mask.company}
            </span>
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * A drifting row of reviews, doubled so the marquee loops: `marquee` slides the
 * track by half its width. Spacing lives inside each review (its padding and
 * left rule) rather than a flex `gap`, so the two halves are exactly equal and
 * the loop has no jump.
 * Each half repeats the set `SETS_PER_HALF` times so it is wider than any
 * screen — otherwise the row shows an empty stretch, most visibly when a
 * reversed row starts shifted by half. Direction and pace are inline because
 * the global `.animate-marquee` rule (unlayered) outranks utility classes;
 * reduced motion still turns it off.
 */
function Row({ items, offset, toRight }: { items: TestimonialItem[]; offset: number; toRight?: boolean }) {
  const track = Array.from({ length: SETS_PER_HALF * 2 }, () => items).flat();
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="flex w-max animate-marquee py-1 hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${MARQUEE_S * SETS_PER_HALF}s`,
          animationDirection: toRight ? "reverse" : "normal",
        }}
      >
        {track.map((item, i) => (
          // Only the first set is read out; the repeats are there for the loop.
          <div key={i} aria-hidden={i >= items.length || undefined} className="flex">
            <Card item={item} mask={MASKS[(offset + (i % items.length)) % MASKS.length]} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** What clients said, in two rows drifting in opposite directions. */
export default function Testimonials() {
  const t = useTranslations("Testimonials");
  const items = t.raw("items") as TestimonialItem[];
  const half = Math.ceil(items.length / 2);

  return (
    <section id="testimonials" className="relative isolate overflow-hidden border-t border-line bg-bg py-24 md:py-36">
      <SectionBackdrop src="/testimonials/silicon-valley.webp" width={630} height={354} />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <p className="label">
            <span className="text-accent">//</span> {t("label")}
          </p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{t("title")}</h2>
            <p
              title={t("note")}
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-fg-dim ring-1 ring-white/10"
            >
              <span aria-hidden className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
              </span>
              {t("badge")}
              <span className="sr-only">— {t("note")}</span>
            </p>
          </div>
        </Reveal>
      </div>

      <div className="mt-14 space-y-12 md:mt-20 md:space-y-16">
        <Row items={items.slice(0, half)} offset={0} toRight />
        <Row items={items.slice(half)} offset={half} />
      </div>
    </section>
  );
}
