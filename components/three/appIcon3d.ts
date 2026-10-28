import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export interface AppIconOptions {
  /** URL of the brand glyph SVG to extrude onto the tile face. */
  src: string;
  /** Rendered square size in CSS pixels. */
  size?: number;
  /** Tile body colour. */
  color?: string;
  /** Resting rotation of the tile, in degrees. */
  rx?: number;
  ry?: number;
  rz?: number;
}

/** Style block SVGLoader stashes on each parsed path's `userData`. */
interface SvgPathUserData {
  node?: Element;
  style?: { fill?: string };
}

const readUserData = (userData: Record<string, unknown>): SvgPathUserData => userData;

/** Frees every geometry and material reachable from `root`. */
function disposeSceneGraph(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    obj.geometry?.dispose();
    const material: THREE.Material | THREE.Material[] = obj.material;
    for (const m of Array.isArray(material) ? material : [material]) m.dispose();
  });
}

/**
 * 3D app icon: a rounded-box "app tile" with the brand glyph extruded on top.
 * Ported 1:1 from the source `<app-icon-3d>` custom element — same camera,
 * lights, materials and extrude maths — but mounted by React instead of
 * customElements, and rendered once (it's a static image, no rAF loop).
 *
 * Returns a dispose function; call it on unmount.
 */
export function createAppIcon(container: HTMLElement, opts: AppIconOptions): () => void {
  const size = opts.size ?? 220;
  const color = opts.color ?? "#999999";
  const rx = opts.rx ?? 12;
  const ry = opts.ry ?? -22;
  const rz = opts.rz ?? 8;
  const src = opts.src;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(size, size);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.filter = "drop-shadow(0 30px 28px rgba(0,0,0,0.42))";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 10);
  cam.position.set(0, 0.02, 2.45);

  const group = new THREE.Group();
  scene.add(group);
  group.rotation.set(
    THREE.MathUtils.degToRad(rx),
    THREE.MathUtils.degToRad(ry),
    THREE.MathUtils.degToRad(rz)
  );

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.55,
  });
  group.add(new THREE.Mesh(new RoundedBoxGeometry(1, 1, 0.68, 12, 0.21), bodyMat));

  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-1.3, 1.7, 2.1);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(1.5, -0.5, 1.2);
  scene.add(fill);
  const back = new THREE.DirectionalLight(0xffffff, 0.9);
  back.position.set(0.5, 1.4, -1.6);
  scene.add(back);

  let disposed = false;
  const render = () => {
    if (!disposed) renderer.render(scene, cam);
  };
  render();

  if (src) {
    // Corner-rounding for the extruded glyph: Chaikin-style corner cutting on
    // the shape outline before extrusion, so hard SVG corners read as soft
    // plastic rather than knife edges.
    const round2 = (pts: THREE.Vector2[], iters: number, cap: number): THREE.Vector2[] => {
      let p = pts.filter((pt, i) => i === 0 || pt.distanceTo(pts[i - 1]) > 0.4);
      for (let k = 0; k < iters; k++) {
        const out: THREE.Vector2[] = [];
        const n = p.length;
        for (let i = 0; i < n; i++) {
          const a = p[i];
          const b = p[(i + 1) % n];
          const d = Math.max(a.distanceTo(b), 1e-6);
          const t1 = Math.min(0.25, cap / d);
          out.push(a.clone().lerp(b, t1), a.clone().lerp(b, 1 - t1));
        }
        p = out;
      }
      return p;
    };
    const soft = (sh: THREE.Shape): THREE.Shape => {
      const s2 = new THREE.Shape(round2(sh.getPoints(12), 2, 7));
      s2.holes = (sh.holes || []).map((h) => new THREE.Path(round2(h.getPoints(12), 2, 7)));
      return s2;
    };

    new SVGLoader().load(src, (data) => {
      if (disposed) return;
      try {
        const g = new THREE.Group();
        for (const p of data.paths) {
          const { style: st, node } = readUserData(p.userData);
          const fillStyle = st?.fill;
          if (!fillStyle || fillStyle === "none" || fillStyle.startsWith("url(")) continue;
          // `data-d` on each SVG node drives how far that piece is raised.
          const rise = Number(node?.getAttribute("data-d") ?? 14) * 1.2;
          const mat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color().setStyle(fillStyle),
            roughness: 0.3,
            metalness: 0,
            clearcoat: 0.5,
            clearcoatRoughness: 0.4,
          });
          // `createShapes` is marked deprecated upstream, but `toShapes()` uses a
          // different hole-winding heuristic — keep the call the glyphs were authored against.
          for (const sh of SVGLoader.createShapes(p)) {
            g.add(
              new THREE.Mesh(
                new THREE.ExtrudeGeometry(soft(sh), {
                  depth: rise * 0.25,
                  bevelEnabled: true,
                  bevelThickness: rise * 0.75,
                  bevelSize: Math.min(rise * 0.7, 14),
                  bevelSegments: 8,
                  curveSegments: 14,
                }),
                mat
              )
            );
          }
        }
        // Fit the glyph to the tile face and sit it on top (SVG y is flipped).
        const bb0 = new THREE.Box3().setFromObject(g);
        const sz = bb0.getSize(new THREE.Vector3());
        const k = 0.55 / Math.max(sz.x, sz.y);
        g.scale.set(k, -k, k);
        const bb = new THREE.Box3().setFromObject(g);
        const c = bb.getCenter(new THREE.Vector3());
        g.position.x -= c.x;
        g.position.y -= c.y;
        g.position.z += 0.335 - bb.min.z;
        group.add(g);
        render();
      } catch (err) {
        console.error("[appIcon3d] failed to build glyph", src, err);
      }
    });
  }

  return function dispose() {
    disposed = true;
    disposeSceneGraph(scene);
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}
