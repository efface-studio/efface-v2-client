"use client";

import type { RefObject } from "react";
import { Link } from "@/i18n/navigation";
import LinkedInMark from "@/components/LinkedInMark";
import LogoMark from "@/components/LogoMark";
import { MONO } from "./Footer.constants";
import type { FooterGroup, FooterPolicy, FooterRow } from "./Footer.types";

/** Taegukgi, small. An emoji flag would render as "KR" letters on Windows. */
function FlagKR() {
  const bars = [-12, -10.6, -9.2, 9.2, 10.6, 12];
  return (
    <svg viewBox="0 0 36 24" width={18} height={12} aria-hidden style={{ borderRadius: 2, flex: "none" }}>
      <rect width="36" height="24" fill="#fff" />
      <g transform="rotate(33.69 18 12)">
        <circle cx="18" cy="12" r="6" fill="#0047A0" />
        <path d="M12 12a6 6 0 0 1 12 0a3 3 0 0 1-6 0a3 3 0 0 0-6 0z" fill="#CD2E3A" />
      </g>
      {[33.69, -33.69].map((a) => (
        <g key={a} transform={`rotate(${a} 18 12)`} fill="#000">
          {bars.map((x) => (
            <rect key={x} x={18 + x - 0.45} y="9.75" width="0.9" height="4.5" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function RowMark({ mark }: { mark: NonNullable<FooterRow["mark"]> }) {
  if (mark === "logo") return <LogoMark className="h-4 w-4 flex-none text-[#EDEDEF]" />;
  if (mark === "linkedin") return <LinkedInMark />;
  return <FlagKR />;
}

/** A meta value — with its mark, if any — linked when the copy gives it a target. */
function RowValue({ row }: { row: FooterRow }) {
  const body = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
      {row.v}
      {row.mark && <RowMark mark={row.mark} />}
    </span>
  );
  if (!row.href) return <span style={{ color: "#A9A9B2" }}>{body}</span>;
  const external = row.href.startsWith("http");
  return (
    <a
      href={row.href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="footer-link"
      style={{ color: "#A9A9B2" }}
    >
      {body}
      <span className="footer-hl" aria-hidden />
    </a>
  );
}

/**
 * The meta columns. Each direct child of `.footer-meta` is a column, and the
 * entrance sequence staggers them by DOM order — so nothing else may be
 * inserted at this level.
 */
export default function FooterMeta({
  hostRef,
  groups,
  policies,
  policyLabel,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  groups: FooterGroup[];
  policies: FooterPolicy[];
  policyLabel: string;
}) {
  return (
    <div ref={hostRef} className="footer-meta" style={{ opacity: 0 }}>
      {groups.map((g) => (
        // A plain link list sits up level with POLICY, sharing its offset.
        <div key={g.label} className={g.plain ? "footer-col footer-col--policy" : "footer-col"}>
          <div className="footer-col__label" style={{ fontFamily: MONO }}>
            {g.label}
          </div>
          {g.rows.map((row) => (
            <div key={row.k} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13.5 }}>
              {!g.plain && <span style={{ color: "#55555E", width: 66, flex: "none" }}>{row.k}</span>}
              <RowValue row={row} />
            </div>
          ))}
        </div>
      ))}

      <div data-tour="policy" className="footer-col footer-col--policy">
        <div className="footer-col__label" style={{ fontFamily: MONO }}>
          {policyLabel}
        </div>
        {policies.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="footer-link"
            style={{
              width: "fit-content",
              fontSize: 13.5,
              fontWeight: p.strong ? 600 : undefined,
              color: p.strong ? "#D8D8DE" : "#A9A9B2",
            }}
          >
            {p.t}
            <span className="footer-hl" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
