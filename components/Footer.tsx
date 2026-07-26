"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

type Row = { k: string; v: string; href?: string };
type Group = { label: string; rows: Row[] };
type Policy = { t: string; href: string; strong?: boolean };
type Link = { t: string; href: string };

const MONO = "'JetBrains Mono', ui-monospace, monospace";
const DISPLAY = "'Space Grotesk', 'Pretendard Variable', sans-serif";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Footer() {
  const t = useTranslations("Footer");
  const groups = t.raw("groups") as Group[];
  const policies = t.raw("policies") as Policy[];
  const bottomLinks = t.raw("bottomLinks") as Link[];
  // `~word~` marks the struck-through word — same convention as the efface scene
  const tagline = t.raw("tagline") as string;
  const [taglineA, taglineStruck, taglineB] = (() => {
    const m = tagline.match(/^(.*?)~(.+?)~(.*)$/);
    return m ? [m[1], m[2], m[3]] : [tagline, "", ""];
  })();

  const rootRef = useRef<HTMLElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const strikeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cwrapRef = useRef<HTMLDivElement>(null);

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -9999, y: -9999, t: 0 };
    let raf = 0;
    let seq = 0;
    let lastT = 0;

    // Offscreen layers: a dim wordmark, a bright gradient one, and a trail mask
    // that reveals the bright copy only where the cursor has swept.
    let cw = 0, ch = 0;
    let ctx: CanvasRenderingContext2D | null = null;
    let trail: HTMLCanvasElement, work: HTMLCanvasElement;
    let dimSrc: HTMLCanvasElement, brightSrc: HTMLCanvasElement;

    const setupCanvas = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cw = w;
      ch = h;
      const mk = () => {
        const cv = document.createElement("canvas");
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        cv.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
        return cv;
      };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx = canvas.getContext("2d");
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      trail = mk();
      work = mk();
      dimSrc = mk();
      brightSrc = mk();

      const fitDraw = (cv: HTMLCanvasElement, fill: string | CanvasGradient) => {
        const x = cv.getContext("2d")!;
        const fs = h * 1.04;
        x.font = `700 ${fs}px ${DISPLAY}`;
        const tw = Math.max(1, x.measureText("EFFACE").width);
        const sx = w / tw;
        x.save();
        x.scale(sx, 1);
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillStyle = fill;
        x.strokeStyle = fill;
        x.lineWidth = fs * 0.045;
        x.lineJoin = "miter";
        x.miterLimit = 4;
        x.fillText("EFFACE", w / sx / 2, h * 0.56);
        x.strokeText("EFFACE", w / sx / 2, h * 0.56);
        x.restore();
      };
      fitDraw(dimSrc, "#18181E");
      const g = brightSrc.getContext("2d")!.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, "#3B82F6");
      g.addColorStop(0.36, "#8B5CF6");
      g.addColorStop(0.68, "#14B8B0");
      g.addColorStop(1, "#F59E0B");
      fitDraw(brightSrc, g);
      if (reduced) {
        const tc = trail.getContext("2d")!;
        tc.fillStyle = "#fff";
        tc.fillRect(0, 0, w, h);
      }
    };

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.t = performance.now();
    };
    const onResize = () => setupCanvas();
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", onResize);

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => setupCanvas());

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const rect = root.getBoundingClientRect();
      const now = performance.now();
      const dt = Math.min(0.05, (now - (lastT || now)) / 1000);
      lastT = now;

      // Runs forward while the footer is in view, rewinds when it leaves.
      const visible = rect.top < vh * 0.72 && rect.bottom > vh * 0.2;
      seq = clamp(seq + (visible ? dt / 1.6 : -dt / 0.45), 0, 1);
      const p = reduced ? 1 : seq;

      if (wipeRef.current) {
        const wt = ease(clamp(p / 0.55, 0, 1));
        const el = wipeRef.current;
        if (wt >= 1) {
          if (el.style.maskImage !== "none") {
            el.style.maskImage = "none";
            el.style.webkitMaskImage = "none";
          }
        } else {
          const e2 = -15 + wt * 145;
          const m = `linear-gradient(115deg, rgba(0,0,0,1) ${e2 - 14}%, rgba(0,0,0,0) ${e2}%)`;
          el.style.maskImage = m;
          el.style.webkitMaskImage = m;
        }
      }
      if (headRef.current) {
        const tt = ease(clamp(p / 0.2, 0, 1));
        headRef.current.style.opacity = String(0.1 + 0.9 * tt);
        headRef.current.style.transform = `translateY(${(1 - tt) * 14}px)`;
        headRef.current.style.filter = tt >= 1 ? "none" : `blur(${(1 - tt) * 8}px)`;
      }
      if (metaRef.current) {
        metaRef.current.style.opacity = String(clamp(p * 6, 0, 1));
        const gs = Array.from(metaRef.current.children) as HTMLElement[];
        gs.forEach((g, i) => {
          const tt = ease(clamp((p - 0.14 - i * 0.07) / 0.24, 0, 1));
          g.style.opacity = String(tt);
          g.style.transform = `translateY(${(1 - tt) * 18}px)`;
          g.style.filter = tt >= 1 ? "none" : `blur(${(1 - tt) * 8}px)`;
        });
      }
      if (strikeRef.current) {
        strikeRef.current.style.transform = `scaleX(${ease(clamp((p - 0.1) / 0.18, 0, 1))})`;
      }
      if (cwrapRef.current) {
        const tt = ease(clamp((p - 0.38) / 0.32, 0, 1));
        cwrapRef.current.style.clipPath = `inset(0 ${(1 - tt) * 100}% 0 0)`;
      }
      if (barRef.current) {
        barRef.current.style.opacity = String(ease(clamp((p - 0.66) / 0.22, 0, 1)));
      }

      if (!ctx) return;
      if (canvas.clientWidth && canvas.clientWidth !== cw) setupCanvas();
      const r = canvas.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;

      const tctx = trail.getContext("2d")!;
      if (!reduced) {
        // fade the trail out slowly so the sweep leaves a tail
        tctx.save();
        tctx.globalCompositeOperation = "destination-out";
        tctx.globalAlpha = 0.05;
        tctx.fillStyle = "#000";
        tctx.fillRect(0, 0, cw, ch);
        tctx.restore();

        const time = now / 1000;
        let px: number | null = cw * (0.5 + 0.44 * Math.sin(time * 0.32));
        let py: number | null = ch * (0.5 + 0.14 * Math.sin(time * 1.05));
        if (
          now - mouse.t < 1400 &&
          mouse.x >= r.left && mouse.x <= r.right &&
          mouse.y >= r.top - 50 && mouse.y <= r.bottom + 50
        ) {
          px = mouse.x - r.left;
          py = clamp(mouse.y - r.top, -10, ch + 10);
        }
        if (px !== null && py !== null) {
          const R = ch * 0.62;
          const gr = tctx.createRadialGradient(px, py, 0, px, py, R);
          gr.addColorStop(0, "rgba(255,255,255,0.5)");
          gr.addColorStop(0.7, "rgba(255,255,255,0.18)");
          gr.addColorStop(1, "rgba(255,255,255,0)");
          tctx.save();
          tctx.fillStyle = gr;
          tctx.beginPath();
          tctx.arc(px, py, R, 0, 7);
          tctx.fill();
          tctx.restore();
        }
      }

      const wctx = work.getContext("2d")!;
      wctx.save();
      wctx.setTransform(1, 0, 0, 1, 0, 0);
      wctx.clearRect(0, 0, work.width, work.height);
      wctx.restore();
      wctx.drawImage(brightSrc, 0, 0, cw, ch);
      wctx.save();
      wctx.globalCompositeOperation = "destination-in";
      wctx.drawImage(trail, 0, 0, cw, ch);
      wctx.restore();

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.drawImage(dimSrc, 0, 0, cw, ch);
      ctx.drawImage(work, 0, 0, cw, ch);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const rowLink = (row: Row) =>
    row.href ? (
      <a
        href={row.href}
        {...(row.href.startsWith("http")
          ? { target: "_blank", rel: "noreferrer" }
          : {})}
        className="footer-link"
        style={{ color: "#A9A9B2" }}
      >
        {row.v}
        <span className="footer-hl" aria-hidden />
      </a>
    ) : (
      <span style={{ color: "#A9A9B2" }}>{row.v}</span>
    );

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
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "72px 24px 0",
          boxSizing: "border-box",
          maskImage: "linear-gradient(115deg, rgba(0,0,0,1) -15%, rgba(0,0,0,0) 0%)",
          willChange: "mask-image",
        }}
        className="footer-wipe"
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
            <span style={{ position: "relative", width: 26, height: 26, display: "inline-block" }}>
              <span style={{ position: "absolute", left: 0, top: 0, width: 17, height: 17, borderRadius: 5, background: "#3B82F6" }} />
              <span style={{ position: "absolute", right: 0, bottom: 0, width: 12, height: 12, borderRadius: 4, background: "#E8E8EC" }} />
            </span>
            <span style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, letterSpacing: "-0.035em" }}>
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
            {taglineA}
            {taglineStruck && (
              <span style={{ position: "relative", display: "inline-block", color: "#6E6E78" }}>
                {taglineStruck}
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
            {taglineB}
          </p>

          <div ref={metaRef} className="footer-meta" style={{ opacity: 0 }}>
            {groups.map((g) => (
              <div key={g.label} className="footer-col">
                <div className="footer-col__label" style={{ fontFamily: MONO }}>
                  {g.label}
                </div>
                {g.rows.map((row) => (
                  <div key={row.k} style={{ display: "flex", gap: 14, fontSize: 13.5 }}>
                    <span style={{ color: "#55555E", width: 66, flex: "none" }}>{row.k}</span>
                    {rowLink(row)}
                  </div>
                ))}
              </div>
            ))}

            <div className="footer-col footer-col--policy">
              <div className="footer-col__label" style={{ fontFamily: MONO }}>
                {t("policyLabel")}
              </div>
              {policies.map((p) => (
                <a
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
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* oversized wordmark revealed by a cursor-driven trail */}
        <div
          ref={cwrapRef}
          style={{ position: "relative", marginTop: 96, height: "clamp(130px, 15vw, 240px)" }}
        >
          <canvas
            ref={canvasRef}
            aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          />
        </div>

        <div
          ref={barRef}
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
          <div style={{ fontSize: 13, color: "#55555E" }}>{t("rights")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {bottomLinks.map((l) => (
              <a key={l.href} href={l.href} className="footer-link" style={{ fontSize: 13, color: "#6E6E78" }}>
                {l.t}
                <span className="footer-hl" aria-hidden />
              </a>
            ))}
            <button type="button" onClick={toTop} className="footer-totop" style={{ fontFamily: MONO }}>
              {t("toTop")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
