"use client";

import type { RefObject } from "react";
import { Link } from "@/i18n/navigation";
import { MONO } from "./Footer.constants";
import type { FooterGroup, FooterPolicy, FooterRow } from "./Footer.types";

/** A meta value, linked when the copy gives it a target. */
function RowValue({ row }: { row: FooterRow }) {
  if (!row.href) return <span style={{ color: "#A9A9B2" }}>{row.v}</span>;
  const external = row.href.startsWith("http");
  return (
    <a
      href={row.href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="footer-link"
      style={{ color: "#A9A9B2" }}
    >
      {row.v}
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
        <div key={g.label} className="footer-col">
          <div className="footer-col__label" style={{ fontFamily: MONO }}>
            {g.label}
          </div>
          {g.rows.map((row) => (
            <div key={row.k} style={{ display: "flex", gap: 14, fontSize: 13.5 }}>
              <span style={{ color: "#55555E", width: 66, flex: "none" }}>{row.k}</span>
              <RowValue row={row} />
            </div>
          ))}
        </div>
      ))}

      <div className="footer-col footer-col--policy">
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
