"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

type Item = { no: string; title: string; desc: string; tags: string[] };

/**
 * Pinned horizontal scroll — as the page scrolls down, the service panels slide
 * left across a stuck viewport (the amuz-style "logos passing by" motion).
 * Mobile and reduced-motion fall back to a plain vertical stack.
 */
export default function ServiceScroll() {
  const t = useTranslations("Services");
  const items = t.raw("items") as Item[];
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  // Measure how far the track overflows the viewport → that's the scroll travel.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () =>
      setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [items.length]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Stable section height (taller than the viewport from first paint) so
  // useScroll never initializes with a degenerate 0-length range. `distance`
  // only drives how far the track slides, not the section height.
  // The long runway is deliberate: the same travel spread over more scroll
  // makes the panels glide instead of snapping past.
  const heightVh = items.length * 30 + 30;

  return (
    <>
      <span id="work" aria-hidden />

      {/* ── Desktop: pinned horizontal scroll ── */}
      {!reduce && (
        <section
          ref={sectionRef}
          className="relative hidden md:block"
          style={{ height: `${heightVh}vh` }}
        >
          <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
            <motion.div
              ref={trackRef}
              className="flex w-max items-stretch gap-6 px-6 md:px-10 lg:gap-8"
              style={{ x }}
            >
              {/* Intro panel */}
              <div className="flex w-[62vw] shrink-0 flex-col justify-center pr-6 lg:w-[42vw]">
                <p className="label">
                  <span className="text-accent">//</span> {t("label")}
                </p>
                <h2 className="mt-6 text-4xl font-semibold tracking-tight lg:text-6xl">
                  {t("title")}
                </h2>
                <p className="mt-6 max-w-md text-fg-dim lg:text-lg">{t("lead")}</p>
                <p className="mt-12 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-fg-faint">
                  <span className="inline-block h-px w-10 bg-fg-faint" /> scroll
                </p>
              </div>

              {/* Service panels */}
              {items.map((item) => (
                <article
                  key={item.no}
                  className="group relative flex h-[62vh] max-h-[600px] w-[74vw] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] border border-line bg-bg-soft p-10 transition-colors duration-500 hover:border-line-strong lg:w-[40vw] lg:p-12"
                >
                  <span
                    className="pointer-events-none absolute -right-4 -top-16 select-none font-mono text-[13rem] font-bold leading-none text-white/[0.025]"
                    aria-hidden
                  >
                    {item.no}
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-accent">{item.no}</span>
                    <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
                  </div>

                  <div className="relative">
                    <h3 className="text-3xl font-semibold tracking-tight lg:text-5xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-md text-fg-dim lg:text-lg">
                      {item.desc}
                    </p>
                  </div>

                  <ul className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fg-faint"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </motion.div>

            {/* Horizontal progress */}
            <div className="absolute inset-x-6 bottom-10 md:inset-x-10">
              <div className="h-px w-full bg-line">
                <motion.div
                  className="h-px bg-accent"
                  style={{ width: progress }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Mobile / reduced-motion: vertical stack ── */}
      <section className={reduce ? "block bg-bg" : "md:hidden bg-bg"}>
        <div className="px-6 py-20">
          <p className="label">
            <span className="text-accent">//</span> {t("label")}
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-fg-dim">{t("lead")}</p>

          <div className="mt-10 space-y-4">
            {items.map((item) => (
              <article
                key={item.no}
                className="rounded-2xl border border-line bg-bg-soft/60 p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-accent">{item.no}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-dim">
                  {item.desc}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fg-faint"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
