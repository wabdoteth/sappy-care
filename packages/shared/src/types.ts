import type { PaletteId } from "./theme";

export type Mood = 1 | 2 | 3 | 4 | 5;

export type ActivityType =
  | "breathe"
  | "focus"
  | "sound"
  | "reflect"
  | "first_aid";

export type RewardEvent =
  | { type: "checkin"; checkinId: string }
  | { type: "goal_complete"; goalId: string; completionId: string }
  | { type: "activity_complete"; sessionId: string; activityType: ActivityType }
  | { type: "quest_claim"; questId: string }
  | { type: "bloom_complete"; bloomRunId: string };

export type JsonMap = Record<string, unknown>;

export type LocalDate = string;

export type Companion = {
  id: string;
  paletteId: PaletteId;
  charge: number;
  petalsBalance: number;
  traits: JsonMap;
  equippedItemIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CompanionInput = {
  paletteId?: PaletteId;
  charge?: number;
  petalsBalance?: number;
  traits?: JsonMap;
  equippedItemIds?: string[];
};

export type Goal = {
  id: string;
  title: string;
  details?: string | null;
  schedule: JsonMap;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GoalInput = {
  title: string;
  details?: string | null;
  schedule?: JsonMap;
  isArchived?: boolean;
};

export type GoalUpdate = Partial<GoalInput>;

export type GoalCompletion = {
  id: string;
  goalId: string;
  localDate: LocalDate;
  createdAt: string;
};

export type GoalCompletionInput = {
  goalId: string;
  localDate: LocalDate;
};

export type Checkin = {
  id: string;
  localDate: LocalDate;
  mood: Mood;
  note?: string | null;
  createdAt: string;
};

export type CheckinInput = {
  localDate: LocalDate;
  mood: Mood;
  note?: string | null;
};

export type ActivitySession = {
  id: string;
  localDate: LocalDate;
  activityType: ActivityType;
  durationSeconds?: number | null;
  note?: string | null;
  metadata: JsonMap;
  createdAt: string;
};

export type ActivitySessionInput = {
  localDate: LocalDate;
  activityType: ActivityType;
  durationSeconds?: number | null;
  note?: string | null;
  metadata?: JsonMap;
};

export type Quest = {
  id: string;
  localDate: LocalDate;
  questType: string;
  target: number;
  progress: number;
  rewardPetals: number;
  isClaimed: boolean;
  claimedAt?: string | null;
  createdAt: string;
};

export type QuestInput = {
  localDate: LocalDate;
  questType: string;
  target: number;
  progress?: number;
  rewardPetals?: number;
  isClaimed?: boolean;
  claimedAt?: string | null;
};

export type QuestUpdate = Partial<QuestInput>;

export type RewardLedgerEntry = {
  id: string;
  eventType: string;
  sourceType?: string | null;
  sourceId?: string | null;
  chargeDelta: number;
  petalsDelta: number;
  createdAt: string;
};

export type RewardLedgerEntryInput = {
  eventType: string;
  sourceType?: string | null;
  sourceId?: string | null;
  chargeDelta?: number;
  petalsDelta?: number;
};

export type BloomRun = {
  id: string;
  localDate: LocalDate;
  startedAt: string;
  completedAt?: string | null;
  isCompleted: boolean;
  choice?: "a" | "b" | null;
  storyCardId?: string | null;
  petalsAwarded: number;
  stickerItemId?: string | null;
  createdAt: string;
};

export type BloomRunInput = {
  localDate: LocalDate;
  startedAt?: string;
  completedAt?: string | null;
  isCompleted?: boolean;
  choice?: "a" | "b" | null;
  storyCardId?: string | null;
  petalsAwarded?: number;
  stickerItemId?: string | null;
};

export type BloomRunUpdate = Partial<BloomRunInput>;

export type Item = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category: string;
  pricePetals: number;
  metadata: JsonMap;
  createdAt: string;
};

export type UserItem = {
  id: string;
  itemId: string;
  acquiredAt: string;
  metadata: JsonMap;
};

export type StoryCard = {
  id: string;
  title: string;
  body: string;
  choiceAText: string;
  choiceBText: string;
  choiceATraitDeltas: JsonMap;
  choiceBTraitDeltas: JsonMap;
  rarity: string;
  createdAt: string;
};

export type StoryCardInstance = {
  id: string;
  storyCardId: string;
  bloomRunId?: string | null;
  choice?: "a" | "b" | null;
  reflectionText?: string | null;
  createdAt: string;
};

export type StoryCardInstanceInput = {
  storyCardId: string;
  bloomRunId?: string | null;
  choice?: "a" | "b" | null;
  reflectionText?: string | null;
};

export type Friend = {
  id: string;
  friendCode: string;
  displayName: string;
  createdAt: string;
};

export type FriendInput = {
  friendCode: string;
  displayName: string;
};

export type SupportNote = {
  id: string;
  friendId?: string | null;
  direction: "incoming" | "outgoing";
  message: string;
  createdAt: string;
};

export type SupportNoteInput = {
  friendId?: string | null;
  direction?: "incoming" | "outgoing";
  message: string;
};

export type AppSettings = {
  pauseMode: boolean;
};
