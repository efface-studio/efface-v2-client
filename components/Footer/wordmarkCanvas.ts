import { clamp } from "@/lib/motion";
import { DISPLAY, WORDMARK_DIM, WORDMARK_GRADIENT } from "./Footer.constants";

/** Cursor sample the painter reveals the bright wordmark along. */
export interface PointerSample {
  x: number;
  y: number;
  /** `performance.now()` of the last real move — stale samples fall back to drift. */
  t: number;
}

export interface WordmarkPainter {
  /** (Re)builds the offscreen layers at the canvas's current box size. */
  setup(): void;
  /** Advances the trail and composites one frame. */
  paint(pointer: PointerSample, now: number): void;
}

const WORD = "EFFACE";

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("[wordmarkCanvas] 2D context unavailable");
  return ctx;
}

/**
 * The oversized footer wordmark. Three offscreen layers do the work: a dim copy
 * that is always visible, a gradient copy, and a trail mask that reveals the
 * gradient only where the cursor has swept. With reduced motion the trail is
 * filled solid once, so the wordmark simply reads in full colour.
 */
export function createWordmarkPainter(
  canvas: HTMLCanvasElement,
  reduced: boolean
): WordmarkPainter {
  let cw = 0;
  let ch = 0;
  let ctx: CanvasRenderingContext2D | null = null;
  let trail: HTMLCanvasElement;
  let work: HTMLCanvasElement;
  let dimSrc: HTMLCanvasElement;
  let brightSrc: HTMLCanvasElement;

  const setup = () => {
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
      context2d(cv).setTransform(dpr, 0, 0, dpr, 0, 0);
      return cv;
    };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx = context2d(canvas);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    trail = mk();
    work = mk();
    dimSrc = mk();
    brightSrc = mk();

    // Draw the word stretched edge to edge, filled and stroked so the strokes
    // thicken the letterforms rather than outlining them.
    const fitDraw = (cv: HTMLCanvasElement, fill: string | CanvasGradient) => {
      const x = context2d(cv);
      const fs = h * 1.04;
      x.font = `700 ${fs}px ${DISPLAY}`;
      const tw = Math.max(1, x.measureText(WORD).width);
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
      x.fillText(WORD, w / sx / 2, h * 0.56);
      x.strokeText(WORD, w / sx / 2, h * 0.56);
      x.restore();
    };
    fitDraw(dimSrc, WORDMARK_DIM);
    const g = context2d(brightSrc).createLinearGradient(0, 0, w, 0);
    for (const [stop, color] of WORDMARK_GRADIENT) g.addColorStop(stop, color);
    fitDraw(brightSrc, g);
    if (reduced) {
      const tc = context2d(trail);
      tc.fillStyle = "#fff";
      tc.fillRect(0, 0, w, h);
    }
  };

  const paint = (pointer: PointerSample, now: number) => {
    if (!ctx) return;
    if (canvas.clientWidth && canvas.clientWidth !== cw) setup();
    if (!ctx) return;
    const r = canvas.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -80 || r.top > vh + 80) return;

    const tctx = context2d(trail);
    if (!reduced) {
      // fade the trail out slowly so the sweep leaves a tail
      tctx.save();
      tctx.globalCompositeOperation = "destination-out";
      tctx.globalAlpha = 0.05;
      tctx.fillStyle = "#000";
      tctx.fillRect(0, 0, cw, ch);
      tctx.restore();

      // Drift on its own; hand over to the cursor while it is recent and near.
      const time = now / 1000;
      let px = cw * (0.5 + 0.44 * Math.sin(time * 0.32));
      let py = ch * (0.5 + 0.14 * Math.sin(time * 1.05));
      if (
        now - pointer.t < 1400 &&
        pointer.x >= r.left &&
        pointer.x <= r.right &&
        pointer.y >= r.top - 50 &&
        pointer.y <= r.bottom + 50
      ) {
        px = pointer.x - r.left;
        py = clamp(pointer.y - r.top, -10, ch + 10);
      }
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

    // bright copy, masked down to wherever the trail has been
    const wctx = context2d(work);
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

  return { setup, paint };
}
