"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Volume2, VolumeX, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useUIStore } from "@/store/ui.store";
import { createSwarm, type Swarm } from "./engine";
import { SWARM_COLORS, SWARM_DURATION_MS, SWARM_INITIALS, SWARM_ROUTES, SWARM_SPEEDS, SWARM_WEIGHTS } from "./swarm.constants";
import { SWARM_CSS } from "./swarm.css";
import type { SwarmState } from "./swarm.types";

interface SwarmBuildProps {
  onClose: () => void;
}

/** What's rebuilt: the whole page first; after a page turn the nav (if any) is already built. */
const rootsFor = (page: number) => [...document.querySelectorAll(page ? "body > main, body > footer" : "body > header, body > main, body > footer")];

/** Resolves once the page in view has been swapped for a new one (and has painted), or after a while regardless. */
const arrival = (old: Element | null) =>
  new Promise<void>((done) => {
    const until = performance.now() + 4000;
    const check = () => {
      const now = document.querySelector("body > main");
      if ((now && now !== old) || performance.now() > until) requestAnimationFrame(() => requestAnimationFrame(() => done()));
      else requestAnimationFrame(check);
    };
    check();
  });
/** Left out of the rebuild: the overlay, the nav's build menu, dev tooling. */
const skip = (el: Element) =>
  el.hasAttribute("data-swarm-ui") || el.hasAttribute("data-build-menu") || el.tagName === "NEXTJS-PORTAL";

/**
 * Build 2 — the swarm. Its overlay lives in a shadow root on the body, so
 * neither the page's styles nor its hide-everything rule reach it; the engine
 * does the rest on the real page.
 */
