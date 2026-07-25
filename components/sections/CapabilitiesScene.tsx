"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

type Group = { no: string; title: string; items: string[]; tools: string[] };

/** Accent per capability column — hex for CSS vars, rgb triplet for the glow. */
const ACCENTS = [
  { hex: "#3B82F6", rgb: "59,130,246" },
  { hex: "#8B5CF6", rgb: "139,92,246" },
  { hex: "#14B8B0", rgb: "20,184,176" },
  { hex: "#F59E0B", rgb: "245,158,11" },
] as const;

const SCENE_LENGTH_VH = 1060;
const TILT = 10;
/** Scroll progress at which the magnifier lens becomes interactive. */
const LENS_ARM_AT = 0.95;
/** Vertical breathing room kept between the scene and the viewport edges. */
const SCENE_PAD = 72;
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const fr = (n: number) => n - Math.floor(n);

export default function CapabilitiesScene() {
  const t = useTranslations("Capabilities");
  const groups = t.raw("groups") as Group[];
  const label = t("label");
  const title = t("title");
  const lead = t("lead");

  const rootRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lineHRef = useRef<HTMLDivElement>(null);
  const lineVRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const lensInnerRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mouse = { x: -1, y: -1 };
    const spotPos = { x: 0, y: 0 };
    let raf = 0;
    let typeShown = -1;
    let lensFor = -1;
    let fitScale = 1;
    let overRows = -1;
    const lp = { x: 0, y: 0, px: 0, py: 0, s: 0, v: 0 };

    const letters = Array.from(root.querySelectorAll<HTMLElement>("[data-l]"));
    // Deterministic scatter offsets per letter (hash, not Math.random).
    const seeds = letters.map((_, i) => ({
      dx: (fr(Math.sin(i * 127.1) * 43758.5) * 2 - 1) * (window.innerWidth * 0.32),
      dy: (fr(Math.sin(i * 311.7) * 12543.2) * 2 - 1) * (window.innerHeight * 0.36),
      rot: (fr(Math.sin(i * 74.3) * 9631.1) * 2 - 1) * 70,
    }));
    const typeFull = typeRef.current?.textContent ?? "";

    const capData = capRefs.current.map((card, i) => {
      if (!card) return null;
      const chip = card.querySelector<HTMLElement>("[data-chip]");
      return {
        card,
        acc: ACCENTS[i].rgb,
        glow: card.querySelector<HTMLElement>("[data-glow]"),
        head: card.querySelector("h3")?.parentElement ?? null,
        rows: Array.from(card.querySelectorAll<HTMLElement>("[data-row]")),
        dashes: Array.from(card.querySelectorAll<HTMLElement>("[data-dash]")),
        chips: Array.from(card.querySelectorAll<HTMLElement>("[data-chip]")),
        chipsRow: chip?.parentElement ?? null,
        sx: 0,
        sy: 0,
        h: 0,
      };
    });

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouse);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const rect = root.getBoundingClientRect();
      const total = Math.max(1, root.offsetHeight - vh);
      const p = clamp(-rect.top / total, 0, 1);

      // Reserve breathing room top and bottom: the source scene only left 30px,
      // which pinned the tool chips against the next section's edge.
      fitScale = Math.min(1, (vh - 2 * SCENE_PAD) / 1150);
      if (fitRef.current) fitRef.current.style.transform = `scale(${fitScale})`;

      // 1. label types itself in
      if (typeRef.current) {
        const n = Math.round(clamp(p / 0.04, 0, 1) * typeFull.length);
        if (n !== typeShown) {
          typeRef.current.textContent = typeFull.slice(0, n);
          typeShown = n;
        }
      }

      // 2. headline letters fly in from scattered positions
      for (let i = 0; i < letters.length; i++) {
        const tt = ease(clamp((p - 0.04 - i * 0.009) / 0.22, 0, 1));
        const sd = seeds[i] ?? { dx: 0, dy: 0, rot: 0 };
        const u = 1 - tt;
        const el = letters[i];
        el.style.transform = `translate(${u * sd.dx}px, ${u * sd.dy}px) rotate(${
          u * sd.rot
        }deg) scale(${0.7 + 0.3 * tt})`;
        el.style.opacity = String(clamp(0.15 + tt * 1.4, 0, 1));
        el.style.filter = u > 0.02 ? `blur(${u * 5}px)` : "none";
      }

      // 3. sub copy
      if (subRef.current) {
        const tt = ease(clamp((p - 0.3) / 0.18, 0, 1));
        subRef.current.style.opacity = String(tt);
        subRef.current.style.transform = `translateY(${(1 - tt) * 14}px)`;
      }

      // 4. magnifier lens over the hovered row
      const gw = gridWrapRef.current;
      if (gw && lensRef.current && lensInnerRef.current) {
        const G = gw.getBoundingClientRect();
        const k = fitScale || 1;
        let over = -1;
        // The lens only arms once the scene has finished dealing itself out —
        // popping a magnifier over cards that are still flying in reads as a bug.
        const armed = p >= LENS_ARM_AT;
        for (let c = 0; c < 4 && over < 0 && armed; c++) {
          const d = capData[c];
          if (!d) continue;
          const targets = d.rows.slice();
          if (d.head) targets.unshift(d.head);
          if (d.chipsRow) targets.push(d.chipsRow);
          if (!targets.length) continue;
          const first = targets[0].getBoundingClientRect();
          const last = targets[targets.length - 1].getBoundingClientRect();
          if (mouse.y < first.top - 6 || mouse.y > last.bottom + 6) continue;
          let near: DOMRect | null = null;
          let best = 1e9;
          for (const el of targets) {
            const rr = el.getBoundingClientRect();
            const dy = Math.abs((rr.top + rr.bottom) / 2 - mouse.y);
            if (dy < best) {
              best = dy;
              near = rr;
            }
          }
          if (near && mouse.x >= near.left - 8 && mouse.x <= near.right + 14) over = c;
        }
        overRows = over;

        if (!lp.x && !lp.y) {
          lp.x = G.width / 2;
          lp.y = G.height / 2;
        }
        lp.px = lp.x;
        lp.py = lp.y;
        if (over >= 0) {
          lp.x += ((mouse.x - G.left) / k - lp.x) * 0.18;
          lp.y += ((mouse.y - G.top) / k - lp.y) * 0.18;
          if (lensFor !== over && gridRef.current) {
            lensFor = over;
            // Snapshot the grid so the lens shows a settled, untransformed copy.
            const clone = gridRef.current.cloneNode(true) as HTMLElement;
            for (const card of Array.from(clone.children) as HTMLElement[]) {
              card.style.transform = "none";
              card.style.opacity = "1";
            }
            lensInnerRef.current.replaceChildren(clone);
            lensInnerRef.current.style.width = `${gw.offsetWidth}px`;
          }
        } else if (lp.s < 0.03) {
          lensFor = -1;
        }
        if (over >= 0 && lp.s < 0.05) {
          lp.x = (mouse.x - G.left) / k;
          lp.y = (mouse.y - G.top) / k;
          lp.px = lp.x;
          lp.py = lp.y;
        }
        lp.v += ((over >= 0 ? 1 : 0) - lp.s) * 0.16;
        lp.v *= 0.8;
        lp.s += lp.v;
        const vx = lp.x - lp.px;
        const vy = lp.y - lp.py;
        const RX = 180;
        const RY = 60;
        const zoom = 2.0;
        const s = 0.35 + 0.65 * lp.s;
        const skx = clamp(vx * 0.5, -8, 8);
        const sky = clamp(vy * 0.5, -6, 6);
        lensRef.current.style.opacity = String(clamp(lp.s * 1.25, 0, 1));
        lensRef.current.style.transform = `translate(${lp.x - RX}px, ${
          lp.y - RY
        }px) scale(${s}) skew(${skx}deg, ${sky * 0.5}deg)`;
        lensInnerRef.current.style.transform = `translate(${RX - lp.x * zoom}px, ${
          RY - lp.y * zoom
        }px) scale(${zoom})`;
        if (cursorDotRef.current) {
          cursorDotRef.current.style.opacity = String(0.5 * clamp(lp.s, 0, 1));
          cursorDotRef.current.style.transform = `translate(${
            (mouse.x - G.left) / k - 4
          }px, ${(mouse.y - G.top) / k - 4}px)`;
        }
        gw.style.cursor = lp.s > 0.15 ? "none" : "";
      }

      // 5. grid cross-hair lines draw themselves
      if (lineHRef.current) {
        lineHRef.current.style.transform = `scaleX(${ease(clamp((p - 0.34) / 0.3, 0, 1))})`;
      }
      if (lineVRef.current) {
        lineVRef.current.style.transform = `scaleY(${ease(clamp((p - 0.38) / 0.3, 0, 1))})`;
      }

      // 6. cards deal out from the centre, then rows and chips stagger in
      for (let c = 0; c < 4; c++) {
        const d = capData[c];
        if (!d) continue;
        const ct = ease(clamp((p - 0.4 - c * 0.07) / 0.22, 0, 1));
        d.card.style.opacity = String(clamp(ct * 4, 0, 1));
        const r = d.card.getBoundingClientRect();
        const inside =
          mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
        const nx = inside ? ((mouse.x - r.left) / r.width) * 2 - 1 : 0;
        const ny = inside ? ((mouse.y - r.top) / r.height) * 2 - 1 : 0;
        const lensOn = overRows === c;
        d.sx += ((lensOn ? 0 : nx) - d.sx) * 0.12;
        d.sy += ((lensOn ? 0 : ny) - d.sy) * 0.12;
        d.h += ((inside && !lensOn ? 1 : 0) - d.h) * 0.12;

        const gEl = gridRef.current;
        const dealX = gEl ? gEl.offsetWidth / 2 - (d.card.offsetLeft + d.card.offsetWidth / 2) : 0;
        const dealY = gEl
          ? gEl.offsetHeight / 2 - (d.card.offsetTop + d.card.offsetHeight / 2) - 40
          : 0;
        const dealR = (c - 1.5) * 9;
        d.card.style.transform = `perspective(1100px) translate(${(1 - ct) * dealX}px, ${
          (1 - ct) * dealY - d.h * 10
        }px) rotate(${(1 - ct) * dealR}deg) scale(${(0.86 + 0.14 * ct) * (1 + d.h * 0.022)}) rotateX(${
          d.sy * -TILT * ct
        }deg) rotateY(${d.sx * TILT * ct}deg)`;
        d.card.style.zIndex = ct < 0.98 ? String(8 - c) : d.h > 0.5 ? "2" : "1";

        if (d.glow) {
          d.glow.style.opacity = inside ? "1" : "0";
          if (inside) {
            const px = ((mouse.x - r.left) / r.width) * 100;
            const py = ((mouse.y - r.top) / r.height) * 100;
            d.glow.style.background = `radial-gradient(560px 420px at ${px}% ${py}%, rgba(${d.acc},0.22), rgba(${d.acc},0.05) 55%, rgba(0,0,0,0) 75%)`;
          }
        }
        for (let i = 0; i < d.rows.length; i++) {
          const rt = ease(clamp((p - 0.46 - c * 0.07 - i * 0.035) / 0.14, 0, 1));
          d.rows[i].style.opacity = String(rt);
          d.rows[i].style.transform = `translateX(${(1 - rt) * -14}px)`;
          if (d.dashes[i]) d.dashes[i].style.transform = `scaleX(${rt})`;
        }
        for (let i = 0; i < d.chips.length; i++) {
          const st = ease(clamp((p - 0.58 - c * 0.07 - i * 0.03) / 0.14, 0, 1));
          d.chips[i].style.opacity = String(st);
          d.chips[i].style.transform = `scale(${0.82 + 0.18 * st})`;
        }
      }

      // 7. spotlight trails the cursor
      if (spotRef.current) {
        const show = mouse.x >= 0;
        const sEl = fitRef.current?.parentElement ?? root;
        const rr = sEl.getBoundingClientRect();
        spotPos.x += (mouse.x - rr.left - spotPos.x) * 0.06;
        spotPos.y += (mouse.y - rr.top - spotPos.y) * 0.06;
        spotRef.current.style.opacity = show ? "1" : "0";
        spotRef.current.style.transform = `translate(${spotPos.x - 450}px, ${
          spotPos.y - 450
        }px)`;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [groups.length]);

  return (
    <section
      id="capabilities"
      ref={rootRef}
      style={{
        position: "relative",
        height: `${SCENE_LENGTH_VH}vh`,
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
        <div
          ref={spotRef}
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 900,
            height: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.06), rgba(0,0,0,0) 65%)",
            pointerEvents: "none",
            willChange: "transform",
          }}
        />

        <div
          ref={fitRef}
          style={{
            position: "relative",
            maxWidth: 1280,
            width: "100%",
            margin: "0 auto",
            padding: "0 48px",
            boxSizing: "border-box",
          }}
        >
          {/* label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: "0.34em",
              marginBottom: 34,
            }}
          >
            <span style={{ color: "#3B82F6" }}>//&nbsp;&nbsp;</span>
            <span ref={typeRef} style={{ color: "#82828B" }}>
              {label}
            </span>
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

          {/* headline — split into words, then letters */}
          <div style={{ position: "relative", margin: "0 0 26px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(44px, 5.6vw, 76px)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.04,
                color: "#F4F4F6",
                textWrap: "balance",
              }}
            >
              {title.split(" ").map((word, wi) => (
                <span
                  key={wi}
                  style={{ display: "inline-block", verticalAlign: "top" }}
                >
                  {Array.from(word).map((ch, ci) => (
                    <span
                      key={ci}
                      data-l=""
                      style={{
                        display: "inline-block",
                        opacity: 0,
                        willChange: "transform, opacity",
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                  {wi < title.split(" ").length - 1 ? " " : null}
                </span>
              ))}
            </h2>
          </div>

          <p
            ref={subRef}
            style={{
              margin: "0 0 96px",
              fontSize: 22,
              color: "#9A9AA3",
              opacity: 0,
              transform: "translateY(14px)",
              maxWidth: 720,
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {lead}
          </p>

          {/* grid */}
          <div ref={gridWrapRef} style={{ position: "relative" }}>
            <div
              ref={lineHRef}
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 1,
                background: "#232329",
                transform: "scaleX(0)",
                transformOrigin: "left",
              }}
            />
            <div
              ref={lineVRef}
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: 1,
                background: "#232329",
                transform: "scaleY(0)",
                transformOrigin: "top",
              }}
            />

            <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              {groups.slice(0, 4).map((group, c) => (
                <div
                  key={group.no}
                  ref={(el) => {
                    capRefs.current[c] = el;
                  }}
                  className="cap-card"
                  style={{
                    ["--acc" as string]: ACCENTS[c].hex,
                    position: "relative",
                    padding: "58px 56px 62px",
                    opacity: 0,
                    willChange: "transform",
                  }}
                >
                  <div
                    data-glow=""
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      pointerEvents: "none",
                      transition: "opacity 0.35s",
                    }}
                  />
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 15,
                        marginBottom: 32,
                      }}
                    >
                      <span style={{ fontFamily: MONO, fontSize: 13, color: ACCENTS[c].hex }}>
                        {group.no}
                      </span>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 26,
                          fontWeight: 650,
                          letterSpacing: "-0.01em",
                          color: "#F2F2F4",
                        }}
                      >
                        {group.title}
                      </h3>
                    </div>

                    {group.items.map((item) => (
                      <div
                        key={item}
                        data-row=""
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "11px 0",
                          opacity: 0,
                        }}
                      >
                        <span
                          data-dash=""
                          aria-hidden
                          style={{
                            width: 20,
                            height: 1.5,
                            background: `rgba(${ACCENTS[c].rgb},0.6)`,
                            transform: "scaleX(0)",
                            transformOrigin: "left",
                            flex: "none",
                          }}
                        />
                        <span style={{ fontSize: 15.5, color: "#B4B4BC" }}>{item}</span>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: 10, marginTop: 30, flexWrap: "wrap" }}>
                      {group.tools.map((tool) => (
                        <span key={tool} data-chip="" className="cap-chip">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* magnifier lens + cursor dot */}
            <div
              ref={lensRef}
              aria-hidden
              className="cap-lens"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 360,
                height: 120,
                borderRadius: 999,
                overflow: "hidden",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 5,
                background: "var(--color-bg)",
                border: "1px solid rgba(255,255,255,0.25)",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -12px 26px rgba(255,255,255,0.05)",
                willChange: "transform, opacity",
              }}
            >
              <div
                ref={lensInnerRef}
                style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0" }}
              />
            </div>
            <div
              ref={cursorDotRef}
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.4)",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 6,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
