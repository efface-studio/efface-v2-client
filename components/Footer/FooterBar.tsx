"use client";

import type { RefObject } from "react";
import { Link } from "@/i18n/navigation";
import type { FooterBottomLink } from "./Footer.types";

/** Copyright line and secondary links. */
export default function FooterBar({
  hostRef,
  rights,
  links,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  rights: string;
  links: FooterBottomLink[];
}) {
  return (
    <div
      ref={hostRef}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap",
        borderTop: "1px solid #1B1B22",
        marginTop: 26,
        padding: "24px 0 30px",
        opacity: 0,
      }}
    >
      <div style={{ fontSize: 13, color: "#55555E" }}>{rights}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="footer-link"
            style={{ fontSize: 13, color: "#6E6E78" }}
          >
            {l.t}
            <span className="footer-hl" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
