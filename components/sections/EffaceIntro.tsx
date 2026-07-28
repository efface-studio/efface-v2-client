"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/lib/useIsMobile";
import { elementProgress, easeOutCubic, useScrollMotion } from "@/lib/scrollMotion";

/** Scroll (vh) that advances the timeline by 1.0 — the pace the scene was
 *  tuned at. Scene height is derived from this and the timeline's actual end,
 *  so the pin releases right as the last word lands (no dead scroll). */
const PACE_VH = 600;
/** Word-lighting timeline: first word starts at W0, each next word STEP later,
 *  each takes WIN to light. Shared by paint() and the scene-length maths. */
const W0 = 0.36;
const STEP = 0.017;
const WIN = 0.08;
/** Small beat where the finished state holds before the section releases. */
const HOLD = 0.05;
const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Where each clutter image sits, how big it is, and its float timing. */
const CLUTTER = [
  { src: "/clutter/c01.png", left: "6%", top: "8%", rot: -8, w: 96, dur: 5.4, delay: -0.2 },
  { src: "/clutter/c02.png", left: "74%", top: "6%", rot: 10, w: 104, dur: 6, delay: -1.4 },
  { src: "/clutter/n01-notebook.png", left: "30%", top: "12%", rot: 6, w: 96, dur: 5, delay: -2.2 },
  { src: "/clutter/c04.png", left: "88%", top: "24%", rot: -6, w: 64, dur: 5.8, delay: -0.8 },
  { src: "/clutter/n02-hashtag.png", left: "11%", top: "30%", rot: -5, w: 84, dur: 6.4, delay: -3 },
  { src: "/clutter/c06.png", left: "52%", top: "18%", rot: 4, w: 78, dur: 5.2, delay: -1.9 },
  { src: "/clutter/n03-writing.png", left: "5%", top: "60%", rot: 8, w: 100, dur: 5.6, delay: -0.5 },
  { src: "/clutter/c08.png", left: "90%", top: "52%", rot: -10, w: 70, dur: 5.1, delay: -2.6 },
  { src: "/clutter/c09.png", left: "82%", top: "72%", rot: 7, w: 88, dur: 6.2, delay: -1.1 },
  { src: "/clutter/c10.png", left: "15%", top: "78%", rot: -7, w: 78, dur: 5.7, delay: -3.4 },
  { src: "/clutter/c11.png", left: "42%", top: "84%", rot: 5, w: 92, dur: 5.3, delay: -0.9 },
  { src: "/clutter/c12.png", left: "66%", top: "88%", rot: -9, w: 74, dur: 6.6, delay: -2 },
] as const;

const ORB_STYLES: Record<string, string> = {
  orb1: "radial-gradient(circle at 32% 28%, #7FA8FF, #2563EB 62%, #1A44C2)",
  orb2: "radial-gradient(circle at 34% 26%, #FFE1A6, #F59E0B 60%, #C97D06)",
};
const ORB_SHADOW: Record<string, string> = {
  orb1: "0 8px 18px rgba(37,99,235,0.4)",
  orb2: "0 8px 18px rgba(245,158,11,0.35)",
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type Token =
  | { kind: "word"; text: string; strike: boolean; accent: boolean }
  | { kind: "orb"; id: string };

/**
 * Parses the sentence copy into words and orbs.
 * `~word~` is struck through, `*word*` takes the accent colour, `{orb1}` is a
 * popping bead. Keeping the markup in the message means translators can move
 * the emphasis to wherever it lands naturally in their language.
 */
function parseSentence(src: string): Token[] {
  return src
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const orb = raw.match(/^\{(orb\d)\}$/);
      if (orb) return { kind: "orb", id: orb[1] } as Token;
      const strike = raw.startsWith("~");
      const accentAll = raw.startsWith("*");
      let text = raw;
      if (strike) text = text.replace(/^~/, "").replace(/~(?=[^~]*$)/, "");
      if (accentAll) text = text.replace(/^\*/, "").replace(/\*/, "");
      // `*efface*의` — accent only the starred run, keep the suffix attached
      return { kind: "word", text, strike, accent: accentAll } as Token;
    });
}

