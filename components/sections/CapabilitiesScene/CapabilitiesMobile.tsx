"use client";

import SplitHeadline from "./SplitHeadline";
import { ACCENTS, COLUMN_COUNT, DOT_COLORS } from "./Capabilities.constants";
import type { CapabilitiesMobileProps } from "./Capabilities.types";

/**
 * The pinned scene scales the 1280px grid down to ~58%, dropping list text to
 * 9px and chips to 7px. Below `md` it falls back to a single column at full size.
 */
export default function CapabilitiesMobile({
  groups,
  label,
  title,
  lead,
  rootRef,
  refs,
}: CapabilitiesMobileProps) {
  const { labelRef, headRef, groupRefs } = refs;

  return (
    <section id="capabilities" className="bg-bg px-6 py-20" ref={rootRef}>
      <p className="label">
        <span className="text-accent">//</span> <span ref={labelRef}>{label}</span>
        <span className="cap-caret ml-2 inline-block h-3.5 w-[7px] align-middle bg-accent" />
      </p>
      <h2 ref={headRef} className="mt-5 text-3xl font-semibold leading-[1.15] tracking-tight">
        <SplitHeadline
          text={title}
          separator={"\u00A0"}
          wordClassName="inline-block align-top"
          letterClassName="inline-block"
          letterStyle={{ opacity: 0, willChange: "transform, opacity" }}
        />
      </h2>
      <p className="mt-4 text-fg-dim">{lead}</p>

      <div className="mt-12 space-y-10">
        {groups.slice(0, COLUMN_COUNT).map((group, c) => (
          <div
            key={group.no}
            ref={(el) => {
              groupRefs.current[c] = el;
            }}
            className="border-t border-line pt-8"
            style={{ ["--acc" as string]: ACCENTS[c].hex }}
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm" style={{ color: ACCENTS[c].hex }}>
                {group.no}
              </span>
              <h3 className="text-xl font-medium tracking-tight">{group.title}</h3>
            </div>
            <ul className="mt-5 space-y-3">
              {group.items.map((item) => (
                <li
                  key={item}
                  data-row=""
                  className="flex gap-3 text-sm leading-relaxed text-fg-dim"
                  style={{ opacity: 0 }}
                >
                  <span
                    data-dash=""
                    aria-hidden
                    className="mt-[0.65em] h-px w-4 shrink-0 origin-left"
                    style={{
                      background: `rgba(${ACCENTS[c].rgb},0.6)`,
                      transform: "scaleX(0)",
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {group.tools.map((tool, ti) => (
                <li
                  key={tool}
                  data-chip=""
                  className="cap-chip"
                  style={{ ["--dot" as string]: DOT_COLORS[ti % DOT_COLORS.length] }}
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
