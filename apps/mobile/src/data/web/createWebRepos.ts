import type { AppRepos } from "@sappy/shared/repos";
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
} from "@sappy/shared/types";
import { defaultPaletteId, type PaletteId } from "@sappy/shared/theme";

import { seedItems, seedStoryCards } from "../local/seed";
import { createId, nowIso } from "../local/utils";

type WebStore = {
  companion: Companion | null;
  goals: Goal[];
  goalCompletions: GoalCompletion[];
  checkins: Checkin[];
  activitySessions: ActivitySession[];
  quests: Quest[];
  rewardsLedger: RewardLedgerEntry[];
  userItems: UserItem[];
  bloomRuns: BloomRun[];
  storyCardInstances: StoryCardInstance[];
  settings: AppSettings;
  items: Item[];
  storyCards: StoryCard[];
  friends: Friend[];
  supportNotes: SupportNote[];
  friendCode?: string | null;
};

const STORE_KEY = "sappy-web-store-v1";

const defaultStore: WebStore = {
  companion: null,
  goals: [],
  goalCompletions: [],
  checkins: [],
  activitySessions: [],
  quests: [],
  rewardsLedger: [],
  userItems: [],
  bloomRuns: [],
  storyCardInstances: [],
  settings: { pauseMode: false },
  items: [],
  storyCards: [],
  friends: [],
  supportNotes: [],
  friendCode: null,
};

const globalState = globalThis as typeof globalThis & {
  __sappyWebStore?: WebStore;
};

function getStorage() {
  const storageRef = globalThis as typeof globalThis & { localStorage?: Storage };
  return storageRef.localStorage;
}

function loadStore(): WebStore {
  const storage = getStorage();
  if (!storage) {
    return { ...defaultStore };
  }
  try {
    const raw = storage.getItem(STORE_KEY);
    if (!raw) {
      return { ...defaultStore };
    }
    const parsed = JSON.parse(raw) as Partial<WebStore>;
    return {
      ...defaultStore,
      ...parsed,
      goals: parsed.goals ?? [],
      goalCompletions: parsed.goalCompletions ?? [],
      checkins: parsed.checkins ?? [],
      activitySessions: parsed.activitySessions ?? [],
      quests: parsed.quests ?? [],
      rewardsLedger: parsed.rewardsLedger ?? [],
      userItems: parsed.userItems ?? [],
      bloomRuns: parsed.bloomRuns ?? [],
      storyCardInstances: parsed.storyCardInstances ?? [],
      items: parsed.items ?? [],
      storyCards: parsed.storyCards ?? [],
      settings: parsed.settings ?? { pauseMode: false },
      friends: parsed.friends ?? [],
      supportNotes: parsed.supportNotes ?? [],
      friendCode: parsed.friendCode ?? null,
    };
  } catch {
    return { ...defaultStore };
  }
}

function saveStore(store: WebStore) {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors.
  }
}

function getStore(): WebStore {
  if (!globalState.__sappyWebStore) {
    globalState.__sappyWebStore = loadStore();
  }
  return globalState.__sappyWebStore;
}

function updateStore(mutator: (store: WebStore) => void) {
  const store = getStore();
  mutator(store);
  saveStore(store);
  return store;
}

function ensureSeedData(store: WebStore) {
  if (store.items.length === 0) {
    store.items = seedItems.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description ?? null,
      category: item.category,
      pricePetals: item.pricePetals,
      metadata: item.metadata,
      createdAt: nowIso(),
    }));
  }
  if (store.storyCards.length === 0) {
    store.storyCards = seedStoryCards.map((card) => ({
      id: card.id,
      title: card.title,
      body: card.body,
      choiceAText: card.choiceAText,
      choiceBText: card.choiceBText,
      choiceATraitDeltas: card.choiceATraitDeltas,
      choiceBTraitDeltas: card.choiceBTraitDeltas,
      rarity: card.rarity,
      createdAt: nowIso(),
    }));
  }
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function sortByLocalDate<T extends { localDate: string; createdAt: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (a.localDate === b.localDate) {
      return b.createdAt.localeCompare(a.createdAt);
    }
    return b.localDate.localeCompare(a.localDate);
  });
}

function sortByAcquiredAtDesc(items: UserItem[]) {
  return [...items].sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt));
}

function generateFriendCode() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `SEAL-${digits}`;
}

export function clearWebData() {
  globalState.__sappyWebStore = { ...defaultStore };
  ensureSeedData(globalState.__sappyWebStore);
  saveStore(globalState.__sappyWebStore);
}

