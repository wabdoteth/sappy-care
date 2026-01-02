export type PaletteId = "sky" | "blush" | "mint";

export type ThemePalette = {
  id: PaletteId;
  name: string;
  backgroundGradient: [string, string, string?];
  background: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  chip: string;
  chipText: string;
  border: string;
  shadow: string;
  highlight: string;
  companionBase: string;
  companionAura: string;
  success: string;
  warning: string;
  roomWall: string;
  roomFloor: string;
  roomFloorAccent: string;
  roomWindow: string;
  roomDoor: string;
  roomNest: string;
  roomNestInner: string;
  roomDresser: string;
  roomLamp: string;
  roomLampStem: string;
};

export const palettes: Record<PaletteId, ThemePalette> = {
  sky: {
    id: "sky",
    name: "Lagoon",
    backgroundGradient: ["#CFF8F5", "#BCEBFA", "#CBE6FF"],
    background: "#CFF8F5",
    surface: "#FFFFFF",
    surfaceMuted: "#E6FBF7",
    primary: "#2EBBC7",
    primaryDark: "#1E818A",
    accent: "#FFB05C",
    card: "#FFFFFF",
    textPrimary: "#162F2E",
    textSecondary: "#3F5D5A",
    textMuted: "#6D8B86",
    chip: "#DFF5F2",
    chipText: "#385753",
    border: "#B8E0DA",
    shadow: "#122E2B",
    highlight: "#F6FFFE",
    companionBase: "#C9E2F5",
    companionAura: "#E8F8FF",
    success: "#6FD4B5",
    warning: "#FFB285",
    roomWall: "#CFF8F5",
    roomFloor: "#70CCD0",
    roomFloorAccent: "#59B8BB",
    roomWindow: "#4E5DAA",
    roomDoor: "#F3A64B",
    roomNest: "#F7D073",
    roomNestInner: "#EFC262",
    roomDresser: "#9FDAD4",
    roomLamp: "#F8DB7E",
    roomLampStem: "#9F946C",
  },
  blush: {
    id: "blush",
    name: "Sunbathe",
    backgroundGradient: ["#FFF2E6", "#FDE3D0", "#FBD2B5"],
    background: "#FFF2E6",
    surface: "#FFFFFF",
    surfaceMuted: "#FFE7D4",
    primary: "#F08C5D",
    primaryDark: "#C66A3F",
    accent: "#5FB9A5",
    card: "#FFFFFF",
    textPrimary: "#3B241B",
    textSecondary: "#6D4B3D",
    textMuted: "#9B6F5B",
    chip: "#F7D6BF",
    chipText: "#7A5342",
    border: "#F0C9B0",
    shadow: "#3C251B",
    highlight: "#FFF6ED",
    companionBase: "#EBDCD4",
    companionAura: "#F6E8DF",
    success: "#7CD5B2",
    warning: "#FFB38F",
    roomWall: "#FCE8D6",
    roomFloor: "#E7B398",
    roomFloorAccent: "#DFA084",
    roomWindow: "#5F5FAE",
    roomDoor: "#F08C5D",
    roomNest: "#F7D073",
    roomNestInner: "#EFC262",
    roomDresser: "#E8C8BA",
    roomLamp: "#F8DB7E",
    roomLampStem: "#A18775",
  },
  mint: {
    id: "mint",
    name: "Tidepool",
    backgroundGradient: ["#EFFFF9", "#DDF6EF", "#CFEFDF"],
    background: "#EFFFF9",
    surface: "#FFFFFF",
    surfaceMuted: "#E1F6EE",
    primary: "#4EBB97",
    primaryDark: "#2D8D73",
    accent: "#FFB48E",
    card: "#FFFFFF",
    textPrimary: "#19302A",
    textSecondary: "#4B6B61",
    textMuted: "#729187",
    chip: "#D4F0E4",
    chipText: "#44645B",
    border: "#BFE2D3",
    shadow: "#142E27",
    highlight: "#F2FFFA",
    companionBase: "#D8E8E1",
    companionAura: "#ECF7F2",
    success: "#67D1A3",
    warning: "#F5B58E",
    roomWall: "#D3F1E8",
    roomFloor: "#6FC9BC",
    roomFloorAccent: "#57B2A5",
    roomWindow: "#4E5DAA",
    roomDoor: "#F1A15E",
    roomNest: "#F7D073",
    roomNestInner: "#EFC262",
    roomDresser: "#A0D7D0",
    roomLamp: "#F8DB7E",
    roomLampStem: "#8F9775",
  },
};

export const defaultPaletteId: PaletteId = "sky";

export function getPalette(id: PaletteId): ThemePalette {
  return palettes[id] ?? palettes[defaultPaletteId];
}
