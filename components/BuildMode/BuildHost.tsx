"use client";

import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useUIStore } from "@/store/ui.store";

const BuildStudio = dynamic(() => import("./BuildStudio"), { ssr: false });
const SwarmBuild = dynamic(() => import("./swarm/SwarmBuild"), { ssr: false });

/**
 * Runs the build picked in the nav. It lives in the layout rather than the
 * nav, so a build carries on across pages (the nav isn't on every one).
 */
export default function BuildHost() {
  const build = useUIStore((s) => s.build);
  const setBuild = useUIStore((s) => s.setBuild);
  const close = () => setBuild(null);
  if (build === "studio") return createPortal(<BuildStudio onClose={close} />, document.body);
  if (build === "swarm") return <SwarmBuild onClose={close} />;
  return null;
}
