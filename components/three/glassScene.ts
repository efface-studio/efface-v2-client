import * as THREE from "three";
import { bell, computeLayout, TAU, type CardPose } from "./glassLayout";
import {
  blueGlossMaterial,
  darkGlassMaterial,
  thickCardGeometry,
  thinCardGeometry,
} from "./glassMaterials";
import { backgroundTexture, domeTexture, radialTexture } from "./glassTextures";

export interface GlassSceneOptions {
  /** Render a single locked-up frame instead of animating — reduced-motion fallback. */
  still?: boolean;
}

/** three's WebGLRenderer gained this knob late; treat it as optional. */
type TransmissionAwareRenderer = THREE.WebGLRenderer & {
  transmissionResolutionScale?: number;
};

/** Seconds one full loop takes. */
const PERIOD = 11.0;
/** Phase where the cards sit gathered in the lock-up pose — the still frame. */
const STILL_PHASE = 0.15;

/**
 * Live "glass squares" logo scene — ported 1:1 from the source embed and wrapped
 * so React can mount it onto a <canvas> and tear it down cleanly. Being WebGL it
 * renders at the display's own resolution, so it stays crisp at any screen size
 * (unlike a fixed-resolution video).
 *
 * Returns a dispose function; call it on unmount.
 */
export function createGlassScene(
  canvas: HTMLCanvasElement,
  options?: GlassSceneOptions
): () => void {
  const still = !!options?.still;

  const renderer: TransmissionAwareRenderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  if ("transmissionResolutionScale" in renderer) renderer.transmissionResolutionScale = 0.5;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = backgroundTexture();

  /** Bakes the reflection environment: a gradient dome plus five light strips. */
  function buildEnv(ry: number, rz?: number): void {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const es = new THREE.Scene();
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(18, 48, 32),
      new THREE.MeshBasicMaterial({ map: domeTexture(), side: THREE.BackSide })
    );
    dome.material.color.setScalar(2.6);
    dome.rotation.y = ry;
    dome.rotation.z = rz === undefined ? -0.3 : rz; // tilt -> 45° sweep boundary like the source
    es.add(dome);

    const strip = (
      w: number,
      h: number,
      s: number,
      pos: readonly [number, number, number],
      rot: readonly [number, number, number]
    ): void => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
      );
      m.material.color.setScalar(s);
      m.position.set(pos[0], pos[1], pos[2]);
      m.rotation.set(rot[0], rot[1], rot[2]);
      es.add(m);
    };
    strip(10, 3, 7.0, [0, 9, 1], [Math.PI / 2, 0, 0.2]); // ceiling strip -> top rim light
    strip(10, 2, 1.5, [0, -8, 3], [-Math.PI / 2, 0, 0]); // floor bounce -> lower bevels
    strip(2, 12, 2.0, [11, 1, 0], [0, -Math.PI / 2, 0]); // right strip (dark right edges)
    strip(2, 12, 7.5, [-11, 1, -1], [0, Math.PI / 2, 0]); // left chrome strip (bright edge light)
    strip(0.8, 9, 7.0, [6.5, 4, 8], [0, Math.PI, -0.15]); // sharp vertical glint

    scene.environment = pmrem.fromScene(es, 0.02).texture;
    pmrem.dispose();
  }
  buildEnv(2.5, 0.6);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 0.6, 12.2);

  const darkGlass = darkGlassMaterial();
  const blueGloss = blueGlossMaterial();
  const thinGeo = thinCardGeometry();
  const thickGeo = thickCardGeometry();

  const darkCard = new THREE.Mesh(thinGeo, darkGlass);
  darkCard.name = "glassBack";
  const clearCard = new THREE.Mesh(thinGeo, darkGlass);
  clearCard.name = "glassFront";
  const blueCard = new THREE.Mesh(thickGeo, blueGloss);
  blueCard.name = "blueGloss";

  const spinner = new THREE.Group();
  spinner.add(darkCard, clearCard, blueCard);

  const pivot = new THREE.Group();
  pivot.add(spinner);
  pivot.rotation.z = 0.12; // slight roll -> diagonal lock-up like the source
  pivot.position.set(1.9, -0.05, 0); // nudged right + down
  scene.add(pivot);

  // ---- Lights ----
  const key = new THREE.DirectionalLight(0xffffff, 0.25);
  key.position.set(-4, 6, 6);
  const rim = new THREE.DirectionalLight(0xbcd2ff, 0.15);
  rim.position.set(6, 2, -4);
  const fill = new THREE.DirectionalLight(0xffffff, 0.15);
  fill.position.set(3, -2, 5);
  scene.add(key, rim, fill);

  // ---- Ambient glow ----
  // No floor plane and no contact shadow: a ground plane draws a hard horizon
  // across the middle of the hero, leaving the lower half flat black. The
  // backdrop texture carries the whole frame instead, and this additive glow
  // sits behind the mark as a soft blue bloom.
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 3.5),
    new THREE.MeshBasicMaterial({
      map: radialTexture("rgba(34,96,230,0.26)", "rgba(34,96,230,0)"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.scale.set(3.4, 3.0, 1); // wide + soft so it reads as ambient bloom
  glow.position.set(2.0, -0.9, -4.0); // behind the cards, facing the camera
  scene.add(glow);

  // ---- Resize + framing (sized to the canvas box, not the whole window) ----
  function resize(): void {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.lookAt(0.4, -0.15, 0);
  }

  /** Poses everything for one point on the loop and renders a frame. */
  function applyPhase(p: number): void {
    const L = computeLayout(p);
    spinner.rotation.y = L.yaw;
    const posed: Array<[THREE.Mesh, CardPose]> = [
      [darkCard, L.dark],
      [clearCard, L.clear],
      [blueCard, L.blue],
    ];
    for (const [mesh, cd] of posed) {
      mesh.position.set(cd.x, cd.y, cd.z);
      mesh.rotation.set(cd.rx, cd.ry, cd.rz);
    }
    const pop = bell(0.123, 0.018, p); // impact accent when cards lock
    pivot.scale.setScalar(0.8);
    pivot.position.y = -0.05 + 0.05 * Math.sin(TAU * p); // gentle float (nudged down)
    pivot.rotation.z = 0.12 + 0.018 * Math.sin(TAU * 2 * p + 1.2); // gentle rock
    pivot.rotation.x = 0.05 * L.w * Math.sin(L.psi); // weave sway
    renderer.toneMappingExposure = 1.05 + 0.1 * pop;
    camera.position.set(0, 0.6 + 0.15 * L.w, 12.2 - 1.15 * L.w); // push in during the transform
    camera.lookAt(0.4, -0.15, 0);
    glow.material.color.setScalar(1 + 0.5 * L.w); // glow breathes with the weave
    renderer.render(scene, camera);
  }

  // ---- Lifecycle ----
  let rafId = 0;
  let paused = false;
  let disposed = false;
  let elapsed = 0;
  let last = performance.now();

  function tick(): void {
    if (disposed) return;
    rafId = requestAnimationFrame(tick);
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    if (paused) return; // keep time current but skip the (expensive) render
    elapsed += dt;
    applyPhase((elapsed % PERIOD) / PERIOD);
  }

  const ro = new ResizeObserver(() => {
    resize();
    if (still) applyPhase(STILL_PHASE); // keep the frozen frame correct on resize
  });
  ro.observe(canvas);
  resize();
  requestAnimationFrame(() => {
    resize(); // guard against a 0×0 first layout
    if (still) applyPhase(STILL_PHASE);
  });

  // Reduced motion: draw the locked-up pose once and never animate.
  if (still) {
    applyPhase(STILL_PHASE);
    return function disposeStill() {
      disposed = true;
      ro.disconnect();
      renderer.dispose();
    };
  }

  const onVis = () => {
    if (!disposed) paused = document.hidden;
  };
  document.addEventListener("visibilitychange", onVis);
  // Stop rendering while the hero is scrolled out of view.
  const io = new IntersectionObserver(
    (entries) => {
      if (!document.hidden) paused = !entries[0].isIntersecting;
    },
    { threshold: 0 }
  );
  io.observe(canvas);

  tick();

  return function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      obj.geometry?.dispose();
      const material: THREE.Material | THREE.Material[] = obj.material;
      for (const m of Array.isArray(material) ? material : [material]) {
        // Materials own their maps; drop those before the material itself.
        for (const value of Object.values(m as unknown as Record<string, unknown>)) {
          if (value instanceof THREE.Texture) value.dispose();
        }
        m.dispose();
      }
    });
    if (scene.background instanceof THREE.Texture) scene.background.dispose();
    scene.environment?.dispose();
    // NOTE: only renderer.dispose() — never forceContextLoss() here. A remount
    // (React StrictMode in dev, HMR, route changes) reuses the same <canvas>, and
    // a force-lost context makes the next getContext() return null → three then
    // reads null.precision and throws on the second WebGLRenderer construction.
    renderer.dispose();
  };
}
