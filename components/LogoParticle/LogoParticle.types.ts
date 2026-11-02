export interface LogoParticleProps {
  className?: string;
}

export interface ParticleLogoProps {
  /** Image (svg/png) to sample — opaque pixels become particles. Saturated
   *  pixels take the accent colour, neutral ones the host's text colour. */
  src: string;
  /** Spacing between particles (px). Smaller is denser and heavier. */
  gap?: number;
  /** Radius (px) the pointer pushes particles away within. */
  radius?: number;
  /** Logo height as a share of the box height. */
  scale?: number;
  className?: string;
}

export interface AuroraProps {
  /** Glow colours, one drifting blob each. */
  colors: string[];
  /** How strongly the nearest blob leans toward the pointer (0 turns it off). */
  attract?: number;
  className?: string;
}

export interface GhostPointerProps {
  active: boolean;
  /** Press now and then. */
  click?: boolean;
  /** Seconds between presses. Defaults to a random 2.2–4.2. */
  clickEvery?: number;
  speed?: number;
  className?: string;
}
