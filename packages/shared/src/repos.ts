import type {
  ActivitySession,
  ActivitySessionInput,
  AppSettings,
  BloomRun,
  BloomRunInput,
  BloomRunUpdate,
  Checkin,
  CheckinInput,
  Companion,
  CompanionInput,
  Goal,
  GoalCompletion,
  GoalCompletionInput,
  GoalInput,
  GoalUpdate,
  Item,
  Quest,
  QuestInput,
  QuestUpdate,
  RewardLedgerEntry,
  RewardLedgerEntryInput,
  Friend,
  FriendInput,
  SupportNote,
  SupportNoteInput,
  StoryCard,
  StoryCardInstance,
  StoryCardInstanceInput,
  UserItem,
} from "./types";

export interface IUserRepo {
  getSettings(): Promise<AppSettings>;
  updateSettings(update: Partial<AppSettings>): Promise<AppSettings>;
}

export interface ICompanionRepo {
  getCompanion(): Promise<Companion | null>;
  createCompanion(input: CompanionInput): Promise<Companion>;
  updateCompanion(id: string, update: CompanionInput): Promise<Companion>;
}

export interface IGoalsRepo {
  listGoals(options?: { includeArchived?: boolean }): Promise<Goal[]>;
  createGoal(input: GoalInput): Promise<Goal>;
  updateGoal(id: string, update: GoalUpdate): Promise<Goal>;
  listCompletions(options?: {
    localDate?: string;
    goalId?: string;
  }): Promise<GoalCompletion[]>;
  createCompletion(input: GoalCompletionInput): Promise<GoalCompletion>;
}

export interface ICheckinRepo {
  listCheckins(options?: {
    limit?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<Checkin[]>;
  createCheckin(input: CheckinInput): Promise<Checkin>;
}

export interface IActivityRepo {
  listSessions(options?: {
    limit?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<ActivitySession[]>;
  createSession(input: ActivitySessionInput): Promise<ActivitySession>;
}

export interface IQuestsRepo {
  listQuests(options?: { localDate?: string }): Promise<Quest[]>;
  createQuest(input: QuestInput): Promise<Quest>;
  updateQuest(id: string, update: QuestUpdate): Promise<Quest>;
}

export interface IRewardsRepo {
  listLedgerEntries(options?: { limit?: number }): Promise<RewardLedgerEntry[]>;
  addLedgerEntry(input: RewardLedgerEntryInput): Promise<RewardLedgerEntry>;
}

export interface IShopRepo {
  listItems(): Promise<Item[]>;
  listStoryCards(): Promise<StoryCard[]>;
  listInventory(): Promise<UserItem[]>;
  addUserItem(itemId: string, metadata?: Record<string, unknown>): Promise<UserItem>;
}

export interface IBloomRepo {
  createBloomRun(input: BloomRunInput): Promise<BloomRun>;
  updateBloomRun(id: string, update: BloomRunUpdate): Promise<BloomRun>;
  createStoryCardInstance(input: StoryCardInstanceInput): Promise<StoryCardInstance>;
  updateStoryCardInstance(
    id: string,
    update: Partial<StoryCardInstanceInput>
  ): Promise<StoryCardInstance>;
  listStoryCardInstances(): Promise<StoryCardInstance[]>;
}

export interface IFriendsRepo {
  getFriendCode(): Promise<string>;
  listFriends(): Promise<Friend[]>;
  addFriend(input: FriendInput): Promise<Friend>;
  listSupportNotes(options?: { friendId?: string; limit?: number }): Promise<SupportNote[]>;
  addSupportNote(input: SupportNoteInput): Promise<SupportNote>;
}

export type AppRepos = {
  user: IUserRepo;
  companion: ICompanionRepo;
  goals: IGoalsRepo;
  checkins: ICheckinRepo;
  activity: IActivityRepo;
  quests: IQuestsRepo;
  rewards: IRewardsRepo;
  shop: IShopRepo;
  bloom: IBloomRepo;
  friends?: IFriendsRepo;
};
