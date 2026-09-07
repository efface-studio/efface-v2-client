import type { LogoMarkProps } from "./LogoMark.types";

/** efface mark — two overlapping rounded squares (light back, blue front). */
export default function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.6" fill="currentColor" />
      <rect x="13.5" y="13.5" width="13" height="13" rx="3.6" fill="#3b62e5" />
    </svg>
  );
}
