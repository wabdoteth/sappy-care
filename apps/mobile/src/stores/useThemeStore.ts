import { create } from "zustand";

import { defaultPaletteId, type PaletteId } from "@sappy/shared/theme";

type ThemeState = {
  paletteId: PaletteId;
  setPaletteId: (paletteId: PaletteId) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  paletteId: defaultPaletteId,
  setPaletteId: (paletteId) => set({ paletteId }),
}));
