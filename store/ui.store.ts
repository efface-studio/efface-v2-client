import { create } from "zustand";

interface UIState {
  /** Full-screen overlay menu. Global because opening it locks body scroll. */
  isNavOpen: boolean;
  setNavOpen: (open: boolean) => void;
  toggleNav: () => void;
  closeNav: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isNavOpen: false,
  setNavOpen: (open) => set({ isNavOpen: open }),
  toggleNav: () => set((s) => ({ isNavOpen: !s.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),
}));
