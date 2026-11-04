import { create } from "zustand";

interface UIState {
  /** Full-screen overlay menu. Global because opening it locks body scroll. */
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
  toggleNav: () => void;
  closeNav: () => void;
  /** The build running over the site, if any. Global so it outlives the page it started on (build 2 moves between pages). */
  build: "studio" | "swarm" | null;
  setBuild: (build: "studio" | "swarm" | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isNavOpen: false,
  setNavOpen: (open) => set({ isNavOpen: open }),
  toggleNav: () => set((s) => ({ isNavOpen: !s.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),
  build: null,
  setBuild: (build) => set({ build }),
}));
