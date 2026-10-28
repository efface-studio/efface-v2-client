import { smoothstep } from "@/lib/motion";

/** Position + rotation of one glass card at a point on the loop. */
export interface CardPose {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

export interface SceneLayout {
  /** 1 = cards drifted apart, 0 = gathered into the lock-up. */
  sep: number;
  /** Weave envelope — how much the cards trade places mid-spin. */
  w: number;
  /** Weave phase angle. */
  psi: number;
  /** Spinner yaw; travels exactly one revolution so the loop is seamless. */
  yaw: number;
  dark: CardPose;
  clear: CardPose;
  blue: CardPose;
}

export const TAU = Math.PI * 2;

/** Gaussian bump — the impact accent when the cards lock together. */
export const bell = (c: number, wd: number, x: number): number =>
  Math.exp(-0.5 * ((x - c) / wd) * ((x - c) / wd));

/**
 * The whole loop as a pure function of phase `p` (0→1):
 * explode → gather (pop) → 360° spin with a weave → settle → re-explode.
 */
export function computeLayout(p: number): SceneLayout {
  const sep = 1 - smoothstep(0.018, 0.11, p) + smoothstep(0.918, 0.986, p);
  const w = smoothstep(0.236, 0.364, p) * (1 - smoothstep(0.727, 0.855, p));
  const psi = TAU * smoothstep(0.255, 0.836, p); // one full weave cycle
  const yaw = -0.09 - smoothstep(0.2, 0.909, p) * TAU; // exactly one revolution
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
