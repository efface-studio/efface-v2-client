import * as THREE from "three";
import { roundedRectShape } from "./glassTextures";

/** Smoked-clear glass — high transmission, tight clearcoat, strong env reflections. */
export function darkGlassMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
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
}

/** The opaque blue slab — glossy, barely reflective, faintly emissive. */
export function blueGlossMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0x2b64f6,
    metalness: 0,
    roughness: 0.09,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.15,
    emissive: 0x0e37a0,
    emissiveIntensity: 0.2,
  });
}

/** Card slab, centred on its own origin so it rotates about its middle. */
function cardGeometry(depth: number, bevel: number, bevelSegments: number) {
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(2.0, 2.0, 0.44), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments,
    curveSegments: 36,
  });
  geo.center();
  return geo;
}

/** The two glass plates share this thinner slab. */
export const thinCardGeometry = () => cardGeometry(0.2, 0.06, 5);
/** The blue slab is chunkier, with a softer bevel. */
export const thickCardGeometry = () => cardGeometry(0.3, 0.05, 6);
