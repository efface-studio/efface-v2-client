"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useIsMobile } from "@/lib/useIsMobile";
import CapabilitiesDesktop from "./CapabilitiesDesktop";
import CapabilitiesMobile from "./CapabilitiesMobile";
import { useCapabilitiesScene } from "./useCapabilitiesScene";
import { useCapabilitiesStack } from "./useCapabilitiesStack";
import type { CapabilityGroup } from "./Capabilities.types";

/**
 * What the studio does. Desktop pins a 2×2 grid that deals itself out of the
 * centre and magnifies whichever row the cursor is on; mobile pins the same
 * four columns as a card stack, with a lens sweeping each card's rows.
 */
export default function CapabilitiesScene() {
  const t = useTranslations("Capabilities");
  const groups = t.raw("groups") as CapabilityGroup[];
  const label = t("label");
  const title = t("title");
  const lead = t("lead");
  const isMobile = useIsMobile();
  const still = !!useReducedMotion();

  // Both layouts hang off the same section element, so the root ref is shared.
  const rootRef = useRef<HTMLElement>(null);
  const sceneRefs = useCapabilitiesScene(rootRef, !isMobile, groups.length);
  const stackRef = useRef<HTMLDivElement>(null);
  const mobileRefs = useCapabilitiesStack(stackRef, isMobile && !still);

  const copy = { groups, label, title, lead };

  return isMobile ? (
    <CapabilitiesMobile
      {...copy}
      rootRef={rootRef}
      stackRef={stackRef}
      refs={mobileRefs}
      still={still}
    />
  ) : (
    <CapabilitiesDesktop {...copy} rootRef={rootRef} refs={sceneRefs} />
  );
}
