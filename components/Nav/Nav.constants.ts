/** Overlay menu entries. `key` indexes into the `Nav.items` message namespace. */
export const NAV_ITEMS = [
  { key: "work", href: "#work" },
  { key: "capabilities", href: "#capabilities" },
  { key: "about", href: "#about" },
  { key: "contact", href: "#contact" },
] as const;

/** Scroll depth (px) at which the bar retracts. */
export const HIDE_BAR_AFTER = 8;
