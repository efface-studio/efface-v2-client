"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Ink-in-water background, ported from the efface design system
 * (`efface-component/src/components/fx/FluidInk.tsx`): Stam's stable fluids on
 * the GPU — advect → divergence → pressure (Jacobi) → subtract gradient.
 *
 * Differences from the design-system version:
 *  - An invisible brush wanders on its own, so the ink keeps moving untouched.
 *  - The pointer is read from `window` (anywhere over the canvas's box), so
 *    it still stirs the ink over the content layered on top. When it leaves,
 *    the brush carries on from where the pointer was instead of jumping.
 *  - The simulation sleeps while the canvas is off-screen.
 * Reduced motion, or no half-float render targets: nothing is drawn.
 */

const VERT = `
attribute vec2 p; varying vec2 uv; varying vec2 L, R, T, B; uniform vec2 texel;
void main(){ uv = p*0.5+0.5; L = uv - vec2(texel.x,0.); R = uv + vec2(texel.x,0.); T = uv + vec2(0.,texel.y); B = uv - vec2(0.,texel.y); gl_Position = vec4(p,0.,1.); }`;
const SPLAT = `
precision highp float; varying vec2 uv; uniform sampler2D target; uniform float aspect; uniform vec3 color; uniform vec2 point; uniform float radius;
void main(){ vec2 d = uv - point; d.x *= aspect; vec3 splat = exp(-dot(d,d)/radius) * color; vec3 base = texture2D(target, uv).xyz; gl_FragColor = vec4(base + splat, 1.); }`;
const ADVECT = `
precision highp float; varying vec2 uv; uniform sampler2D velocity; uniform sampler2D source; uniform vec2 texel; uniform float dt; uniform float dissipation;
void main(){ vec2 coord = uv - dt * texture2D(velocity, uv).xy * texel; gl_FragColor = dissipation * texture2D(source, coord); gl_FragColor.a = 1.; }`;
const DIVERGENCE = `
precision mediump float; varying vec2 uv, L, R, T, B; uniform sampler2D velocity;
void main(){ float l = texture2D(velocity,L).x, r = texture2D(velocity,R).x, t = texture2D(velocity,T).y, b = texture2D(velocity,B).y; vec2 c = texture2D(velocity,uv).xy;
 if (L.x < 0.) l = -c.x; if (R.x > 1.) r = -c.x; if (T.y > 1.) t = -c.y; if (B.y < 0.) b = -c.y; gl_FragColor = vec4(0.5*(r-l+t-b),0.,0.,1.); }`;
const PRESSURE = `
precision mediump float; varying vec2 uv, L, R, T, B; uniform sampler2D pressure; uniform sampler2D divergence;
void main(){ float l = texture2D(pressure,L).x, r = texture2D(pressure,R).x, t = texture2D(pressure,T).x, b = texture2D(pressure,B).x; float d = texture2D(divergence,uv).x; gl_FragColor = vec4((l+r+b+t-d)*0.25,0.,0.,1.); }`;
const GRADIENT = `
precision mediump float; varying vec2 uv, L, R, T, B; uniform sampler2D pressure; uniform sampler2D velocity;
void main(){ float l = texture2D(pressure,L).x, r = texture2D(pressure,R).x, t = texture2D(pressure,T).x, b = texture2D(pressure,B).x; vec2 v = texture2D(velocity,uv).xy; v -= vec2(r-l, t-b); gl_FragColor = vec4(v,0.,1.); }`;
const DISPLAY = `
precision highp float; varying vec2 uv; uniform sampler2D dye; uniform vec3 bg;
void main(){ vec3 c = texture2D(dye, uv).rgb; float a = clamp(max(c.r, max(c.g, c.b)), 0., 1.); gl_FragColor = vec4(mix(bg, c, a), 1.); }`;
const CLEAR = `precision mediump float; varying vec2 uv; uniform sampler2D target; uniform float value; void main(){ gl_FragColor = value * texture2D(target, uv); }`;

interface FBO {
  fb: WebGLFramebuffer;
  tex: WebGLTexture;
  w: number;
  h: number;
  texel: [number, number];
}
interface DoubleFBO {
  read: FBO;
  write: FBO;
  swap: () => void;
}
type RGB = [number, number, number];

const DEFAULT_COLORS = ["#3b62e5", "#14b8b0", "#7c3aed", "#f59e0b", "#2563eb"];
/** Brush speed while wandering, in canvas widths per second. */
const WANDER_SPEED = 0.3;
/** Force the wandering brush puts into the fluid, comparable to a brisk hand. */
const WANDER_FORCE = 120;
/** Ink the wandering brush lays per frame. It splats every frame, so much less
 *  than a pointer splat (0.3) — more and it pools into one blob. */
const WANDER_INK = 0.08;
/** Canvas opacity while only the wandering brush is drawing; a hand brings it
 *  up to full. */
const IDLE_OPACITY = 0.45;
/** Ink per pointer splat. */
const POINTER_INK = 0.3;
/** A real pointer counts as "here" for this long after its last move (ms). */
const POINTER_HOLD_MS = 900;
/** The wandering brush switches ink colour this often (ms). */
const COLOR_EVERY_MS = 2600;

const hexToRgb01 = (hex: string): RGB => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const cssColorToRgb01 = (css: string): RGB => {
  const m = css.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [m[0] / 255, m[1] / 255, m[2] / 255];
};

export default function FluidInk({ colors = DEFAULT_COLORS, className }: { colors?: string[]; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const host = canvas.parentElement ?? canvas;
    const attrs = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    // WebGL2 renders to half-float almost everywhere (Safari included); else WebGL1 + extensions.
    const gl2 = canvas.getContext("webgl2", attrs) as WebGL2RenderingContext | null;
    const gl = (gl2 ?? canvas.getContext("webgl", attrs)) as WebGLRenderingContext | null;
    if (!gl) return;
    let HALF: number;
    let INTERNAL: number;
    if (gl2) {
      gl2.getExtension("EXT_color_buffer_half_float");
      gl2.getExtension("EXT_color_buffer_float");
      HALF = gl2.HALF_FLOAT;
      INTERNAL = gl2.RGBA16F;
    } else {
      const half = gl.getExtension("OES_texture_half_float");
      const linear = gl.getExtension("OES_texture_half_float_linear");
      if (!half || !linear) return;
      HALF = half.HALF_FLOAT_OES;
      INTERNAL = gl.RGBA;
    }
    const palette = colors.map(hexToRgb01);
    const colorAt = (i: number): RGB => palette[i % palette.length] ?? [0.2, 0.4, 1];

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) throw new Error("shader");
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.warn("[FluidInk] shader", gl.getShaderInfoLog(sh));
      return sh;
    };
    const vert = compile(gl.VERTEX_SHADER, VERT);
    const program = (frag: string) => {
      const p = gl.createProgram();
      if (!p) throw new Error("program");
      gl.attachShader(p, vert);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(p);
      const uniforms: Record<string, WebGLUniformLocation | null> = Object.create(null);
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        if (info) uniforms[info.name] = gl.getUniformLocation(p, info.name);
      }
      return { p, u: (name: string) => uniforms[name] ?? null };
    };
    const P = {
      splat: program(SPLAT),
      advect: program(ADVECT),
      div: program(DIVERGENCE),
      pressure: program(PRESSURE),
      grad: program(GRADIENT),
      display: program(DISPLAY),
      clear: program(CLEAR),
    };

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const fbo = (w: number, h: number): FBO => {
      const tex = gl.createTexture();
      const fb = gl.createFramebuffer();
      if (!tex || !fb) throw new Error("fbo");
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, INTERNAL, w, h, 0, gl.RGBA, HALF, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("fbo incomplete");
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { fb, tex, w, h, texel: [1 / w, 1 / h] };
    };
    const dfbo = (w: number, h: number): DoubleFBO => {
      const d = { read: fbo(w, h), write: fbo(w, h), swap() {} };
      d.swap = () => {
        const t = d.read;
        d.read = d.write;
        d.write = t;
      };
      return d;
    };
    const bind = (f: FBO, unit: number) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, f.tex);
      return unit;
    };
    const blit = (target: FBO | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
        gl.viewport(0, 0, target.w, target.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    let velocity: DoubleFBO | null = null;
    let dye: DoubleFBO | null = null;
    let divergence: FBO | null = null;
    let pressure: DoubleFBO | null = null;
    let bg: RGB = [0, 0, 0];

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      const aspect = canvas.width / canvas.height;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const sim = coarse ? 80 : 112;
      const dyeRes = coarse ? 256 : 384;
      const simW = aspect > 1 ? Math.round(sim * aspect) : sim;
      const simH = aspect > 1 ? sim : Math.round(sim / aspect);
      const dyeW = aspect > 1 ? Math.round(dyeRes * aspect) : dyeRes;
      const dyeH = aspect > 1 ? dyeRes : Math.round(dyeRes / aspect);
      try {
        velocity = dfbo(simW, simH);
        dye = dfbo(dyeW, dyeH);
        divergence = fbo(simW, simH);
        pressure = dfbo(simW, simH);
      } catch {
        // No usable half-float render target: leave the plain background.
        velocity = dye = pressure = null;
        divergence = null;
        return;
      }
      bg = cssColorToRgb01(getComputedStyle(host).backgroundColor);
    };

    const splat = (x: number, y: number, dx: number, dy: number, color: RGB, ink = POINTER_INK) => {
      if (!velocity || !dye) return;
      gl.useProgram(P.splat.p);
      gl.uniform1i(P.splat.u("target"), bind(velocity.read, 0));
      gl.uniform1f(P.splat.u("aspect"), canvas.width / canvas.height);
      gl.uniform2f(P.splat.u("point"), x, y);
      gl.uniform3f(P.splat.u("color"), dx, dy, 0);
      gl.uniform1f(P.splat.u("radius"), 0.0025);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(P.splat.u("target"), bind(dye.read, 0));
      gl.uniform3f(P.splat.u("color"), color[0] * ink, color[1] * ink, color[2] * ink);
      blit(dye.write);
      dye.swap();
    };

    const step = (dt: number) => {
      if (!velocity || !dye || !divergence || !pressure) return;
      gl.disable(gl.BLEND);
      gl.useProgram(P.advect.p);
      gl.uniform2f(P.advect.u("texel"), ...velocity.read.texel);
      gl.uniform1i(P.advect.u("velocity"), bind(velocity.read, 0));
      gl.uniform1i(P.advect.u("source"), 0);
      gl.uniform1f(P.advect.u("dt"), dt);
      gl.uniform1f(P.advect.u("dissipation"), 0.985);
      blit(velocity.write);
      velocity.swap();
      gl.uniform1i(P.advect.u("velocity"), bind(velocity.read, 0));
      gl.uniform1i(P.advect.u("source"), bind(dye.read, 1));
      gl.uniform1f(P.advect.u("dissipation"), 0.992);
      blit(dye.write);
      dye.swap();
      gl.useProgram(P.div.p);
      gl.uniform2f(P.div.u("texel"), ...velocity.read.texel);
      gl.uniform1i(P.div.u("velocity"), bind(velocity.read, 0));
      blit(divergence);
      gl.useProgram(P.clear.p);
      gl.uniform1i(P.clear.u("target"), bind(pressure.read, 0));
      gl.uniform1f(P.clear.u("value"), 0.8);
      blit(pressure.write);
      pressure.swap();
      gl.useProgram(P.pressure.p);
      gl.uniform2f(P.pressure.u("texel"), ...velocity.read.texel);
      gl.uniform1i(P.pressure.u("divergence"), bind(divergence, 0));
      for (let i = 0; i < 16; i++) {
        gl.uniform1i(P.pressure.u("pressure"), bind(pressure.read, 1));
        blit(pressure.write);
        pressure.swap();
      }
      gl.useProgram(P.grad.p);
      gl.uniform2f(P.grad.u("texel"), ...velocity.read.texel);
      gl.uniform1i(P.grad.u("pressure"), bind(pressure.read, 0));
      gl.uniform1i(P.grad.u("velocity"), bind(velocity.read, 1));
      blit(velocity.write);
      velocity.swap();
      gl.useProgram(P.display.p);
      gl.uniform1i(P.display.u("dye"), bind(dye.read, 0));
      gl.uniform3f(P.display.u("bg"), ...bg);
      blit(null);
    };

    // The brush: follows the pointer while it's over the canvas, otherwise
    // wanders from wherever it is — so leaving hands over without a jump.
    const brush = { x: 0.5, y: 0.5, heading: Math.random() * Math.PI * 2 };
    const pointer = { x: 0, y: 0, t: -Infinity };
    let ci = 0;
    let lastColorAt = performance.now();

    const wander = (dt: number, now: number) => {
      const time = now / 1000;
      // Turn slowly and a little erratically; steer back in near the edges.
      brush.heading += (Math.sin(time * 0.7) + Math.sin(time * 1.9 + 1.3)) * 0.9 * dt;
      const edge = Math.max(Math.abs(brush.x - 0.5), Math.abs(brush.y - 0.5)) * 2;
      if (edge > 0.7) {
        const toCentre = Math.atan2(0.5 - brush.y, 0.5 - brush.x);
        const diff = Math.atan2(Math.sin(toCentre - brush.heading), Math.cos(toCentre - brush.heading));
        brush.heading += diff * Math.min(1, (edge - 0.7) * 6) * dt * 3;
      }
      const ux = Math.cos(brush.heading);
      const uy = Math.sin(brush.heading);
      brush.x += ux * WANDER_SPEED * dt;
      brush.y += uy * WANDER_SPEED * (canvas.width / canvas.height) * dt;
      if (now - lastColorAt > COLOR_EVERY_MS) {
        ci++;
        lastColorAt = now;
      }
      splat(brush.x, brush.y, ux * WANDER_FORCE, uy * WANDER_FORCE, colorAt(ci), WANDER_INK);
    };

    const toCanvas = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      return x < 0 || x > 1 || y < 0 || y > 1 ? null : { x, y };
    };
    const onMove = (e: PointerEvent) => {
      const at = toCanvas(e);
      if (!at) return;
      const now = performance.now();
      if (now - pointer.t < POINTER_HOLD_MS) {
        const dx = (at.x - pointer.x) * 6000;
        const dy = (at.y - pointer.y) * 6000;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) splat(at.x, at.y, dx, dy, colorAt(ci));
        // Point the brush the way the hand is going, for the handover.
        if (Math.abs(dx) + Math.abs(dy) > 2) brush.heading = Math.atan2(dy, dx);
      } else {
        ci++;
      }
      pointer.x = brush.x = at.x;
      pointer.y = brush.y = at.y;
      pointer.t = now;
    };
    const onDown = (e: PointerEvent) => {
      const at = toCanvas(e);
      if (!at) return;
      ci++;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        splat(at.x, at.y, Math.cos(a) * 900, Math.sin(a) * 900, colorAt(ci));
      }
    };

    let raf = 0;
    let last = performance.now();
    let handOn: boolean | null = null;
    canvas.style.transition = "opacity 1.2s ease";
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.016, (now - last) / 1000);
      last = now;
      const hand = now - pointer.t <= POINTER_HOLD_MS;
      if (hand !== handOn) {
        // Quiet on its own; full strength while someone is stirring it.
        handOn = hand;
        canvas.style.opacity = String(hand ? 1 : IDLE_OPACITY);
      }
      if (!hand) wander(dt, now);
      step(dt);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    for (let i = 0; i < 4; i++) {
      splat(
        0.2 + Math.random() * 0.6,
        0.3 + Math.random() * 0.4,
        (Math.random() - 0.5) * 1500,
        (Math.random() - 0.5) * 1500,
        colorAt(i)
      );
    }

    // Only simulate while on screen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry?.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0);
    };
  }, [colors, reduce]);

  return (
    <div aria-hidden className={cn("pointer-events-none h-full w-full bg-bg", className)}>
      <canvas ref={ref} className="block" />
    </div>
  );
}
