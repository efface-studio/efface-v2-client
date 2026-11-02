"use client";

import Reveal from "@/components/Reveal";
import { cn } from "@/lib/cn";
import { ACCENTS, COLUMN_COUNT, DOT_COLORS, STACK_STEP_VH } from "./Capabilities.constants";
import type { CapabilitiesMobileProps } from "./Capabilities.types";

/**
 * The pinned scene scales the 1280px grid down to ~58%, dropping list text to
 * 9px and chips to 7px. Below `md` the four columns become full-size cards
 * instead, pinned in one stack that the scroll deals out (see
 * `useCapabilitiesStack`).
 */
export default function CapabilitiesMobile({
  groups,
  label,
  title,
  lead,
  rootRef,
  stackRef,
  refs,
  still,
}: CapabilitiesMobileProps) {
  const { cardRefs, dimRefs, lensRefs } = refs;
  const cards = groups.slice(0, COLUMN_COUNT);

  const deck = cards.map((group, c) => (
    <div
      key={group.no}
      ref={(el) => {
        cardRefs.current[c] = el;
      }}
      className={cn(
        "relative origin-top overflow-hidden rounded-3xl border border-line bg-surface p-6",
        !still && "[grid-area:1/1] will-change-transform"
      )}
      style={{
        ["--acc" as string]: ACCENTS[c].hex,
        ...(!still && c > 0 && { transform: "translate3d(0, 100vh, 0)" }),
      }}
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-sm" style={{ color: ACCENTS[c].hex }}>
          {group.no}
        </span>
        <h3 className="text-xl font-medium tracking-tight">{group.title}</h3>
      </div>

      <div className="relative mt-5">
        {!still && (
          <div
            ref={(el) => {
              lensRefs.current[c] = el;
            }}
            aria-hidden
            className="pointer-events-none absolute -inset-x-3 top-0 h-11 rounded-full border border-white/20 bg-white/[0.04]"
            style={{
              opacity: 0,
              boxShadow: `0 12px 30px rgba(0,0,0,0.45), 0 0 24px rgba(${ACCENTS[c].rgb},0.18), inset 0 1px 0 rgba(255,255,255,0.18)`,
            }}
          />
        )}
        <ul className="relative space-y-1">
          {group.items.map((item) => (
            <li
              key={item}
              data-row=""
              className="flex origin-left items-center gap-3 py-1.5 text-sm leading-relaxed text-fg"
              style={still ? undefined : { opacity: 0.3 }}
            >
              <span
                data-dash=""
                aria-hidden
                className="h-px w-4 shrink-0 origin-left"
                style={{
                  background: `rgba(${ACCENTS[c].rgb},0.8)`,
                  transform: still ? undefined : "scaleX(0)",
                }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
        {group.tools.map((tool, ti) => (
          <li
            key={tool}
            data-chip=""
            className="cap-chip"
            style={{
              ["--dot" as string]: DOT_COLORS[ti % DOT_COLORS.length],
              ...(still && { opacity: 1 }),
            }}
          >
            {tool}
          </li>
        ))}
      </ul>

      {!still && (
        <div
          ref={(el) => {
            dimRefs.current[c] = el;
          }}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-bg"
          style={{ opacity: 0 }}
        />
      )}
    </div>
  ));

  return (
    <section id="capabilities" className="bg-bg" ref={rootRef}>
      <Reveal className="px-6 pt-20">
        <p className="label">
          <span className="text-accent">//</span> {label}
        </p>
        <h2 className="mt-5 text-3xl font-semibold leading-[1.15] tracking-tight">{title}</h2>
        <p className="mt-4 text-fg-dim">{lead}</p>
      </Reveal>

      {still ? (
        <div className="space-y-4 px-6 pb-20 pt-12">{deck}</div>
      ) : (
        <div
          ref={stackRef}
          className="relative"
          style={{ height: `calc(100svh + ${cards.length * STACK_STEP_VH}vh)` }}
        >
          <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-6 pb-6 pt-20">
            <div className="grid w-full">{deck}</div>
          </div>
        </div>
      )}
    </section>
  );
}
