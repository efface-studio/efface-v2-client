import type { ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  /** Seconds to hold before the reveal starts — stagger a list by index. */
  delay?: number;
  /** Distance in px the content rises from. */
  y?: number;
  className?: string;
}
