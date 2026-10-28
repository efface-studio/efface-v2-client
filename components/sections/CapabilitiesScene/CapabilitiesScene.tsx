"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/lib/useIsMobile";
import CapabilitiesDesktop from "./CapabilitiesDesktop";
import CapabilitiesMobile from "./CapabilitiesMobile";
import { useCapabilitiesScene } from "./useCapabilitiesScene";
import { useCapabilitiesMobileMotion } from "./useCapabilitiesMobileMotion";
import type { CapabilityGroup } from "./Capabilities.types";

/**
 * What the studio does. Desktop pins a 2×2 grid that deals itself out of the
 * centre and magnifies whichever row the cursor is on; mobile stacks the same
 * four columns and replays the timeline off each block's own scroll position.
 */
export default function CapabilitiesScene() {
  const t = useTranslations("Capabilities");
  const groups = t.raw("groups") as CapabilityGroup[];
  const label = t("label");
  const title = t("title");
  const lead = t("lead");
  const isMobile = useIsMobile();

  // Both layouts hang off the same section element, so the root ref is shared.
  const rootRef = useRef<HTMLElement>(null);
  const sceneRefs = useCapabilitiesScene(rootRef, !isMobile, groups.length);
  const mobileRefs = useCapabilitiesMobileMotion(rootRef, isMobile);

  const copy = { groups, label, title, lead };

  return isMobile ? (
    <CapabilitiesMobile {...copy} rootRef={rootRef} refs={mobileRefs} />
  ) : (
    <CapabilitiesDesktop {...copy} rootRef={rootRef} refs={sceneRefs} />
  );
}
