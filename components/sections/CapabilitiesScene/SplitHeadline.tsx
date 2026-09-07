import { Fragment, type CSSProperties } from "react";

interface SplitHeadlineProps {
  text: string;
  /** Rendered between words. The mobile layout wraps tighter, so it uses NBSP. */
  separator?: string;
  wordClassName?: string;
  wordStyle?: CSSProperties;
  letterClassName?: string;
  letterStyle?: CSSProperties;
}

/**
 * Splits a headline into words, then letters, so the scene can fly each glyph
 * in from its own scattered offset. `data-l` is how the rAF loops find them.
 */
export default function SplitHeadline({
  text,
  separator = " ",
  wordClassName,
  wordStyle,
  letterClassName,
  letterStyle,
}: SplitHeadlineProps) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span className={wordClassName} style={wordStyle}>
            {Array.from(word).map((ch, ci) => (
              <span key={ci} data-l="" className={letterClassName} style={letterStyle}>
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? separator : null}
        </Fragment>
      ))}
    </>
  );
}
