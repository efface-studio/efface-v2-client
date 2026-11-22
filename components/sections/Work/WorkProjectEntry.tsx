"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { scroll } from "motion";
import { smoothstep } from "@/lib/motion";
import { cn } from "@/lib/cn";
import styles from "./WorkProjectEntry.module.css";

interface WorkProjectEntryProps {
  children: ReactNode;
  label?: string;
  className?: string;
  /** The unpinned row supplies the scroll position for both featured projects. */
  rowRef?: RefObject<HTMLDivElement | null>;
}

export default function WorkProjectEntry({ children, label, className, rowRef }: WorkProjectEntryProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let previous = "";
    return scroll(
      (progress: number) => {
        const entry = smoothstep(0, 1, progress).toFixed(3);
        if (entry === previous) return;
        element.style.setProperty("--project-entry", entry);
        previous = entry;
      },
      { target: rowRef?.current ?? element, offset: ["start end", "start 56%"] }
    );
  }, [rowRef]);

  return (
    <article ref={ref} aria-label={label} className={cn(styles.project, rowRef && styles.featured, className)}>
      {children}
    </article>
  );
}
