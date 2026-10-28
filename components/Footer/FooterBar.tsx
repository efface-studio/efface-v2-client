"use client";

import { useCallback, type RefObject } from "react";
import { Link } from "@/i18n/navigation";
import { MONO } from "./Footer.constants";
import type { FooterBottomLink } from "./Footer.types";

/** Copyright line, secondary links and the back-to-top control. */
export default function FooterBar({
  hostRef,
  rights,
  links,
  toTopLabel,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  rights: string;
  links: FooterBottomLink[];
  toTopLabel: string;
}) {
  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
        <button type="button" onClick={toTop} className="footer-totop" style={{ fontFamily: MONO }}>
          {toTopLabel}
        </button>
      </div>
    </div>
  );
}
