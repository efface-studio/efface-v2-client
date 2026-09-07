import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Conditional class composition. `clsx` resolves the conditionals, `twMerge`
 * drops Tailwind classes that a later one overrides — so a caller can pass
 * `className="px-8"` to a component whose base is `px-6` and actually win.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
