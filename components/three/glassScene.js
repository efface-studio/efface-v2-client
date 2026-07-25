import * as THREE from "three";

/**
 * Live "glass squares" logo scene — ported 1:1 from the source embed and wrapped
 * so React can mount it onto a <canvas> and tear it down cleanly. Being WebGL it
 * renders at the display's own resolution, so it stays crisp at any screen size
 * (unlike a fixed-resolution video). Kept as plain JS on purpose: the three.js
 * setup is untyped and doesn't need to pass tsc.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ still?: boolean }} [options] `still` renders a single locked-up
 *   frame instead of animating — the reduced-motion fallback.
 * @returns {() => void} dispose
 */
export function createGlassScene(canvas, options) {
  const still = !!(options && options.still);
  // ---- Loop timing: gather -> full 360° spin -> settle -> drift apart => seamless loop ----
  const PERIOD = 11.0;
  // Phase where the cards sit gathered in the lock-up pose — used for the
  // reduced-motion still frame.
  const STILL_PHASE = 0.15;

  // ---- Card geometry: rounded, beveled square slab ----
  function roundedRectShape(w, h, r) {
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

  // ---- Canvas texture helpers ----
  function radialTexture(inner, outer, size) {
    size = size || 256;
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const ctx = cv.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, inner);
    g.addColorStop(1, outer);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function backgroundTexture() {
    const w = 1024,
      h = 1024;
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d");
    const vg = ctx.createLinearGradient(0, 0, 0, h);
    vg.addColorStop(0.0, "#0a0b0f");
    vg.addColorStop(0.42, "#101319");
    vg.addColorStop(0.72, "#0c0e13");
    vg.addColorStop(1.0, "#08090c");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    function blob(cx, cy, r, sx, sy, color) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sx, sy);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(11,12,16,0)");
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, 2 * r, 2 * r);
      ctx.restore();
    }
    // Studio lighting baked across the WHOLE frame (this texture is the entire
    // backdrop now — there is no floor mesh). Broad sweep in from the left,
    // gentle spill through the middle, and a faint bounce along the bottom so
    // the lower half never goes flat black. All static: the shaft that used to
    // travel with the logo is gone for good.
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

  const renderer = new THREE.WebGLRenderer({
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
  function buildEnv(ry, rz) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const es = new THREE.Scene();
    // smooth diagonal-gradient dome: every reflection angle samples a soft light-to-dark 45° sweep
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 512;
    const cx = cv.getContext("2d");
    const g = cx.createLinearGradient(1024, 0, 200, 512);
    g.addColorStop(0, "#14171d");
    g.addColorStop(0.26, "#1a1e26");
    g.addColorStop(0.31, "#cdd4e0");
    g.addColorStop(0.37, "#aab3c1");
    g.addColorStop(0.44, "#12151b");
    g.addColorStop(1, "#030405");
    cx.fillStyle = g;
    cx.fillRect(0, 0, 1024, 512);
    // limit the bright band to the longitude sector the rest-pose reflections sample;
    // other spin angles see it dimmed (no silver wash mid-rotation)
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
    const domeTex = new THREE.CanvasTexture(cv);
    domeTex.colorSpace = THREE.SRGBColorSpace;
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(18, 48, 32),
      new THREE.MeshBasicMaterial({ map: domeTex, side: THREE.BackSide })
    );
    dome.material.color.setScalar(2.6);
    dome.rotation.y = ry;
    dome.rotation.z = rz === undefined ? -0.3 : rz; // tilt -> 45° sweep boundary like the source
    es.add(dome);
    const P = (w, h, s, pos, rot) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
      );
      m.material.color.setScalar(s);
      m.position.set(pos[0], pos[1], pos[2]);
      m.rotation.set(rot[0], rot[1], rot[2]);
      es.add(m);
    };
    P(10, 3, 7.0, [0, 9, 1], [Math.PI / 2, 0, 0.2]); // ceiling strip -> top rim light
    P(10, 2, 1.5, [0, -8, 3], [-Math.PI / 2, 0, 0]); // floor bounce -> lower bevels
    P(2, 12, 2.0, [11, 1, 0], [0, -Math.PI / 2, 0]); // right strip (dim -> dark right edges)
    P(2, 12, 7.5, [-11, 1, -1], [0, Math.PI / 2, 0]); // left chrome strip (bright edge light)
    P(0.8, 9, 7.0, [6.5, 4, 8], [0, Math.PI, -0.15]); // sharp vertical glint
    scene.environment = pmrem.fromScene(es, 0.02).texture;
    pmrem.dispose();
  }
  buildEnv(2.5, 0.6);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
  camera.position.set(0, 0.6, 12.2);

  // ---- Materials ----
  const darkGlass = new THREE.MeshPhysicalMaterial({
    color: 0xaab2be,
    metalness: 0,
    roughness: 0.02,
    transmission: 0.94,
    ior: 1.52,
    thickness: 0.3,
    attenuationColor: new THREE.Color(0x232c3f),
    attenuationDistance: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 2.4,
    specularIntensity: 1.0,
    reflectivity: 0.6,
  });
  const blueGloss = new THREE.MeshPhysicalMaterial({
    color: 0x2b64f6,
    metalness: 0,
    roughness: 0.09,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.15,
    emissive: 0x0e37a0,
    emissiveIntensity: 0.2,
  });
  // ---- Cards: two THICK smoked-clear glass plates (same material) + one chunky blue slab ----
  const thinGeo = new THREE.ExtrudeGeometry(roundedRectShape(2.0, 2.0, 0.44), {
    depth: 0.2,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 5,
    curveSegments: 36,
  });
  thinGeo.center();
  const thickGeo = new THREE.ExtrudeGeometry(roundedRectShape(2.0, 2.0, 0.44), {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 6,
    curveSegments: 36,
  });
  thickGeo.center();

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
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.lookAt(0.4, -0.15, 0);
  }

  // ---- Animate: explode -> gather(pop) -> 360° spin + weave/trade -> settle -> re-explode ----
  const TAU = Math.PI * 2;
  const sm = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const bell = (c, wd, x) => Math.exp(-0.5 * ((x - c) / wd) * ((x - c) / wd));

  function computeLayout(p) {
    const sep = 1 - sm(0.018, 0.11, p) + sm(0.918, 0.986, p); // 1 apart -> 0 gathered (hold ~1s) -> 1 apart
    const w = sm(0.236, 0.364, p) * (1 - sm(0.727, 0.855, p)); // weave envelope (mid-spin)
    const psi = TAU * sm(0.255, 0.836, p); // one full weave cycle
    const yaw = -0.09 - sm(0.2, 0.909, p) * TAU; // exactly one revolution -> seamless
    const s = Math.sin(psi),
      c1 = 1 - Math.cos(psi);
    return {
      sep,
      w,
      psi,
      yaw,
      dark: {
        x: -0.1 - 0.15 * sep + w * (0.85 * s + 0.15 * c1),
        y: 0.1 + 1.0 * sep + w * (0.15 * c1 + 0.25 * s),
        z: -0.4 - 0.3 * sep + w * (-0.2 - 0.35 * s * s),
        rx: -0.1 * sep + w * 0.03 * Math.sin(psi + 1.0),
        ry: w * 0.05 * Math.sin(psi + 0.4),
        rz: 0.08 * sep + w * 0.025 * Math.sin(2 * psi + 0.5),
      },
      clear: {
        x: 0.06 - 0.08 * sep + w * (-0.45 * s - 0.1 * c1),
        y: -0.04 + 0.12 * sep + w * 0.18 * Math.sin(2 * psi),
        z: 0.4 + 0.25 * sep + w * (0.2 + 0.35 * s * s),
        rx: 0.06 * sep + w * 0.03 * Math.sin(psi + 3.1),
        ry: w * 0.05 * Math.sin(psi + 2.5),
        rz: -0.05 * sep + w * 0.025 * Math.sin(2 * psi + 2.6),
      },
      blue: {
        x: 0.55 + 0.15 * sep + w * (-0.75 * s + 0.18 * c1),
        y: -0.42 - 0.5 * sep + w * (-0.6 * s),
        z: 0,
        rx: 0.05 * sep + w * 0.03 * Math.sin(psi + 5.2),
        ry: w * 0.05 * Math.sin(psi + 4.6),
        rz: 0.04 * sep + w * 0.025 * Math.sin(2 * psi + 4.4),
      },
    };
  }

  function applyPhase(p) {
    const L = computeLayout(p);
    spinner.rotation.y = L.yaw;
    for (const [mesh, cd] of [
      [darkCard, L.dark],
      [clearCard, L.clear],
      [blueCard, L.blue],
    ]) {
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

  function tick() {
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
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      const mat = o.material;
      if (mat) {
        const mats = Array.isArray(mat) ? mat : [mat];
        for (const m of mats) {
          for (const key in m) {
            const v = m[key];
            if (v && v.isTexture) v.dispose();
          }
          m.dispose();
        }
      }
    });
    if (scene.background && scene.background.dispose) scene.background.dispose();
    if (scene.environment && scene.environment.dispose) scene.environment.dispose();
    // NOTE: only renderer.dispose() — never forceContextLoss() here. A remount
    // (React StrictMode in dev, HMR, route changes) reuses the same <canvas>, and
    // a force-lost context makes the next getContext() return null → three then
    // reads null.precision and throws on the second WebGLRenderer construction.
    renderer.dispose();
  };
}
