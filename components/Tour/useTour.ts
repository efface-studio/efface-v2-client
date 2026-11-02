"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/motion";
import timingsJson from "./tourTimings.json";
import {
  TOUR_FOCUS_PAD,
  TOUR_GLIDE_MS,
  TOUR_STEPS,
  TOUR_STEP_GAP,
  TOUR_TOP_OFFSET,
} from "./tourSteps";
import type { TourLineTiming, TourStatus, TourStep } from "./Tour.types";

const TIMINGS = timingsJson as Record<string, Record<string, TourLineTiming>>;

/** Thrown through the step chain when the tour is closed. */
class TourStopped extends Error {}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
/** Where the tour last put the page — resuming returns here, whatever the
 *  visitor scrolled to in between. */
let tourScrollY = 0;
const scrollPage = (top: number) => {
  tourScrollY = top;
  window.scrollTo({ top, behavior: "instant" });
};

/** Caption characters said by `ms` into a line: whole words before it, and the
 *  current word filled in proportion to how far into it the voice is. */
function charsAt(timing: TourLineTiming | undefined, ms: number, length: number): number {
  if (!timing) return length;
  if (ms >= timing.duration) return length;
  let at = 0;
  for (const w of timing.words) {
    if (ms < w.t) break;
    at = ms >= w.t + w.d ? w.e : w.s + ((ms - w.t) / Math.max(1, w.d)) * (w.e - w.s);
  }
  return at;
}

/**
 * Drives the guided tour: scrolls the page, glides a pretend cursor, frames
 * what is being described with a spotlight and presses things, while each
 * line plays from pre-rendered narration (`public/tour/<locale>/<step>.mp3`).
 *
 * Everything runs on one pausable clock, so pausing — the pause button, or any
 * real wheel, touch, key or press — freezes motion and audio mid-step, and
 * resuming picks up exactly there (scrolling back first if the visitor moved).
 * Per-frame work paints straight into refs; React state changes once per step.
 */
