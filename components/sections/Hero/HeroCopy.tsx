"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import type { MotionValue } from "motion/react";
import Tour from "@/components/Tour";

type DriftStyle = CSSProperties & Record<"--drift-x" | "--drift-y" | "--turn" | "--delay", string>;

function drift(index: number, length: number, row: number): DriftStyle {
  const along = index / Math.max(1, length - 1);
  const wave = Math.sin(index * 0.51 + row * 2.2);
  const lift = Math.cos(index * 0.67 + row);
  return {
    "--drift-x": `${((along - 0.5) * 2.4 + wave * 0.48).toFixed(3)}em`,
    "--drift-y": `${((row === 0 ? -0.65 : 0.45) + lift * 0.56).toFixed(3)}em`,
    "--turn": `${(wave * (row === 2 ? 5 : 15)).toFixed(2)}deg`,
    "--delay": (0.035 + along * 0.19 + (lift + 1) * 0.04).toFixed(3),
  };
}

/** Keep normal word wrapping while allowing title letters and body words to drift. */
function ScatterLine({ text, row }: { text: string; row: number }) {
  const words = text.split(" ");
  let offset = 0;
  return words.map((word, i) => {
    const start = offset;
    const letters = Array.from(word);
    offset += letters.length + 1;
    return (
      <Fragment key={i}>
        {i > 0 && " "}
        {row === 2 ? (
          <span className="hero-fragment" style={drift(i, words.length, row)}>{word}</span>
        ) : (
          <span className="inline-block whitespace-nowrap">
            {letters.map((letter, j) => (
              <span key={j} className="hero-fragment" style={drift(start + j, text.length, row)}>{letter}</span>
            ))}
          </span>
        )}
      </Fragment>
    );
  });
}

export default function HeroCopy({ scatter, reduce }: { scatter: MotionValue<number>; reduce: boolean }) {
  const t = useTranslations("Hero");
  const ref = useRef<HTMLDivElement>(null);
  const lines = [t("titleLine1"), t("titleLine2")];
  const description = t("sub");
  useEffect(() => {
    const copy = ref.current;
    if (!copy) return;
    const paint = () => {
      const amount = reduce ? 0 : scatter.get();
      copy.style.setProperty("--scatter", amount.toFixed(4));
      copy.inert = amount >= 0.99;
    };
    paint();
    return scatter.on("change", paint);
  }, [scatter, reduce]);

  return (
    <div className="hero-copy-track pointer-events-none absolute inset-x-0 top-0">
      <div ref={ref} className="hero-copy sticky top-0 mx-auto grid grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] justify-items-center px-5 text-center">
        <h1 id="hero-title" aria-label={lines.join(" ")} className="row-start-2 w-full max-w-[7.5em] text-[clamp(2.35rem,8vw,4.5rem)] font-semibold leading-[1.04] tracking-tight">
          {lines.map((line, row) => (
            <span key={row} aria-hidden="true" className={row === 0 ? "rise-in rise-d1 block" : "rise-in rise-d2 block"}>
              <ScatterLine text={line} row={row} />
            </span>
          ))}
        </h1>
        <div className="hero-details row-start-3 self-start">
          <p className="rise-in rise-d3 mx-auto mt-5 max-w-md text-base leading-relaxed text-fg md:mt-7 md:text-lg">
            <span className="sr-only">{description}</span>
            <span aria-hidden="true"><ScatterLine text={description} row={2} /></span>
          </p>
          <div className="hero-tour"><Tour /></div>
        </div>
      </div>
    </div>
  );
}
