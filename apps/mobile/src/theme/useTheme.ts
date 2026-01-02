import { getPalette, palettes } from "@sappy/shared/theme";

import { useThemeStore } from "../stores/useThemeStore";

const availablePalettes = Object.values(palettes);

export function useTheme() {
  const paletteId = useThemeStore((state) => state.paletteId);
  const setPaletteId = useThemeStore((state) => state.setPaletteId);
  const palette = getPalette(paletteId);

  return {
    paletteId,
    palette,
    setPaletteId,
    palettes: availablePalettes,
  };
}
