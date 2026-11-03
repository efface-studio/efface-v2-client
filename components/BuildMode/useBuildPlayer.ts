"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { BuildCommand, BuildEnvelope, BuildEvent, BuildFile, BuildReply, BuildStatus } from "./BuildMode.types";
import { ENTER_WAIT_MS, NEWLINE_PAUSE, SECTION_END_WAIT_MS, TYPE_CPS } from "./BuildMode.constants";

const ORDER: BuildEvent[] = ["layout", "text", "color", "media"];

/** Per file: its full code, and for each character the part it belongs to. */
interface Prepared {
  code: string;
  partOf: number[];
  textBefore: number[];
  textTotal: number;
}

function prepare(file: BuildFile): Prepared {
  const partOf: number[] = [];
  const textBefore: number[] = [];
  let text = 0;
  file.parts.forEach((p, i) => {
    for (let k = 0; k < p.code.length; k++) {
      partOf.push(i);
      textBefore.push(text);
      if (p.event === "text") text++;
    }
  });
  return { code: file.parts.map((p) => p.code).join(""), partOf, textBefore, textTotal: text };
}

/**
 * Types the files out against the clock and tells the preview what each
 * stretch of code just built. One frame loop; the position lives in a ref and
 * only `view` (file + caret) re-renders the editor.
 */
export function useBuildPlayer(files: BuildFile[], frameRef: RefObject<HTMLIFrameElement | null>, speed: number) {
  const prepared = useMemo(() => files.map(prepare), [files]);
  const [status, setStatus] = useState<BuildStatus>("loading");
  const [view, setView] = useState({ file: 0, pos: 0 });

  // The frame loop reads these without restarting on every change.
  const statusRef = useRef(status);
  const speedRef = useRef(speed);
  useEffect(() => {
    statusRef.current = status;
    speedRef.current = speed;
  }, [status, speed]);
  // file, caret, typing budget, wait before the next phase, and the furthest stage sent
  const play = useRef({ file: 0, pos: 0, budget: 0, wait: 0, phase: "enter" as "enter" | "type" | "end", stage: -1 });

  const post = useCallback(
    (msg: BuildCommand) => {
      const envelope: BuildEnvelope<BuildCommand> = { efface: "build", msg };
      frameRef.current?.contentWindow?.postMessage(envelope, location.origin);
    },
    [frameRef]
  );

  // The preview says when it has loaded and wiped itself.
  useEffect(() => {
    const onMessage = (e: MessageEvent<BuildEnvelope<BuildReply>>) => {
      if (e.source !== frameRef.current?.contentWindow || e.origin !== location.origin) return;
      if (e.data?.efface === "build" && e.data.msg.type === "ready") setStatus((s) => (s === "loading" ? "playing" : s));
    };
    addEventListener("message", onMessage);
    return () => removeEventListener("message", onMessage);
  }, [frameRef]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 100) * speedRef.current;
      last = now;
      if (statusRef.current !== "playing") return;
      const s = play.current;
      const file = prepared[s.file];

      if (s.phase === "enter") {
        if (s.wait === 0) post({ type: "enter", sec: s.file });
        s.wait += dt || 1;
        if (s.wait >= ENTER_WAIT_MS) Object.assign(s, { phase: "type", wait: 0 });
        return;
      }

      if (s.phase === "type") {
        s.budget += (dt / 1000) * TYPE_CPS;
        const before = s.pos;
        while (s.pos < file.code.length) {
          const cost = file.code[s.pos] === "\n" ? NEWLINE_PAUSE : 1;
          if (s.budget < cost) break;
          s.budget -= cost;
          // Reaching a part fires its stage — only ever forward, so a closing
          // tag typed after the copy doesn't wipe the letters back out.
          const event = files[s.file].parts[file.partOf[s.pos]].event;
          const at = event ? ORDER.indexOf(event) : -1;
          if (at > s.stage) {
            s.stage = at;
            post({ type: "stage", sec: s.file, stage: ORDER[at], speed: speedRef.current });
          }
          s.pos++;
        }
        if (s.pos !== before) {
          if (ORDER[s.stage] === "text" && file.textTotal > 0) {
            const typed = s.pos < file.code.length ? file.textBefore[s.pos] : file.textTotal;
            post({ type: "text", sec: s.file, p: typed / file.textTotal });
          }
          setView({ file: s.file, pos: s.pos });
        }
        if (s.pos >= file.code.length) {
          post({ type: "stage", sec: s.file, stage: "done", speed: speedRef.current });
          Object.assign(s, { phase: "end", wait: 0, budget: 0 });
        }
        return;
      }

      s.wait += dt;
      if (s.wait < SECTION_END_WAIT_MS) return;
      if (s.file + 1 < prepared.length) {
        Object.assign(s, { file: s.file + 1, pos: 0, phase: "enter", wait: 0, stage: -1 });
        setView({ file: s.file, pos: 0 });
      } else {
        post({ type: "finish" });
        setStatus("done");
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [files, prepared, post]);

  /** Jump to the finished page — every file written, the preview whole. */
  const skip = useCallback(() => {
    const lastFile = prepared.length - 1;
    Object.assign(play.current, { file: lastFile, pos: prepared[lastFile].code.length, phase: "end" });
    setView({ file: lastFile, pos: prepared[lastFile].code.length });
    post({ type: "finish" });
    setStatus("done");
  }, [prepared, post]);

  const total = prepared.reduce((sum, f) => sum + f.code.length, 0);
  const done = prepared.slice(0, view.file).reduce((sum, f) => sum + f.code.length, 0) + view.pos;
  const progress = status === "done" ? 1 : total ? done / total : 0;

  return {
    status,
    view,
    progress,
    pause: () => setStatus((s) => (s === "playing" ? "paused" : s)),
    resume: () => setStatus((s) => (s === "paused" ? "playing" : s)),
    skip,
  };
}