export function useTour(lines: Record<string, string>, locale: string) {
  const [status, setStatus] = useState<TourStatus>("idle");
  const [index, setIndex] = useState(0);
  // Where the cursor, spotlight and captions are portalled. A modal <dialog>
  // sits in the top layer over everything else, so while one is open they
  // move inside it.
  const [host, setHost] = useState<Element | null>(null);

  const cursorRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const over = useRef<Element | null>(null);
  const reduce = useRef(false);
  const focusSel = useRef<string | undefined>(undefined);
  const focusBox = useRef({ x: 0, y: 0, w: 0, h: 0, o: 0 });
  // Pausable clock: real time minus every paused stretch.
  const clock = useRef({ paused: false, since: 0, lost: 0 });
  const pausedAt = useRef(0);
  const line = useRef<{ id: string; started: number } | null>(null);
  // Smoothed narration time. Browsers step `currentTime` coarsely (Safari
  // ~4 times a second), so between steps it is carried forward on the frame
  // clock and never allowed to run backwards.
  const voiceTime = useRef({ ct: -1, at: 0, ms: 0 });

  const now = useCallback(() => {
    const c = clock.current;
    return performance.now() - c.lost - (c.paused ? performance.now() - c.since : 0);
  }, []);

  /** Runs `frame(t)` for t 0 → 1 over `ms` of tour time. Rejects once closed;
   *  while paused, just waits. */
  const tween = useCallback(
    (ms: number, signal: AbortSignal, frame: (t: number) => void) =>
      new Promise<void>((resolve, reject) => {
        const start = now();
        const tick = () => {
          if (signal.aborted) return reject(new TourStopped());
          if (!clock.current.paused) {
            const t = ms <= 0 ? 1 : clamp((now() - start) / ms, 0, 1);
            frame(t);
            if (t >= 1) return resolve();
          }
          requestAnimationFrame(tick);
        };
        tick();
      }),
    [now]
  );
  const wait = useCallback((ms: number, signal: AbortSignal) => tween(ms, signal, () => {}), [tween]);

  const paintCursor = useCallback(() => {
    const el = cursorRef.current;
    if (el) el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  }, []);

  /** Moves the cursor and tells the page, like a real pointer would. */
  const pointAt = useCallback(
    (x: number, y: number) => {
      pos.current = { x, y };
      paintCursor();
      const target = document.elementFromPoint(x, y);
      const init = { clientX: x, clientY: y, bubbles: true, pointerType: "mouse", isPrimary: true };
      if (target !== over.current) {
        over.current?.dispatchEvent(new PointerEvent("pointerleave", { ...init, bubbles: false }));
        over.current?.dispatchEvent(new MouseEvent("mouseout", init));
        target?.dispatchEvent(new MouseEvent("mouseover", init));
        target?.dispatchEvent(new PointerEvent("pointerenter", { ...init, bubbles: false }));
        over.current = target;
      }
      target?.dispatchEvent(new PointerEvent("pointermove", init));
      target?.dispatchEvent(new MouseEvent("mousemove", init));
    },
    [paintCursor]
  );

  const glide = useCallback(
    async (x: number, y: number, signal: AbortSignal) => {
      const from = { ...pos.current };
      await tween(reduce.current ? 0 : TOUR_GLIDE_MS, signal, (t) => {
        const e = easeInOut(t);
        pointAt(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
      });
    },
    [pointAt, tween]
  );

  const press = useCallback(
    async (signal: AbortSignal) => {
      const { x, y } = pos.current;
      const target = document.elementFromPoint(x, y);
      const el = cursorRef.current;
      el?.classList.remove("is-down");
      void el?.offsetWidth; // restart the ring animation
      el?.classList.add("is-down");
      if (!target) return;
      const init = { clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: "mouse", isPrimary: true };
      target.dispatchEvent(new PointerEvent("pointerdown", init));
      target.dispatchEvent(new MouseEvent("mousedown", init));
      await wait(90, signal);
      target.dispatchEvent(new PointerEvent("pointerup", init));
      target.dispatchEvent(new MouseEvent("mouseup", init));
      // A dispatched click still runs the element's default action — it opens a
      // <details>, submits a dialog form, and reaches delegated handlers.
      target.dispatchEvent(new MouseEvent("click", init));
    },
    [wait]
  );

  /** Scrolls so the step's target sits under the nav, or through it over `ms`. */
  const scroll = useCallback(
    async (step: TourStep, ms: number, signal: AbortSignal) => {
      if (!step.scroll) return;
      const el = document.querySelector<HTMLElement>(step.scroll.target);
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = clamp(docTop(el) - (step.scroll.target === "#top" ? 0 : TOUR_TOP_OFFSET), 0, max);
      const through = step.scroll.mode === "through";
      const to = through ? clamp(docTop(el) + el.offsetHeight - window.innerHeight, 0, max) : top;

      if (through) {
        const from = window.scrollY;
        if (Math.abs(from - top) > 4) {
          await tween(reduce.current ? 0 : 900, signal, (t) =>
            scrollPage(from + (top - from) * easeInOut(t))
          );
        }
      }
      const start = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // While scrolling through a scene the cursor drifts mid-screen, so hover
      // effects (the capability lens, row highlights) keep playing.
      await tween(reduce.current ? 0 : through ? ms : 1100, signal, (t) => {
        scrollPage(start + (to - start) * (through ? t : easeInOut(t)));
        if (through) {
          const a = t * Math.PI * 2;
          pointAt(vw * (0.58 + 0.12 * Math.sin(a * 1.5)), vh * (0.5 + 0.18 * Math.sin(a * 2.3)));
        }
      });
    },
    [pointAt, tween]
  );

  /** Plays a step's narration; resolves when it ends. If the audio can't play,
   *  the line is held for its length on the tour clock so the captions run. */
  const narrate = useCallback(
    (id: string, signal: AbortSignal) => {
      const timing = TIMINGS[locale]?.[id];
      const started = now();
      line.current = { id, started };
      voiceTime.current = { ct: -1, at: 0, ms: 0 };
      const audio = audioRef.current;
      if (!audio) return wait(timing?.duration ?? 0, signal);
      return new Promise<void>((resolve, reject) => {
        let fallback = false;
        const cleanup = () => {
          audio.removeEventListener("ended", done);
          audio.removeEventListener("error", fail);
          signal.removeEventListener("abort", abort);
        };
        const done = () => {
          cleanup();
          resolve();
        };
        // A stalled stream mustn't hang the tour: give up a little past the line.
        wait((timing?.duration ?? 0) + 3000, signal).then(done, () => {});
        const abort = () => {
          cleanup();
          audio.pause();
          reject(new TourStopped());
        };
        const fail = () => {
          if (fallback) return;
          fallback = true;
          cleanup();
          wait(Math.max(0, (timing?.duration ?? 0) - (now() - started)), signal).then(resolve, reject);
        };
        audio.addEventListener("ended", done);
        audio.addEventListener("error", fail);
        signal.addEventListener("abort", abort, { once: true });
        audio.src = `/tour/${locale}/${id}.mp3`;
        audio.play().catch(fail);
      });
    },
    [locale, now, wait]
  );

  /** Caption characters said so far — the captions read this every frame. */
  const getProgress = useCallback(() => {
    const cur = line.current;
    if (!cur) return 0;
    const text = lines[cur.id] ?? "";
    const audio = audioRef.current;
    if (audio?.ended) return text.length;
    const v = voiceTime.current;
    if (audio && !audio.error && audio.currentTime > 0) {
      const ct = audio.currentTime * 1000;
      const t = performance.now();
      if (ct !== v.ct) {
        v.ct = ct;
        v.at = t;
      }
      const ahead = audio.paused ? 0 : Math.min(300, t - v.at);
      v.ms = Math.max(v.ms, ct + ahead);
    } else {
      v.ms = Math.max(v.ms, now() - cur.started);
    }
    return charsAt(TIMINGS[locale]?.[cur.id], v.ms, text.length);
  }, [lines, locale, now]);

  const runStep = useCallback(
    async (step: TourStep, signal: AbortSignal) => {
      focusSel.current = step.focus;
      const timing = TIMINGS[locale]?.[step.id];
      // The line starts with the step; scene scrolls run exactly as long as it.
      const spoken = narrate(step.id, signal);
      const moves = (async () => {
        await scroll(step, timing?.duration ?? 4000, signal);
        const target = step.pointer?.target ? document.querySelector(step.pointer.target) : null;
        if (target) {
          const r = target.getBoundingClientRect();
          await glide(r.left + Math.min(r.width / 2, 160), r.top + r.height / 2, signal);
          if (step.pointer?.click) {
            await wait(250, signal);
            await press(signal);
            const dialog = document.querySelector("dialog[open]");
            if (dialog) {
              focusSel.current = undefined;
              setHost(dialog);
            }
          }
        }
      })();
      await Promise.all([spoken, moves]);

      if (step.after === "closeDialog") {
        const btn = document.querySelector("dialog[open] form[method='dialog'] button");
        if (btn) {
          const r = btn.getBoundingClientRect();
          await glide(r.left + r.width / 2, r.top + r.height / 2, signal);
          await press(signal);
        }
        setHost(null);
      }
      await wait(TOUR_STEP_GAP, signal);
    },
    [locale, narrate, scroll, glide, press, wait]
  );

  const close = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    audioRef.current?.pause();
    clock.current = { paused: false, since: 0, lost: 0 };
    line.current = null;
    over.current = null;
    focusSel.current = undefined;
    setHost(null);
    setStatus("idle");
  }, []);

  const pause = useCallback(() => {
    if (!abortRef.current || clock.current.paused) return;
    clock.current.paused = true;
    clock.current.since = performance.now();
    pausedAt.current = tourScrollY;
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (!abortRef.current || !clock.current.paused) return;
    setStatus("playing");
    // Bring the page back to where the tour left it, then restart the clock
    // and the voice together.
    const from = window.scrollY;
    const to = pausedAt.current;
    const back = Math.abs(from - to) > 4 && !reduce.current ? 600 : 0;
    const t0 = performance.now();
    const step = () => {
      const t = back ? clamp((performance.now() - t0) / back, 0, 1) : 1;
      scrollPage(from + (to - from) * easeInOut(t));
      if (t < 1) return void requestAnimationFrame(step);
      const c = clock.current;
      c.lost += performance.now() - c.since;
      c.paused = false;
      const audio = audioRef.current;
      if (audio && audio.src && !audio.ended && audio.currentTime > 0) void audio.play().catch(() => {});
    };
    step();
  }, []);

  const start = useCallback(() => {
    if (abortRef.current) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    audioRef.current ??= new Audio();
    clock.current = { paused: false, since: 0, lost: 0 };
    pos.current = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 };
    focusBox.current.o = 0;
    tourScrollY = window.scrollY;
    setIndex(0);
    setStatus("playing");
    // The first line's play() runs synchronously inside this click, which is
    // what lets the browser play the rest without another gesture.
    void (async () => {
      try {
        for (let i = 0; i < TOUR_STEPS.length; i++) {
          setIndex(i);
          await runStep(TOUR_STEPS[i], ctrl.signal);
        }
      } catch (e) {
        if (!(e instanceof TourStopped)) throw e;
      } finally {
        if (abortRef.current === ctrl) close();
      }
    })();
  }, [runStep, close]);

  // Spotlight: eases toward the focused element every frame (it moves as the
  // page scrolls) and fades out when the step has nothing to frame.
  useEffect(() => {
    if (status === "idle") return;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const el = focusRef.current;
      if (!el) return;
      const b = focusBox.current;
      const target = focusSel.current ? document.querySelector(focusSel.current) : null;
      const k = reduce.current ? 1 : 0.16;
      if (target) {
        const r = target.getBoundingClientRect();
        const pad = TOUR_FOCUS_PAD;
        const snap = b.o < 0.01;
        b.x = snap ? r.left - pad : b.x + (r.left - pad - b.x) * k;
        b.y = snap ? r.top - pad : b.y + (r.top - pad - b.y) * k;
        b.w = snap ? r.width + pad * 2 : b.w + (r.width + pad * 2 - b.w) * k;
        b.h = snap ? r.height + pad * 2 : b.h + (r.height + pad * 2 - b.h) * k;
      }
      b.o += ((target ? 1 : 0) - b.o) * (reduce.current ? 1 : 0.12);
      el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0)`;
      el.style.width = `${b.w.toFixed(1)}px`;
      el.style.height = `${b.h.toFixed(1)}px`;
      el.style.opacity = b.o.toFixed(3);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [status, host]);

  // The cursor element remounts when it moves between hosts; repaint it.
  useEffect(() => {
    if (status !== "idle") paintCursor();
  }, [host, status, paintCursor]);

  // A real wheel, touch, key or press pauses the tour; the controls resume it.
  useEffect(() => {
    if (status !== "playing") return;
    const onInput = (e: Event) => {
      if (!e.isTrusted) return;
      if (e.target instanceof Element && e.target.closest("[data-tour-controls]")) return;
      pause();
    };
    const opts = { capture: true, passive: true } as const;
    const kinds = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    kinds.forEach((k) => window.addEventListener(k, onInput, opts));
    return () => kinds.forEach((k) => window.removeEventListener(k, onInput, opts));
  }, [status, pause]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      audioRef.current?.pause();
    },
    []
  );

  return {
    status,
    index,
    total: TOUR_STEPS.length,
    step: TOUR_STEPS[index],
    start,
    pause,
    resume,
    close,
    getProgress,
    cursorRef,
    focusRef,
    host,
  };
}