export default function SwarmBuild({ onClose }: SwarmBuildProps) {
  const t = useTranslations("Build.swarm");
  const router = useRouter();
  const pathname = usePathname();
  // The run: the page it started on, then the rest of the site's pages.
  const [route] = useState(() => {
    const start = pathname;
    return { start, pages: [start, ...SWARM_ROUTES.filter((r) => r !== start)] };
  });
  const [root, setRoot] = useState<ShadowRoot | null>(null);
  const [state, setState] = useState<SwarmState>({ phase: "scan", agents: 0, done: 0, total: 0, tour: true, speed: 1, sound: true });
  const swarm = useRef<Swarm | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const house = useRef<HTMLDivElement>(null);
  const rulerTop = useRef<HTMLCanvasElement>(null);
  const rulerLeft = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const host = document.createElement("div");
    host.setAttribute("data-swarm-ui", "");
    document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    const css = document.createElement("style");
    css.textContent = SWARM_CSS;
    shadow.append(css);
    hostRef.current = host;
    setRoot(shadow);
    return () => host.remove();
  }, []);

  useEffect(() => {
    if (!root || !stage.current || !cover.current || !logo.current || !house.current || !rulerTop.current || !rulerLeft.current) return;
    const s = createSwarm({
      stage: stage.current,
      cover: cover.current,
      logo: logo.current,
      house: house.current,
      rulerTop: rulerTop.current,
      rulerLeft: rulerLeft.current,
      roots: rootsFor,
      pages: route.pages.length,
      turn: (page) => {
        const old = document.querySelector("body > main");
        router.push(route.pages[page], { scroll: false });
        return arrival(old);
      },
      duration: SWARM_DURATION_MS,
      startedAt: useUIStore.getState().buildAt,
      weigh: (el, i, page) => (page ? 1 : (SWARM_WEIGHTS[el.id || (i === 0 ? "hero" : el.tagName.toLowerCase())] ?? 1)),
      skip,
      onState: setState,
    });
    swarm.current = s;
    s.start();
    return () => {
      s.destroy();
      swarm.current = null;
    };
    // Created once per run; the router and route are stable for its life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  /** Leaving: back to the page the run started on, if it moved on. */
  const here = useRef(pathname);
  useEffect(() => {
    here.current = pathname;
  }, [pathname]);
  const exit = useCallback(() => {
    if (here.current !== route.start) router.push(route.start, { scroll: false });
    onClose();
  }, [onClose, route.start, router]);
  /** Go live: the overlay fades and the real page is back, clickable. */
  const live = useCallback(() => {
    const host = hostRef.current;
    if (!host) return exit();
    host.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: "forwards" }).onfinish = exit;
  }, [exit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      else if ((e.key === "m" || e.key === "M") && !e.metaKey && !e.ctrlKey) swarm.current?.setSound(!state.sound);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [exit, state.sound]);

  if (!root) return null;
  const s = swarm.current;
  const ratio = state.total ? state.done / state.total : 0;

  return createPortal(
    <>
      <div className="shield" aria-hidden />
      <div ref={cover} className="cover" />
      <canvas ref={rulerTop} className="ruler top" aria-hidden />
      <canvas ref={rulerLeft} className="ruler left" aria-hidden />
      <div ref={stage} className="stage" aria-hidden>
        {/* The cursors' home: a little house with a lit window once they're all in. */}
        <div ref={house} className="house">
          <svg viewBox="0 0 44 44">
            <circle className="glow" cx="22" cy="24" r="18" fill="rgba(255,210,63,.18)" />
            <path d="M8 20 22 8l14 12v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2Z" fill="#1b1b21" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5 21.5 22 6.5l17 15" fill="none" stroke="#3b62e5" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <rect className="win" x="12" y="21" width="6" height="6" rx="1" />
            <path d="M24 38v-9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9" fill="#050506" />
            <path className="door" d="M24 38v-9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9" fill="#3b62e5" stroke="rgba(255,255,255,.25)" strokeWidth="0.8" />
          </svg>
        </div>
      </div>
      {/* The splash: the mark's two squares dragged out like any layer, then the name typed beside it. */}
      <div ref={logo} className="logo" aria-hidden>
        <div className="mark">
          <i className="sq back" />
          <i className="sq front" />
          <b className="box">
            <em />
          </b>
        </div>
        <span className="word">
          {"efface".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
          <i className="caret" />
        </span>
      </div>
      <section className="bar" role="toolbar" aria-label={t("label")}>
        {state.phase === "scan" || state.phase === "orbit" ? (
          <>
            <span className="dim" aria-live="polite">{t("scanning")}</span>
            <span className="track scan" aria-hidden>
              <i />
            </span>
          </>
        ) : (
          <>
            <span className="faces hide-sm" aria-hidden>
              {SWARM_INITIALS.map((c, i) => (
                <span key={i} style={{ background: SWARM_COLORS[i] }}>
                  {c}
                </span>
              ))}
            </span>
            <span>
              <strong>{state.agents}</strong> <span className="dim">{t("agents")}</span>
            </span>
            <span className="sep hide-sm" aria-hidden />
            <span aria-live="polite">
              {state.phase === "done" ? (
                t("done")
              ) : (
                <>
                  <strong>{state.done}</strong>
                  <span className="dim"> / {t("layers", { total: state.total })}</span>
                </>
              )}
            </span>
            <span className="track hide-sm" role="progressbar" aria-label={t("progress")} aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${ratio * 100}%` }} />
            </span>
          </>
        )}
        {state.phase === "done" ? (
          <>
            <button type="button" className="primary" onClick={live}>
              {t("live")}
            </button>
            <button type="button" onClick={() => void s?.replay()}>
              {t("replay")}
            </button>
          </>
        ) : (
          <>
            <button type="button" aria-pressed={state.tour} onClick={() => s?.setTour(!state.tour)}>
              {t("tour")}
            </button>
            <button
              type="button"
              aria-label={t("speed")}
              onClick={() => s?.setSpeed(SWARM_SPEEDS[(SWARM_SPEEDS.indexOf(state.speed) + 1) % SWARM_SPEEDS.length])}
            >
              {state.speed}×
            </button>
          </>
        )}
        <button type="button" className="icon" aria-label={state.sound ? t("soundOff") : t("soundOn")} onClick={() => s?.setSound(!state.sound)}>
          {state.sound ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
        </button>
        <button type="button" className="icon" aria-label={t("close")} onClick={exit}>
          <X aria-hidden />
        </button>
      </section>
    </>,
    root
  );
}
