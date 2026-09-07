"use client";

import { usePolicyMotion } from "./usePolicyMotion";
import type { PolicyIndexProps } from "./PolicyIndex.types";

/**
 * Sticky section index for the policy page. Also the mount point for the
 * page's reveal motion — see `usePolicyMotion`.
 */
export default function PolicyIndex({ label, items }: PolicyIndexProps) {
  const active = usePolicyMotion(items[0]?.id ?? "");

  return (
    <nav className="policy-index" aria-label={label}>
      <div className="policy-index__label">{label}</div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="policy-index__link"
          data-active={item.id === active ? "" : undefined}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}