export default function EffaceIntro() {
  const t = useTranslations("Efface");
  const label = t("label");
  const definition = t("definition");
  // `t.raw` — the copy carries `{orb1}` markers, which ICU would try to read as
  // message variables and fail on. We do our own parsing below.
  const sentence = t.raw("sentence") as string;
  const isMobile = useIsMobile();

  const tokens = useMemo(() => parseSentence(sentence), [sentence]);
  // index among word tokens only — the timeline staggers on words, not orbs
  const wordIndex = useMemo(() => {
    let n = 0;
    return tokens.map((tk) => (tk.kind === "word" ? n++ : n));
  }, [tokens]);

  // Where the word timeline actually finishes for this locale's copy — the
  // scene is sized to exactly that, so shorter copy no longer leaves a tail
  // of empty scroll (the Korean sentence ends near p≈0.68 of the old 700vh).
  const wordCount = useMemo(
    () => tokens.filter((tk) => tk.kind === "word").length,
    [tokens]
  );
  const timelineEnd = useMemo(
    () => W0 + Math.max(0, wordCount - 1) * STEP + WIN + HOLD,
    [wordCount]
  );
  const sceneVh = 100 + Math.round(PACE_VH * timelineEnd);

  const rootRef = useRef<HTMLElement>(null);
  const clutterRef = useRef<HTMLDivElement>(null);
  const puckRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSpanElement>(null);
  const defRef = useRef<HTMLParagraphElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const orbRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const typeFull = useRef("");
  const defFull = useRef("");
  const shown = useRef({ type: -1, def: -1 });
  const puckO = useRef(0);
  const mouse = useRef({ x: -1, y: -1 });

  useEffect(() => {
    typeFull.current = label;
    defFull.current = definition;
    shown.current = { type: -1, def: -1 };
  }, [label, definition]);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  /** Paints one frame from a 0→1 scene progress value. */
  const paint = useCallback(
    (p: number) => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      if (fitRef.current && !isMobile) {
        fitRef.current.style.transform = `scale(${Math.min(1, (vh - 40) / 680)})`;
      }

      // 1. label + dictionary entry type themselves in
      if (typeRef.current) {
        const n = Math.round(clamp(p / 0.04, 0, 1) * typeFull.current.length);
        if (n !== shown.current.type) {
          typeRef.current.textContent = typeFull.current.slice(0, n);
          shown.current.type = n;
        }
      }
      if (defRef.current) {
        const n = Math.round(clamp((p - 0.05) / 0.16, 0, 1) * defFull.current.length);
        if (n !== shown.current.def) {
          defRef.current.textContent = defFull.current.slice(0, n);
          shown.current.def = n;
        }
      }

      // 2. the clutter gets wiped by a circle growing out of the centre
      const cx = vw * 0.5;
      const cy = vh * 0.44;
      const maxR = Math.hypot(vw, vh) * 0.66;
      const pm = clamp((p - 0.07) / 0.4, 0, 1);
      const R = easeOutCubic(pm) * maxR;
      if (clutterRef.current) {
        const mask = `radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,0) ${Math.max(
          0,
          R - 70
        )}px, rgba(0,0,0,1) ${R + 10}px)`;
        clutterRef.current.style.webkitMaskImage = mask;
        clutterRef.current.style.maskImage = mask;
        const mx = mouse.current.x >= 0 ? (mouse.current.x / vw) * 2 - 1 : 0;
        const my = mouse.current.y >= 0 ? (mouse.current.y / vh) * 2 - 1 : 0;
        clutterRef.current.style.transform = `translate(${mx * 10}px, ${my * 7}px)`;
      }

      // 3. the eraser rides the edge of that circle
      if (puckRef.current) {
        const ang = -0.62 + Math.sin(pm * 9) * 0.14;
        const px = cx + Math.cos(ang) * R;
        const py = cy + Math.sin(ang) * R;
        const vis = pm > 0.01 && pm < 0.97 ? 1 : 0;
        puckO.current += (vis - puckO.current) * 0.12;
        puckRef.current.style.opacity = String(puckO.current);
        puckRef.current.style.transform = `translate(${px - 38}px, ${py - 22}px) rotate(${
          -16 + Math.sin(pm * 22) * 8
        }deg)`;
      }

      // 4. sentence lights up word by word; struck words fade back to grey
      tokens.forEach((tk, i) => {
        const wi = wordIndex[i];
        if (tk.kind === "word") {
          const el = wordRefs.current[i];
          if (!el) return;
          const tt = easeOutCubic(clamp((p - W0 - wi * STEP) / WIN, 0, 1));
          let struck = false;
          if (tk.strike) {
            struck = clamp((p - (W0 + wi * STEP + 0.055)) / 0.045, 0, 1) > 0.55;
          }
          let r: number, g: number, b: number;
          if (struck) {
            [r, g, b] = [86, 86, 95];
          } else if (tk.accent) {
            r = Math.round(51 + (91 - 51) * tt);
            g = Math.round(51 + (141 - 51) * tt);
            b = Math.round(59 + (255 - 59) * tt);
          } else {
            r = Math.round(51 + (244 - 51) * tt);
            g = Math.round(51 + (244 - 51) * tt);
            b = Math.round(59 + (246 - 59) * tt);
          }
          el.style.color = `rgb(${r}, ${g}, ${b})`;

          const line = lineRefs.current[i];
          if (line) {
            const st = clamp((p - (W0 + wi * STEP + 0.055)) / 0.045, 0, 1);
            line.style.transform = `scaleX(${easeOutCubic(st)})`;
          }
        } else {
          const el = orbRefs.current[i];
          if (!el) return;
          const tt = clamp((p - W0 - wi * STEP) / 0.05, 0, 1);
          const sc = tt === 0 ? 0 : tt * (1 + 0.3 * Math.sin(tt * Math.PI));
          el.style.transform = `scale(${sc}) rotate(${(1 - tt) * 90}deg)`;
        }
      });
    },
    [tokens, wordIndex, isMobile]
  );

  // Desktop: pinned scene driven by how far the section has scrolled.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || isMobile) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paint(1);
      return;
    }
    let raf = 0;
    let onScreen = true;
    let hidden = document.hidden;
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(root);
    const onVis = () => {
      hidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || hidden) return;
      const rect = root.getBoundingClientRect();
      const total = Math.max(1, root.offsetHeight - window.innerHeight);
      paint(clamp(-rect.top / total, 0, 1) * timelineEnd);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [paint, isMobile, timelineEnd]);

  // Mobile: no pinning — the same timeline plays off the block's own position.
  const mobileFrame = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    paint(elementProgress(el, 0.95, 0.9));
  }, [paint]);
  useScrollMotion(rootRef, mobileFrame, isMobile);

  const sentenceNode = (
    <>
      {tokens.map((tk, i) =>
        tk.kind === "orb" ? (
          <span
            key={i}
            ref={(el) => {
              orbRefs.current[i] = el;
            }}
            aria-hidden
            style={{
              display: "inline-block",
              width: "0.8em",
              height: "0.8em",
              borderRadius: "50%",
              background: ORB_STYLES[tk.id],
              boxShadow: ORB_SHADOW[tk.id],
              verticalAlign: "-0.06em",
              margin: "0 0.1em",
              transform: "scale(0)",
            }}
          />
        ) : (
          <span key={i}>
            <span
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              style={{
                color: "#33333B",
                fontWeight: tk.accent ? 800 : undefined,
                position: tk.strike ? "relative" : undefined,
                display: tk.strike ? "inline-block" : undefined,
              }}
            >
              {tk.text}
              {tk.strike && (
                <span
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "-2%",
                    right: "-2%",
                    top: "52%",
                    height: "0.09em",
                    background: "#3B82F6",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    borderRadius: 2,
                  }}
                />
              )}
            </span>{" "}
          </span>
        )
      )}
    </>
  );

  const body = (
    <div
      ref={fitRef}
      style={{
        position: "relative",
        maxWidth: 1080,
        width: "100%",
        margin: "0 auto",
        padding: isMobile ? 0 : "0 48px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: MONO,
          fontSize: 13,
          letterSpacing: "0.34em",
          marginBottom: 28,
        }}
      >
        <span style={{ color: "#3B82F6" }}>//&nbsp;&nbsp;</span>
        <span ref={typeRef}>{label}</span>
        <span
          aria-hidden
          className="cap-caret"
          style={{
            display: "inline-block",
            width: 9,
            height: 16,
            background: "#3B82F6",
            marginLeft: 8,
          }}
        />
      </div>

      <p
        ref={defRef}
        style={{
          margin: "0 0 52px",
          fontFamily: MONO,
          fontSize: isMobile ? 13 : 14.5,
          color: "#8A8A93",
          lineHeight: 1.9,
          maxWidth: 760,
          minHeight: "3.8em",
        }}
      >
        {definition}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: isMobile ? "clamp(20px, 6vw, 28px)" : "clamp(30px, 3.4vw, 50px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.52,
          color: "#F4F4F6",
          maxWidth: 1000,
          textWrap: "pretty",
        }}
      >
        {sentenceNode}
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <section id="efface" ref={rootRef} className="bg-bg px-6 py-24">
        {body}
      </section>
    );
  }

  return (
    <section
      id="efface"
      ref={rootRef}
      style={{
        position: "relative",
        height: `${sceneVh}vh`,
        background: "var(--color-bg)",
        color: "#EDEDEF",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {/* the clutter this section is about erasing */}
        <div
          ref={clutterRef}
          aria-hidden
          style={{ position: "absolute", inset: -40, pointerEvents: "none", willChange: "transform" }}
        >
          {CLUTTER.map((c, i) => (
            <div
              key={i}
              style={{ position: "absolute", left: c.left, top: c.top, transform: `rotate(${c.rot}deg)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt=""
                style={{
                  width: c.w,
                  display: "block",
                  animation: `bob ${c.dur}s ease-in-out ${c.delay}s infinite`,
                  filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.45))",
                }}
              />
            </div>
          ))}
        </div>

        {/* the eraser */}
        <div
          ref={puckRef}
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 76,
            height: 44,
            borderRadius: 14,
            background: "linear-gradient(180deg, #F2F2F5, #C6C6D0)",
            boxShadow:
              "0 14px 28px rgba(0,0,0,0.5), inset 0 -6px 10px rgba(0,0,0,0.18), inset 0 2px 0 rgba(255,255,255,0.7)",
            opacity: 0,
            pointerEvents: "none",
            willChange: "transform",
          }}
        />

        {body}
      </div>
    </section>
  );
}
