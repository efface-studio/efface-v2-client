"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/** Per-card layout + scroll-entrance constants (from the source scene). */
const CFG = [
  { oy: 16, rot: -8, dx: -260, xr: -22 },
  { oy: -4, rot: -3.5, dx: -90, xr: 18 },
  { oy: -4, rot: 3.5, dx: 90, xr: -16 },
  { oy: 16, rot: 8, dx: 260, xr: 24 },
] as const;

/** Visual spec per card — gradients, stacking and 3D glyph parameters. */
const CARDS = [
  {
    key: "hinest",
    gradient: "linear-gradient(160deg, #4E8CFF 0%, #2563EB 55%, #1D46C8 100%)",
    sheen: 0.16,
    zIndex: 3,
    marginLeft: 0,
    icon: { src: "/logos/hinest.svg", color: "#F6F7FA", rx: 12, ry: 22, rz: -7 },
  },
  {
    key: "muru",
    gradient: "linear-gradient(160deg, #34E0D8 0%, #14B8B0 60%, #0C9A93 100%)",
    sheen: 0.16,
    zIndex: 2,
    marginLeft: -34,
    icon: { src: "/logos/muru.svg", color: "#FFFDF8", rx: 12, ry: -22, rz: 7 },
  },
  {
    key: "qto",
    gradient: "linear-gradient(160deg, #34343C 0%, #1D1D23 60%, #141418 100%)",
    sheen: 0.1,
    zIndex: 4,
    marginLeft: -34,
    icon: { src: "/logos/qto.svg", color: "#EF6553", rx: 11, ry: 20, rz: -6 },
  },
  {
    key: "goms",
    gradient: "linear-gradient(160deg, #9D6BFF 0%, #7C3AED 55%, #6425D0 100%)",
    sheen: 0.16,
    zIndex: 3,
    marginLeft: -34,
    icon: { src: "/logos/goms.svg", color: "#FFA600", rx: 13, ry: -22, rz: 8 },
  },
] as const;

const PARALLAX = 0.5;
const SCENE_LENGTH_VH = 320;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Renders one 3D app tile into a canvas (WebGL, client-only, drawn once). */
function AppIcon({
  src,
  color,
  rx,
  ry,
  rz,
  size = 300,
}: {
  src: string;
  color: string;
  rx: number;
  ry: number;
  rz: number;
  size?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    // Dynamic import keeps three.js + the SVG loader out of the initial bundle.
    import("@/components/three/appIcon3d").then(({ createAppIcon }) => {
      if (cancelled || !hostRef.current) return;
      dispose = createAppIcon(hostRef.current, { src, color, rx, ry, rz, size });
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [src, color, rx, ry, rz, size]);

  return <div ref={hostRef} style={{ width: size, height: size }} aria-hidden="true" />;
}

export default function AppCards() {
  const t = useTranslations("AppCards");
  const cards = t.raw("cards") as { title: string; sub: string }[];
  const word1 = t("word1");
  const word2 = t("word2");

  const sceneRef = useRef<HTMLElement>(null);
  const w1Ref = useRef<HTMLDivElement>(null);
  const w2Ref = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    const mouse = { x: 0, y: 0 };
    const sm = { x: 0, y: 0 };
    let raf = 0;

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouse);

    // Light each letter up as the scroll passes it.
    const lit = (el: HTMLElement, start: number, end: number, p: number) => {
      const ch = el.children;
      const n = ch.length;
      for (let i = 0; i < n; i++) {
        const t0 = start + (i / Math.max(1, n - 1)) * (end - start);
        const tt = easeOutCubic(clamp((p - t0) / 0.09, 0, 1));
        const r = Math.round(58 + 197 * tt);
        const gc = Math.round(58 + 197 * tt);
        const b = Math.round(64 + 191 * tt);
        (ch[i] as HTMLElement).style.color = `rgb(${r}, ${gc}, ${b})`;
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const scene = sceneRef.current;
      if (!scene) return;
      const vh = window.innerHeight;
      const rect = scene.getBoundingClientRect();
      const total = Math.max(1, scene.offsetHeight - vh);
      const p = clamp(-rect.top / total, 0, 1);

      sm.x += (mouse.x - sm.x) * 0.06;
      sm.y += (mouse.y - sm.y) * 0.06;

      if (rowRef.current) {
        rowRef.current.style.transform = `scale(${Math.min(
          1,
          window.innerWidth / 1430,
          window.innerHeight / 780
        )})`;
      }

      for (let i = 0; i < 4; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const c = CFG[i];
        const tt = clamp((p - i * 0.12) / 0.5, 0, 1);
        const e = easeOutCubic(tt);
        const eb = easeOutBack(tt);
        let tf = `translate(${c.dx * (1 - e)}px, ${c.oy + (1 - e) * vh * 1.05}px) rotate(${
          c.rot + c.xr * (1 - eb)
        }deg)`;
        const depth = 1 + (3 - i) * 0.35;
        tf += ` translate(${sm.x * PARALLAX * 14 * depth}px, ${sm.y * PARALLAX * 9 * depth}px)`;
        el.style.transform = tf;
        el.style.opacity = String(clamp(tt * 2.5, 0, 1));
      }

      if (w1Ref.current) {
        w1Ref.current.style.transform = `translateX(${(0.5 - p) * PARALLAX * 260}px)`;
        lit(w1Ref.current, 0.05, 0.42, p);
      }
      if (w2Ref.current) {
        w2Ref.current.style.transform = `translateX(${(p - 0.5) * PARALLAX * 260}px)`;
        lit(w2Ref.current, 0.5, 0.86, p);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  const wordStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: "100%",
    textAlign: "center",
    fontFamily: "'Archivo Black', sans-serif",
    fontSize: "clamp(110px, 15.5vw, 250px)",
    lineHeight: 0.82,
    color: "#fff",
    zIndex: 1,
    pointerEvents: "none",
    userSelect: "none",
    whiteSpace: "nowrap",
  };

  return (
    <section
      id="apps"
      ref={sceneRef}
      style={{ height: `${SCENE_LENGTH_VH}vh`, position: "relative", background: "#131315" }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <div ref={w1Ref} style={{ ...wordStyle, top: 0 }}>
          {word1.split("").map((ch, i) => (
            <span key={i} style={{ color: "#3A3A40" }}>
              {ch}
            </span>
          ))}
        </div>
        <div ref={w2Ref} style={{ ...wordStyle, bottom: "-1vh", letterSpacing: "0.12em" }}>
          {word2.split("").map((ch, i) => (
            <span key={i} style={{ color: "#3A3A40" }}>
              {ch}
            </span>
          ))}
        </div>

        <div
          ref={rowRef}
          style={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {CARDS.map((card, i) => (
            <div
              key={card.key}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{
                position: "relative",
                zIndex: card.zIndex,
                flex: "none",
                marginLeft: card.marginLeft,
                transform: `translateY(${CFG[i].oy}px) rotate(${CFG[i].rot}deg)`,
                willChange: "transform, opacity",
              }}
            >
              <div
                className="app-card"
                style={{
                  background: card.gradient,
                  // consumed by .app-card::before for the diagonal sheen
                  ["--sheen" as string]: String(card.sheen),
                }}
              >
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.92)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {cards[i]?.sub}
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    color: "#fff",
                    marginTop: 6,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {cards[i]?.title}
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <AppIcon {...card.icon} size={300} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
