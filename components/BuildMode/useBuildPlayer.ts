"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { BuildCommand, BuildEnvelope, BuildFile, BuildRect, BuildReply, BuildStatus } from "./BuildMode.types";
import { ENTER_WAIT_MS, LETTERS_PER_SEC, SECTION_END_WAIT_MS, TYPE_CPS } from "./BuildMode.constants";

/** Shortest gap between editor redraws while typing (about 30 fps). */
const VIEW_FRAME_MS = 32;

/**
 * Types the files out against the clock and tells the preview what each
 * stretch of code just built. One frame loop; the position lives in a ref and
 * only `view` (file + caret) re-renders the editor. Waits in "loading" until
 * both the source (`files`) and the preview are in (`loaded`) and `started`.
 */
export function useBuildPlayer(
  files: BuildFile[] | null,
  frameRef: RefObject<HTMLIFrameElement | null>,
  speed: number,
  /** Held back until the opening splash has lifted. */
  started: boolean
) {
  const [previewReady, setPreviewReady] = useState(false);
  const [state, setState] = useState<Exclude<BuildStatus, "loading">>("playing");
  const [view, setView] = useState({ file: 0, pos: 0 });
  const [focus, setFocus] = useState<BuildRect | null>(null);
  const loaded = !!files && previewReady;
  const status: BuildStatus = loaded && started ? state : "loading";

  // The frame loop reads these without restarting on every change.
  const statusRef = useRef(status);
  const speedRef = useRef(speed);
  useEffect(() => {
    statusRef.current = status;
    speedRef.current = speed;
  }, [status, speed]);
  // file, caret, typing budget, time in the current wait, and the next event
  const play = useRef({
    file: 0,
    pos: 0,
    budget: 0,
    wait: 0,
    phase: "enter" as "enter" | "type" | "end",
    event: 0,
    drawn: 0,
    // Typing slows by `slow` until `slowUntil`, so a letters phase lasts long
    // enough for its letters to be seen one by one.
    slow: 1,
    slowUntil: 0,
  });

  const post = useCallback(
    (msg: BuildCommand) => {
      const envelope: BuildEnvelope<BuildCommand> = { efface: "build", msg };
      frameRef.current?.contentWindow?.postMessage(envelope, location.origin);
    },
    [frameRef]
  );

  // The preview says when it has loaded and wiped itself, and what it's building.
  useEffect(() => {
    const onMessage = (e: MessageEvent<BuildEnvelope<BuildReply>>) => {
      if (e.source !== frameRef.current?.contentWindow || e.origin !== location.origin) return;
      if (e.data?.efface !== "build") return;
      const msg = e.data.msg;
      if (msg.type === "ready") setPreviewReady(true);
      else if (msg.type === "focus") setFocus(msg.rect);
      else {
        const s = play.current;
        const file = files?.[s.file];
        if (!file) return;
        const end = Math.min(
          file.code.length,
          msg.span === undefined ? file.textSpan[1] : s.pos + Math.round(msg.span * file.code.length)
        );
        const natural = (file.costSum[end] - file.costSum[s.pos]) / TYPE_CPS;
        const needed = msg.units / LETTERS_PER_SEC;
        // The budget applies the file's speed to both, so the ratio holds.
        s.slow = natural > 0 ? Math.max(1, needed / natural) : 1;
        s.slowUntil = end;
      }
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, [frameRef, files]);

  useEffect(() => {
    if (!files) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 100) * speedRef.current;
      last = now;
      if (statusRef.current !== "playing") return;
      const s = play.current;
      const file = files[s.file];

      if (s.phase === "enter") {
        if (s.wait === 0) {
          // The preview learns what every file builds before the first one starts.
          if (s.file === 0) post({ type: "plan", files: files.map((f) => f.plan) });
          post({ type: "enter", file: s.file });
        }
        s.wait += dt || 1;
        if (s.wait >= ENTER_WAIT_MS) Object.assign(s, { phase: "type", wait: 0 });
        return;
      }

      if (s.phase === "type") {
        s.budget += ((dt / 1000) * TYPE_CPS * file.speed) / (s.pos < s.slowUntil ? s.slow : 1);
        const before = s.pos;
        while (s.pos < file.code.length && s.budget >= file.cost[s.pos]) {
          s.budget -= file.cost[s.pos];
          // Reaching an event's offset moves the preview to its next stage.
          while (s.event < file.events.length && file.events[s.event].at <= s.pos) {
            post({ type: "stage", file: s.file, stage: file.events[s.event].event, speed: speedRef.current });
            s.event++;
          }
          s.pos++;
        }
        if (s.pos !== before) {
          const stage = file.events[s.event - 1]?.event;
          if (file.driven) {
            post({ type: "progress", file: s.file, p: s.pos / file.code.length, speed: speedRef.current });
          } else if (stage === "layout") {
            post({ type: "layout", file: s.file, p: Math.min(1, s.pos / Math.max(1, file.textSpan[0])) });
          } else if (stage === "text") {
            const [from, to] = file.textSpan;
            post({ type: "text", file: s.file, p: Math.min(1, (s.pos - from) / Math.max(1, to - from)) });
          }
          // The editor redraws at most every other frame — typing reads the
          // same, and the preview keeps the main thread it shares with us.
          if (now - s.drawn >= VIEW_FRAME_MS || s.pos >= file.code.length) {
            s.drawn = now;
            setView({ file: s.file, pos: s.pos });
          }
        }
        if (s.pos >= file.code.length) {
          if (!file.driven) post({ type: "stage", file: s.file, stage: "done", speed: speedRef.current });
          post({ type: "fileDone", file: s.file });
          Object.assign(s, { phase: "end", wait: 0, budget: 0 });
        }
        return;
      }

      s.wait += dt;
      // A scroll scene plays through first, then the usual beat.
      const scrub = file.plan.scrub ?? 0;
      if (scrub) post({ type: "scrub", file: s.file, p: Math.min(1, s.wait / scrub) });
      if (s.wait < scrub + SECTION_END_WAIT_MS) return;
      if (s.file + 1 < files.length) {
        Object.assign(s, { file: s.file + 1, pos: 0, phase: "enter", wait: 0, event: 0, slow: 1, slowUntil: 0 });
        setView({ file: s.file, pos: 0 });
      } else {
        post({ type: "finish" });
        setState("done");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [files, post]);

  /** Jump to the finished page — every file written, the preview whole. */
  const skip = useCallback(() => {
    if (!files) return;
    const lastFile = files.length - 1;
    Object.assign(play.current, { file: lastFile, pos: files[lastFile].code.length, phase: "end" });
    setView({ file: lastFile, pos: files[lastFile].code.length });
    post({ type: "finish" });
    setState("done");
  }, [files, post]);

  const total = files?.reduce((sum, f) => sum + f.code.length, 0) ?? 0;
  const done = (files?.slice(0, view.file).reduce((sum, f) => sum + f.code.length, 0) ?? 0) + view.pos;
  const progress = status === "done" ? 1 : total ? done / total : 0;

  return {
    loaded,
    status,
    view,
    progress,
    focus: status === "done" ? null : focus,
    pause: () => setState((s) => (s === "playing" ? "paused" : s)),
    resume: () => setState((s) => (s === "paused" ? "playing" : s)),
    skip,
  };
}