export function createWebRepos(): AppRepos {
  updateStore((store) => {
    ensureSeedData(store);
  });

  return {
    user: {
      async getSettings() {
        const store = getStore();
        return store.settings ?? { pauseMode: false };
      },
      async updateSettings(update: Partial<AppSettings>) {
        const store = updateStore((current) => {
          current.settings = {
            ...current.settings,
            ...update,
          };
        });
        return store.settings;
      },
    },
    companion: {
      async getCompanion() {
        return getStore().companion;
      },
      async createCompanion(input: CompanionInput) {
        const createdAt = nowIso();
        const companion: Companion = {
          id: createId("companion"),
          paletteId: (input.paletteId ?? defaultPaletteId) as PaletteId,
          charge: input.charge ?? 0,
          petalsBalance: input.petalsBalance ?? 0,
          traits: input.traits ?? {},
          equippedItemIds: input.equippedItemIds ?? [],
          createdAt,
          updatedAt: createdAt,
        };
        updateStore((store) => {
          store.companion = companion;
        });
        return companion;
      },
      async updateCompanion(id: string, update: CompanionInput) {
        const store = updateStore((current) => {
          if (!current.companion || current.companion.id !== id) {
            throw new Error("Companion not found.");
          }
          current.companion = {
            ...current.companion,
            paletteId: update.paletteId ?? current.companion.paletteId,
            charge: update.charge ?? current.companion.charge,
            petalsBalance: update.petalsBalance ?? current.companion.petalsBalance,
            traits: update.traits ?? current.companion.traits,
            equippedItemIds: update.equippedItemIds ?? current.companion.equippedItemIds,
            updatedAt: nowIso(),
          };
        });
        if (!store.companion) {
          throw new Error("Companion not found.");
        }
        return store.companion;
      },
    },
    goals: {
      async listGoals(options) {
        const store = getStore();
        const includeArchived = options?.includeArchived ?? false;
        const filtered = includeArchived
          ? store.goals
          : store.goals.filter((goal) => !goal.isArchived);
        return sortByCreatedAtDesc(filtered);
      },
      async createGoal(input: GoalInput) {
        const createdAt = nowIso();
        const goal: Goal = {
          id: createId("goal"),
          title: input.title,
          details: input.details ?? null,
          schedule: input.schedule ?? {},
          isArchived: input.isArchived ?? false,
          createdAt,
          updatedAt: createdAt,
        };
        updateStore((store) => {
          store.goals.push(goal);
        });
        return goal;
      },
      async updateGoal(id: string, update: GoalUpdate) {
        let updated: Goal | null = null;
        updateStore((store) => {
          const index = store.goals.findIndex((goal) => goal.id === id);
          if (index < 0) {
            throw new Error("Goal not found.");
          }
          const current = store.goals[index];
          updated = {
            ...current,
            title: update.title ?? current.title,
            details: update.details !== undefined ? update.details : current.details,
            schedule: update.schedule ?? current.schedule,
            isArchived: update.isArchived ?? current.isArchived,
            updatedAt: nowIso(),
          };
          store.goals[index] = updated!;
        });
        if (!updated) {
          throw new Error("Goal not found.");
        }
        return updated;
      },
      async listCompletions(options) {
        const store = getStore();
        let completions = store.goalCompletions;
        if (options?.localDate) {
          completions = completions.filter(
            (completion) => completion.localDate === options.localDate
          );
        }
        if (options?.goalId) {
          completions = completions.filter(
            (completion) => completion.goalId === options.goalId
          );
        }
        return sortByCreatedAtDesc(completions);
      },
      async createCompletion(input: GoalCompletionInput) {
        const store = getStore();
        const existing = store.goalCompletions.find(
          (completion) =>
            completion.goalId === input.goalId &&
            completion.localDate === input.localDate
        );
        if (existing) {
          return existing;
        }
        const completion: GoalCompletion = {
          id: createId("completion"),
          goalId: input.goalId,
          localDate: input.localDate,
          createdAt: nowIso(),
        };
        updateStore((current) => {
          current.goalCompletions.push(completion);
        });
        return completion;
      },
    },
    checkins: {
      async listCheckins(options) {
        const store = getStore();
        let checkins = store.checkins;
        if (options?.fromDate) {
          checkins = checkins.filter(
            (checkin) => checkin.localDate >= options.fromDate!
          );
        }
        if (options?.toDate) {
          checkins = checkins.filter(
            (checkin) => checkin.localDate <= options.toDate!
          );
        }
        const sorted = sortByLocalDate(checkins);
        if (options?.limit) {
          return sorted.slice(0, options.limit);
        }
        return sorted;
      },
      async createCheckin(input: CheckinInput) {
        const checkin: Checkin = {
          id: createId("checkin"),
          localDate: input.localDate,
          mood: input.mood,
          note: input.note ?? null,
          createdAt: nowIso(),
        };
        updateStore((store) => {
          store.checkins.push(checkin);
        });
        return checkin;
      },
    },
    activity: {
      async listSessions(options) {
        const store = getStore();
        let sessions = store.activitySessions;
        if (options?.fromDate) {
          sessions = sessions.filter(
            (session) => session.localDate >= options.fromDate!
          );
        }
        if (options?.toDate) {
          sessions = sessions.filter(
            (session) => session.localDate <= options.toDate!
          );
        }
        const sorted = sortByLocalDate(sessions);
        if (options?.limit) {
          return sorted.slice(0, options.limit);
        }
        return sorted;
      },
      async createSession(input: ActivitySessionInput) {
        const session: ActivitySession = {
          id: createId("activity"),
          localDate: input.localDate,
          activityType: input.activityType,
          durationSeconds: input.durationSeconds ?? null,
          note: input.note ?? null,
          metadata: input.metadata ?? {},
          createdAt: nowIso(),
        };
        updateStore((store) => {
          store.activitySessions.push(session);
        });
        return session;
      },
    },
    quests: {
      async listQuests(options) {
        const store = getStore();
        const quests = options?.localDate
          ? store.quests.filter((quest) => quest.localDate === options.localDate)
          : store.quests;
        return sortByCreatedAtDesc(quests);
      },
      async createQuest(input: QuestInput) {
        const store = getStore();
        const existing = store.quests.find(
          (quest) =>
            quest.localDate === input.localDate &&
            quest.questType === input.questType
        );
        if (existing) {
          return existing;
        }
        const quest: Quest = {
          id: createId("quest"),
          localDate: input.localDate,
          questType: input.questType,
          target: input.target,
          progress: input.progress ?? 0,
          rewardPetals: input.rewardPetals ?? 0,
          isClaimed: input.isClaimed ?? false,
          claimedAt: input.claimedAt ?? null,
          createdAt: nowIso(),
        };
        updateStore((current) => {
          current.quests.push(quest);
        });
        return quest;
      },
      async updateQuest(id: string, update: QuestUpdate) {
        let updated: Quest | null = null;
        updateStore((store) => {
          const index = store.quests.findIndex((quest) => quest.id === id);
          if (index < 0) {
            throw new Error("Quest not found.");
          }
          const current = store.quests[index];
          updated = {
            ...current,
            localDate: update.localDate ?? current.localDate,
            questType: update.questType ?? current.questType,
            target: update.target ?? current.target,
            progress: update.progress ?? current.progress,
            rewardPetals: update.rewardPetals ?? current.rewardPetals,
            isClaimed: update.isClaimed ?? current.isClaimed,
            claimedAt:
              update.claimedAt !== undefined ? update.claimedAt : current.claimedAt,
          };
          store.quests[index] = updated!;
        });
        if (!updated) {
          throw new Error("Quest not found.");
        }
        return updated;
      },
    },
    rewards: {
      async listLedgerEntries(options) {
        const store = getStore();
        const sorted = sortByCreatedAtDesc(store.rewardsLedger);
        if (options?.limit) {
          return sorted.slice(0, options.limit);
        }
        return sorted;
      },
      async addLedgerEntry(input: RewardLedgerEntryInput) {
        const entry: RewardLedgerEntry = {
          id: createId("ledger"),
          eventType: input.eventType,
          sourceType: input.sourceType ?? null,
          sourceId: input.sourceId ?? null,
          chargeDelta: input.chargeDelta ?? 0,
          petalsDelta: input.petalsDelta ?? 0,
          createdAt: nowIso(),
        };
        updateStore((store) => {
          store.rewardsLedger.push(entry);
        });
        return entry;
      },
    },
    shop: {
      async listItems() {
        return getStore().items;
      },
      async listStoryCards() {
        return getStore().storyCards;
      },
      async listInventory() {
        return sortByAcquiredAtDesc(getStore().userItems);
      },
      async addUserItem(itemId: string, metadata?: Record<string, unknown>) {
        const store = getStore();
        const existing = store.userItems.find((item) => item.itemId === itemId);
        if (existing) {
          return existing;
        }
        const userItem: UserItem = {
          id: createId("user_item"),
          itemId,
          acquiredAt: nowIso(),
          metadata: metadata ?? {},
        };
        updateStore((current) => {
          current.userItems.push(userItem);
        });
        return userItem;
      },
    },
    friends: {
      async getFriendCode() {
        const store = getStore();
        if (store.friendCode) {
          return store.friendCode;
        }
        const code = generateFriendCode();
        updateStore((current) => {
          current.friendCode = code;
        });
        return code;
      },
      async listFriends() {
        return sortByCreatedAtDesc(getStore().friends);
      },
      async addFriend(input: FriendInput) {
        const friendCode = input.friendCode.trim().toUpperCase();
        const displayName = input.displayName.trim() || "Seal buddy";
        const store = getStore();
        const existing = store.friends.find(
          (friend) => friend.friendCode === friendCode
        );
        if (existing) {
          return existing;
        }
        const friend: Friend = {
          id: createId("friend"),
          friendCode,
          displayName,
          createdAt: nowIso(),
        };
        updateStore((current) => {
          current.friends.push(friend);
        });
        return friend;
      },
      async listSupportNotes(options) {
        const store = getStore();
        let notes = store.supportNotes;
        if (options?.friendId) {
          notes = notes.filter((note) => note.friendId === options.friendId);
        }
        const sorted = sortByCreatedAtDesc(notes);
        if (options?.limit) {
          return sorted.slice(0, options.limit);
        }
        return sorted;
      },
      async addSupportNote(input: SupportNoteInput) {
        const note: SupportNote = {
          id: createId("note"),
          friendId: input.friendId ?? null,
          direction: input.direction ?? "outgoing",
          message: input.message,
          createdAt: nowIso(),
        };
        updateStore((current) => {
          current.supportNotes.push(note);
        });
        return note;
      },
    },
    bloom: {
      async createBloomRun(input: BloomRunInput) {
        const createdAt = nowIso();
        const bloom: BloomRun = {
          id: createId("bloom"),
          localDate: input.localDate,
          startedAt: input.startedAt ?? createdAt,
          completedAt: input.completedAt ?? null,
          isCompleted: input.isCompleted ?? false,
          choice: input.choice ?? null,
          storyCardId: input.storyCardId ?? null,
          petalsAwarded: input.petalsAwarded ?? 0,
          stickerItemId: input.stickerItemId ?? null,
          createdAt,
        };
        updateStore((store) => {
          store.bloomRuns.push(bloom);
        });
        return bloom;
      },
      async updateBloomRun(id: string, update: BloomRunUpdate) {
        let updated: BloomRun | null = null;
        updateStore((store) => {
          const index = store.bloomRuns.findIndex((run) => run.id === id);
          if (index < 0) {
            throw new Error("Bloom run not found.");
          }
          const current = store.bloomRuns[index];
          updated = {
            ...current,
            localDate: update.localDate ?? current.localDate,
            startedAt: update.startedAt ?? current.startedAt,
            completedAt:
              update.completedAt !== undefined ? update.completedAt : current.completedAt,
            isCompleted: update.isCompleted ?? current.isCompleted,
            choice: update.choice ?? current.choice,
            storyCardId:
              update.storyCardId !== undefined ? update.storyCardId : current.storyCardId,
            petalsAwarded: update.petalsAwarded ?? current.petalsAwarded,
            stickerItemId:
              update.stickerItemId !== undefined
                ? update.stickerItemId
                : current.stickerItemId,
          };
          store.bloomRuns[index] = updated!;
        });
        if (!updated) {
          throw new Error("Bloom run not found.");
        }
        return updated;
      },
      async createStoryCardInstance(input: StoryCardInstanceInput) {
        const instance: StoryCardInstance = {
          id: createId("story_instance"),
          storyCardId: input.storyCardId,
          bloomRunId: input.bloomRunId ?? null,
          choice: input.choice ?? null,
          reflectionText: input.reflectionText ?? null,
          createdAt: nowIso(),
        };
        updateStore((store) => {
          store.storyCardInstances.push(instance);
        });
        return instance;
      },
      async updateStoryCardInstance(
        id: string,
        update: Partial<StoryCardInstanceInput>
      ) {
        let updated: StoryCardInstance | null = null;
        updateStore((store) => {
          const index = store.storyCardInstances.findIndex(
            (instance) => instance.id === id
          );
          if (index < 0) {
            throw new Error("Story card instance not found.");
          }
          const current = store.storyCardInstances[index];
          updated = {
            ...current,
            storyCardId: update.storyCardId ?? current.storyCardId,
            bloomRunId:
              update.bloomRunId !== undefined ? update.bloomRunId : current.bloomRunId,
            choice: update.choice ?? current.choice,
            reflectionText:
              update.reflectionText !== undefined
                ? update.reflectionText
                : current.reflectionText,
          };
          store.storyCardInstances[index] = updated!;
        });
        if (!updated) {
          throw new Error("Story card instance not found.");
        }
        return updated;
      },
      async listStoryCardInstances() {
        return sortByCreatedAtDesc(getStore().storyCardInstances);
      },
    },
  };
}
