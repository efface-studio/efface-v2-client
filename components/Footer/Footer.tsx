"use client";

import { useTranslations } from "next-intl";
import FooterBar from "./FooterBar";
import FooterMeta from "./FooterMeta";
import Wordmark from "./Wordmark";
import { parseTagline } from "./parseTagline";
import { useFooterMotion } from "./useFooterMotion";
import { DISPLAY } from "./Footer.constants";
import type { FooterBottomLink, FooterGroup, FooterPolicy } from "./Footer.types";

export default function Footer() {
  const t = useTranslations("Footer");
  const groups = t.raw("groups") as FooterGroup[];
  const policies = t.raw("policies") as FooterPolicy[];
  const bottomLinks = t.raw("bottomLinks") as FooterBottomLink[];
  const tagline = parseTagline(t.raw("tagline") as string);

  const { rootRef, wipeRef, headRef, metaRef, strikeRef, barRef, canvasRef, cwrapRef } =
    useFooterMotion();

  return (
    <footer
      ref={rootRef}
      style={{
        position: "relative",
        background: "var(--color-bg)",
        color: "#EDEDEF",
        borderTop: "1px solid #1B1B22",
        overflow: "hidden",
      }}
    >
      <div
        ref={wipeRef}
        className="footer-wipe"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "72px 24px 0",
          boxSizing: "border-box",
          maskImage: "linear-gradient(115deg, rgba(0,0,0,1) -15%, rgba(0,0,0,0) 0%)",
          willChange: "mask-image",
        }}
      >
        <div
          ref={headRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 22,
            opacity: 0,
            transform: "translateY(14px)",
            filter: "blur(8px)",
            willChange: "transform, opacity, filter",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <span
              style={{ position: "relative", width: 26, height: 26, display: "inline-block" }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 17,
                  height: 17,
                  borderRadius: 5,
                  background: "#3B82F6",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: "#E8E8EC",
                }}
              />
            </span>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.035em",
              }}
            >
              efface
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "clamp(19px, 2vw, 26px)",
              fontWeight: 600,
              letterSpacing: "-0.015em",
              lineHeight: 1.4,
              color: "#C9C9D1",
              textWrap: "pretty",
            }}
          >
            {tagline.before}
            {tagline.struck && (
              <span
                style={{ position: "relative", display: "inline-block", color: "#6E6E78" }}
              >
                {tagline.struck}
                <span
                  ref={strikeRef}
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "-3%",
                    right: "-3%",
                    top: "53%",
                    height: "0.07em",
                    borderRadius: 2,
                    background: "#3B82F6",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                  }}
                />
              </span>
            )}
            {tagline.after}
          </p>

          <FooterMeta
            hostRef={metaRef}
            groups={groups}
            policies={policies}
            policyLabel={t("policyLabel")}
          />
        </div>

        <Wordmark wrapRef={cwrapRef} canvasRef={canvasRef} />

        <FooterBar
          hostRef={barRef}
          rights={t("rights")}
          links={bottomLinks}
          toTopLabel={t("toTop")}
        />
      </div>
    </footer>
  );
}
