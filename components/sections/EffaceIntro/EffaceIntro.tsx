"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/lib/useIsMobile";
import ClutterField from "./ClutterField";
import EraserPuck from "./EraserPuck";
import IntroBody from "./IntroBody";
import { parseSentence } from "./parseSentence";
import { useEffaceTimeline } from "./useEffaceTimeline";
import {
  HOLD,
  MOBILE_PACE_SCALE,
  PACE_VH,
  STEP,
  W0,
  WIN,
  WINDOWS_PACE_SCALE,
} from "./EffaceIntro.constants";

const noopSubscribe = () => () => {};

/**
 * "efface, verb — to erase." The scene wipes a screenful of clutter away and
 * lights the definition sentence up word by word as the section scrolls.
 */
export default function EffaceIntro() {
  const t = useTranslations("Efface");
  const label = t("label");
  const definition = t("definition");
  // `t.raw` — the copy carries `{orb1}` markers, which ICU would try to read as
  // message variables and fail on. We do our own parsing instead.
  const sentence = t.raw("sentence") as string;
  const isMobile = useIsMobile();

  const tokens = useMemo(() => parseSentence(sentence), [sentence]);
  // index among word tokens only — the timeline staggers on words, not orbs
  const wordIndex = useMemo(() => {
    let n = 0;
    return tokens.map((tk) => (tk.kind === "word" ? n++ : n));
  }, [tokens]);

  // Where the word timeline actually finishes for this locale's copy — the
  // scene is sized to exactly that, so shorter copy no longer leaves a tail
  // of empty scroll (the Korean sentence ends near p≈0.68 of the old 700vh).
  const timelineEnd = useMemo(() => {
    const wordCount = tokens.filter((tk) => tk.kind === "word").length;
    return W0 + Math.max(0, wordCount - 1) * STEP + WIN + HOLD;
  }, [tokens]);
  // Windows wheels step ~100px a notch with no momentum, so the tuned pace reads
  // as a slog there; a shorter scene plays the same timeline in fewer notches.
  const isWindows = useSyncExternalStore(
    noopSubscribe,
    () => /Windows/.test(navigator.userAgent),
    () => false,
  );
  // Touch flicks carry momentum too, so phones get a shorter scene as well.
  const paceScale = isMobile ? MOBILE_PACE_SCALE : isWindows ? WINDOWS_PACE_SCALE : 1;
  const sceneVh = 100 + Math.round(PACE_VH * paceScale * timelineEnd);

  const refs = useEffaceTimeline({
    tokens,
    wordIndex,
    label,
    definition,
    isMobile,
    timelineEnd,
  });

  const body = (
    <IntroBody
      tokens={tokens}
      label={label}
      definition={definition}
      isMobile={isMobile}
      refs={refs}
    />
  );

  return (
    <section
      id="efface"
      ref={refs.rootRef}
      style={{
        position: "relative",
        height: `${sceneVh}vh`,
        background: "var(--color-bg)",
        color: "#EDEDEF",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          // svh on phones, so the pinned frame doesn't jump as the URL bar hides.
          height: isMobile ? "100svh" : "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <ClutterField hostRef={refs.clutterRef} compact={isMobile} />
        <EraserPuck hostRef={refs.puckRef} />
        {body}
      </div>
    </section>
  );
}
