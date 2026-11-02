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
