import type { WorkIcon } from "./Work.types";

/** Icon art per project `key`. Projects missing here get a monogram tile. */
export const WORK_ICONS: Record<string, WorkIcon> = {
  hinest: { src: "/work/hinest.png" },
  hwaso: { src: "/work/hwaso.png" },
  luckgluck: { src: "/work/luckgluck.png" },
  "efface-v1": { src: "/work/efface-v1.svg", bg: "#f6f6f7", inset: true },
  "efface-v2": { src: "/work/efface-v2.svg" },
  cheezefilm: { src: "/work/cheezefilm.png" },
  "2pick": { src: "/work/2pick.svg" },
  cutephoto: { src: "/work/cutephoto.png" },
  "design-system": { src: "/work/design-system.svg" },
  rooti: { src: "/work/rooti.png" },
  goms: { src: "/work/goms.svg", bg: "#ffa600" },
};
