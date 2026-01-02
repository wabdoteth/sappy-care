import type { JsonMap } from "@sappy/shared/types";

export type SeedItem = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category: string;
  pricePetals: number;
  metadata: JsonMap;
};

export type SeedStoryCard = {
  id: string;
  title: string;
  body: string;
  choiceAText: string;
  choiceBText: string;
  choiceATraitDeltas: JsonMap;
  choiceBTraitDeltas: JsonMap;
  rarity: string;
};

export const seedItems: SeedItem[] = [
  {
    id: "item_sticker_spark",
    sku: "sticker_spark",
    name: "Spark Sticker",
    description: "A bright little spark for your journal.",
    category: "sticker",
    pricePetals: 12,
    metadata: { rarity: "common" },
  },
  {
    id: "item_sticker_wave",
    sku: "sticker_wave",
    name: "Wave Sticker",
    description: "A gentle wave to celebrate progress.",
    category: "sticker",
    pricePetals: 14,
    metadata: { rarity: "common" },
  },
  {
    id: "item_palette_mint",
    sku: "palette_mint",
    name: "Mint Palette",
    description: "A cool palette for calm days.",
    category: "palette",
    pricePetals: 30,
    metadata: { rarity: "uncommon" },
  },
  {
    id: "item_outfit_sunhat",
    sku: "outfit_sunhat",
    name: "Sunhat",
    description: "A wide brim for sunny naps.",
    category: "outfit",
    pricePetals: 22,
    metadata: { rarity: "common", slot: "head", art: "sunhat" },
  },
  {
    id: "item_outfit_scarf",
    sku: "outfit_scarf",
    name: "Soft Scarf",
    description: "Extra cozy for breezy days.",
    category: "outfit",
    pricePetals: 20,
    metadata: { rarity: "common", slot: "neck", art: "scarf" },
  },
  {
    id: "item_outfit_floatie",
    sku: "outfit_floatie",
    name: "Float Ring",
    description: "A playful ring for lounge time.",
    category: "outfit",
    pricePetals: 28,
    metadata: { rarity: "uncommon", slot: "float", art: "floatie" },
  },
  {
    id: "item_outfit_shades",
    sku: "outfit_shades",
    name: "Sunny Shades",
    description: "Tiny shades for big smiles.",
    category: "outfit",
    pricePetals: 24,
    metadata: { rarity: "common", slot: "face", art: "shades" },
  },
  {
    id: "item_room_sunmat",
    sku: "room_sunmat",
    name: "Sunmat",
    description: "A warm spot in the cove.",
    category: "room",
    pricePetals: 18,
    metadata: { rarity: "common", art: "sunmat" },
  },
  {
    id: "item_room_shelllamp",
    sku: "room_shelllamp",
    name: "Shell Lamp",
    description: "A soft glow for story time.",
    category: "room",
    pricePetals: 34,
    metadata: { rarity: "uncommon", art: "shelllamp" },
  },
  {
    id: "item_room_pillow",
    sku: "room_pillow",
    name: "Drift Pillow",
    description: "A plush cloud for lounging.",
    category: "room",
    pricePetals: 16,
    metadata: { rarity: "common", art: "pillow" },
  },
  {
    id: "item_toy_beachball",
    sku: "toy_beachball",
    name: "Beachball",
    description: "A bouncy toy for playtime.",
    category: "toy",
    pricePetals: 14,
    metadata: { rarity: "common", art: "beachball" },
  },
  {
    id: "item_sticker_seal",
    sku: "sticker_seal",
    name: "Seal Sticker",
    description: "A tiny seal to celebrate wins.",
    category: "sticker",
    pricePetals: 16,
    metadata: { rarity: "common" },
  },
];

export const seedStoryCards: SeedStoryCard[] = [
  {
    id: "story_card_breeze",
    title: "Sunbeam Nap",
    body: "A warm patch of light lands near your seal. It feels like an invitation to rest.",
    choiceAText: "Stretch into the light",
    choiceBText: "Curl up beside it",
    choiceATraitDeltas: { calm: 1 },
    choiceBTraitDeltas: { grounded: 1 },
    rarity: "common",
  },
  {
    id: "story_card_focus",
    title: "Gentle Tide",
    body: "The water rolls in and out. Your seal watches, steady and patient.",
    choiceAText: "Breathe with the tide",
    choiceBText: "Name one tiny task",
    choiceATraitDeltas: { focused: 1 },
    choiceBTraitDeltas: { steady: 1 },
    rarity: "common",
  },
  {
    id: "story_card_glow",
    title: "Shell Stories",
    body: "Your seal nudges a small shell toward you. A soft reminder of what you have done today.",
    choiceAText: "Name the win",
    choiceBText: "Write the win",
    choiceATraitDeltas: { grateful: 1 },
    choiceBTraitDeltas: { reflective: 1 },
    rarity: "common",
  },
];
