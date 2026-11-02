"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/motion";
import { speak, stopSpeech, unlockSpeech } from "./tourSpeech";
import {
  TOUR_GLIDE_MS,
  TOUR_SECONDS_PER_CHAR,
  TOUR_STEPS,
  TOUR_STEP_GAP,
  TOUR_TOP_OFFSET,
} from "./tourSteps";
import type { TourStatus, TourStep } from "./Tour.types";

/** Thrown through the step chain when the tour is stopped. */
class TourStopped extends Error {}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(new TourStopped());
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new TourStopped());
    };
    const id = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });

/** Runs `frame(t)` for t 0 → 1 over `ms`, eased; rejects if stopped. */
const tween = (ms: number, signal: AbortSignal, frame: (t: number) => void) =>
  new Promise<void>((resolve, reject) => {
    const start = performance.now();
    const tick = (now: number) => {
      if (signal.aborted) return reject(new TourStopped());
      const t = ms <= 0 ? 1 : clamp((now - start) / ms, 0, 1);
      frame(t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });

const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

/**
 * Drives the guided tour: scrolls the page, glides a pretend cursor and
 * presses things while each line is spoken and captioned. The cursor is
 * painted straight into `cursorRef` per frame; React state only changes once
 * per step (caption, index).
 *
 * Any real wheel, touch, key or press stops it, as does unmounting.
 */
export function useTour(lines: Record<string, string>, locale: string) {
  const [status, setStatus] = useState<TourStatus>("idle");
  const [index, setIndex] = useState(0);
  /** Character the voice has reached in the current line — drives the caption. */
  const [progress, setProgress] = useState(0);
  // Where the cursor and captions are portalled. A modal <dialog> sits in the
  // top layer over everything else, so while one is open they move inside it.
  const [host, setHost] = useState<Element | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const over = useRef<Element | null>(null);
  const reduce = useRef(false);

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
    [pointAt]
  );

  const press = useCallback(async (signal: AbortSignal) => {
    const { x, y } = pos.current;
    const target = document.elementFromPoint(x, y);
    cursorRef.current?.classList.remove("is-down");
    void cursorRef.current?.offsetWidth; // restart the ring animation
    cursorRef.current?.classList.add("is-down");
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
  }, []);

  /** Scrolls so `target` sits under the nav, or through it over `ms`. */
  const scroll = useCallback(
    async (step: TourStep, ms: number, signal: AbortSignal) => {
      if (!step.scroll) return;
      const el = document.querySelector(step.scroll.target);
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = clamp(docTop(el) - (step.scroll.target === "#top" ? 0 : TOUR_TOP_OFFSET), 0, max);
      const through = step.scroll.mode === "through";
      const from = window.scrollY;
      const to = through ? clamp(docTop(el) + (el as HTMLElement).offsetHeight - window.innerHeight, 0, max) : top;

      if (through && Math.abs(from - top) > 4) {
        await tween(reduce.current ? 0 : 900, signal, (t) =>
          window.scrollTo({ top: from + (top - from) * easeInOut(t), behavior: "instant" })
        );
      }
      const start = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // While scrolling through a scene the cursor drifts mid-screen, so hover
      // effects (the capability lens, row highlights) keep playing.
      await tween(reduce.current ? 0 : through ? ms : 1100, signal, (t) => {
        window.scrollTo({ top: start + (to - start) * (through ? t : easeInOut(t)), behavior: "instant" });
        if (through) {
          const a = t * Math.PI * 2;
          pointAt(vw * (0.58 + 0.12 * Math.sin(a * 1.5)), vh * (0.5 + 0.18 * Math.sin(a * 2.3)));
        }
      });
    },
    [pointAt]
  );

  const runStep = useCallback(
    async (step: TourStep, signal: AbortSignal) => {
      const line = lines[step.id] ?? "";
      const perChar = TOUR_SECONDS_PER_CHAR[locale as keyof typeof TOUR_SECONDS_PER_CHAR] ?? TOUR_SECONDS_PER_CHAR.en;
      const estimate = line.length * perChar * 1000;

      const through = step.scroll?.mode === "through";
      // A scene scroll plays alongside the line; anything else settles first.
      if (!through) await scroll(step, 0, signal);
      setProgress(0);
      const spoken = speak(line, locale, estimate, setProgress);
      const moves = (async () => {
        if (through) await scroll(step, estimate, signal);
        const target = step.pointer?.target ? document.querySelector(step.pointer.target) : null;
        if (target) {
          const r = target.getBoundingClientRect();
          await glide(r.left + Math.min(r.width / 2, 160), r.top + r.height / 2, signal);
          if (step.pointer?.click) {
            await wait(250, signal);
            await press(signal);
            setHost(document.querySelector("dialog[open]"));
          }
        }
      })();
      await Promise.all([spoken, moves]);
      if (signal.aborted) throw new TourStopped();

      if (step.after === "closeDialog") {
        const close = document.querySelector("dialog[open] form[method='dialog'] button");
        if (close) {
          const r = close.getBoundingClientRect();
          await glide(r.left + r.width / 2, r.top + r.height / 2, signal);
          await press(signal);
        }
        setHost(null);
      }
      await wait(TOUR_STEP_GAP, signal);
    },
    [lines, locale, scroll, glide, press]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopSpeech();
    over.current = null;
    setHost(null);
    setStatus("idle");
  }, []);

  const start = useCallback(() => {
    if (abortRef.current) return;
    unlockSpeech(); // must happen inside the click itself (iOS)
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    pos.current = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.6 };
    setIndex(0);
    setStatus("playing");
    void (async () => {
      try {
        for (let i = 0; i < TOUR_STEPS.length; i++) {
          setIndex(i);
          await runStep(TOUR_STEPS[i], ctrl.signal);
        }
      } catch (e) {
        if (!(e instanceof TourStopped)) throw e;
      } finally {
        if (abortRef.current === ctrl) stop();
      }
    })();
  }, [runStep, stop]);

  // The cursor element remounts when it moves between hosts; repaint it.
  useEffect(() => {
    if (status === "playing") paintCursor();
  }, [host, status, paintCursor]);

  // A real wheel, touch, key or press hands control back to the visitor.
  useEffect(() => {
    if (status !== "playing") return;
    const onInput = (e: Event) => {
      if (!e.isTrusted) return;
      if (e.target instanceof Element && e.target.closest("[data-tour-controls]")) return;
      stop();
    };
    const opts = { capture: true, passive: true } as const;
    const kinds = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    kinds.forEach((k) => window.addEventListener(k, onInput, opts));
    return () => kinds.forEach((k) => window.removeEventListener(k, onInput, opts));
  }, [status, stop]);

  useEffect(() => () => {
    abortRef.current?.abort();
    stopSpeech();
  }, []);

  return { status, index, total: TOUR_STEPS.length, step: TOUR_STEPS[index], start, stop, cursorRef, host, progress };
}
