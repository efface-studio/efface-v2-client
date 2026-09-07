import * as THREE from "three";

/** 2D context or bust — every canvas here is created inline and can't be null. */
export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("[glassScene] 2D canvas context unavailable");
  return ctx;
}

/** Rounded, beveled square slab outline — the shape each glass card extrudes from. */
export function roundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Soft radial falloff, used as the additive bloom behind the mark. */
export function radialTexture(inner: string, outer: string, size = 256): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = context2d(cv);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * The whole hero backdrop, baked once. Studio lighting is painted across the
 * entire frame — there is no floor mesh, so a broad sweep in from the left, a
 * gentle spill through the middle and a faint bounce along the bottom are what
 * keep the lower half off flat black. All static: the shaft that used to travel
 * with the logo is gone for good.
 */
export function backgroundTexture(): THREE.CanvasTexture {
  const w = 1024,
    h = 1024;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = context2d(cv);
  const vg = ctx.createLinearGradient(0, 0, 0, h);
  vg.addColorStop(0.0, "#0a0b0f");
  vg.addColorStop(0.42, "#101319");
  vg.addColorStop(0.72, "#0c0e13");
  vg.addColorStop(1.0, "#08090c");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  const blob = (cx: number, cy: number, r: number, sx: number, sy: number, color: string) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(sx, sy);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(11,12,16,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-r, -r, 2 * r, 2 * r);
    ctx.restore();
  };

  blob(w * 0.1, h * 0.36, 460, 3.1, 0.55, "rgba(146,155,172,0.6)");
  blob(w * 0.02, h * 0.5, 380, 2.7, 0.44, "rgba(118,126,144,0.48)");
  blob(w * 0.42, h * 0.44, 400, 2.6, 0.34, "rgba(96,104,122,0.3)");
  blob(w * 0.78, h * 0.1, 340, 2.1, 0.8, "rgba(56,62,78,0.32)");
  // lower-half bounce + a cool blue pool under where the mark sits
  blob(w * 0.42, h * 0.86, 460, 3.0, 0.4, "rgba(46,54,74,0.42)");
  blob(w * 0.66, h * 0.8, 340, 2.0, 0.34, "rgba(38,72,150,0.26)");

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Environment dome map: a smooth diagonal gradient so every reflection angle
 * samples a soft light-to-dark 45° sweep. The multiply pass limits the bright
 * band to the longitude sector the rest-pose reflections sample, so other spin
 * angles see it dimmed — no silver wash mid-rotation.
 */
export function domeTexture(): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 512;
  const cx = context2d(cv);
  const g = cx.createLinearGradient(1024, 0, 200, 512);
  g.addColorStop(0, "#14171d");
  g.addColorStop(0.26, "#1a1e26");
  g.addColorStop(0.31, "#cdd4e0");
  g.addColorStop(0.37, "#aab3c1");
  g.addColorStop(0.44, "#12151b");
  g.addColorStop(1, "#030405");
  cx.fillStyle = g;
  cx.fillRect(0, 0, 1024, 512);

  cx.globalCompositeOperation = "multiply";
  const mk = cx.createLinearGradient(0, 0, 1024, 0);
  mk.addColorStop(0, "#343941");
  mk.addColorStop(0.5, "#343941");
  mk.addColorStop(0.58, "#ffffff");
  mk.addColorStop(0.85, "#ffffff");
  mk.addColorStop(0.93, "#343941");
  mk.addColorStop(1, "#343941");
  cx.fillStyle = mk;
  cx.fillRect(0, 0, 1024, 512);
  cx.globalCompositeOperation = "source-over";

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
