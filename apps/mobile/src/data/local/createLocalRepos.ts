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
  JsonMap,
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

import { ensureLocalDb, executeSql, getAll, getFirst } from "./db";
import { createId, nowIso, parseJson, toJson } from "./utils";

type CompanionRow = {
  id: string;
  palette_id: string;
  charge: number;
  petals_balance: number;
  traits: string;
  equipped_item_ids: string;
  created_at: string;
  updated_at: string;
};

type GoalRow = {
  id: string;
  title: string;
  details: string | null;
  schedule: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
};

type GoalCompletionRow = {
  id: string;
  goal_id: string;
  local_date: string;
  created_at: string;
};

type CheckinRow = {
  id: string;
  local_date: string;
  mood: number;
  note: string | null;
  created_at: string;
};

type ActivitySessionRow = {
  id: string;
  local_date: string;
  activity_type: string;
  duration_seconds: number | null;
  note: string | null;
  metadata: string;
  created_at: string;
};

type QuestRow = {
  id: string;
  local_date: string;
  quest_type: string;
  target: number;
  progress: number;
  reward_petals: number;
  is_claimed: number;
  claimed_at: string | null;
  created_at: string;
};

type RewardLedgerRow = {
  id: string;
  event_type: string;
  source_type: string | null;
  source_id: string | null;
  charge_delta: number;
  petals_delta: number;
  created_at: string;
};

type BloomRunRow = {
  id: string;
  local_date: string;
  started_at: string;
  completed_at: string | null;
  is_completed: number;
  choice: "a" | "b" | null;
  story_card_id: string | null;
  petals_awarded: number;
  sticker_item_id: string | null;
  created_at: string;
};

type ItemRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string;
  price_petals: number;
  metadata: string;
  created_at: string;
};

type UserItemRow = {
  id: string;
  item_id: string;
  acquired_at: string;
  metadata: string;
};

type StoryCardRow = {
  id: string;
  title: string;
  body: string;
  choice_a_text: string;
  choice_b_text: string;
  choice_a_trait_deltas: string;
  choice_b_trait_deltas: string;
  rarity: string;
  created_at: string;
};

type StoryCardInstanceRow = {
  id: string;
  story_card_id: string;
  bloom_run_id: string | null;
  choice: "a" | "b" | null;
  reflection_text: string | null;
  created_at: string;
};

type FriendRow = {
  id: string;
  friend_code: string;
  display_name: string;
  created_at: string;
};

type SupportNoteRow = {
  id: string;
  friend_id: string | null;
  direction: "incoming" | "outgoing";
  message: string;
  created_at: string;
};

function mapCompanionRow(row: CompanionRow): Companion {
  return {
    id: row.id,
    paletteId: row.palette_id as PaletteId,
    charge: row.charge,
    petalsBalance: row.petals_balance,
    traits: parseJson<JsonMap>(row.traits, {}),
    equippedItemIds: parseJson<string[]>(row.equipped_item_ids, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGoalRow(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    schedule: parseJson<JsonMap>(row.schedule, {}),
    isArchived: row.is_archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGoalCompletionRow(row: GoalCompletionRow): GoalCompletion {
  return {
    id: row.id,
    goalId: row.goal_id,
    localDate: row.local_date,
    createdAt: row.created_at,
  };
}

function mapCheckinRow(row: CheckinRow): Checkin {
  return {
    id: row.id,
    localDate: row.local_date,
    mood: row.mood as Checkin["mood"],
    note: row.note,
    createdAt: row.created_at,
  };
}

function mapActivityRow(row: ActivitySessionRow): ActivitySession {
  return {
    id: row.id,
    localDate: row.local_date,
    activityType: row.activity_type as ActivitySession["activityType"],
    durationSeconds: row.duration_seconds,
    note: row.note,
    metadata: parseJson<JsonMap>(row.metadata, {}),
    createdAt: row.created_at,
  };
}

function mapQuestRow(row: QuestRow): Quest {
  return {
    id: row.id,
    localDate: row.local_date,
    questType: row.quest_type,
    target: row.target,
    progress: row.progress,
    rewardPetals: row.reward_petals,
    isClaimed: row.is_claimed === 1,
    claimedAt: row.claimed_at,
    createdAt: row.created_at,
  };
}

function mapRewardRow(row: RewardLedgerRow): RewardLedgerEntry {
  return {
    id: row.id,
    eventType: row.event_type,
    sourceType: row.source_type,
    sourceId: row.source_id,
    chargeDelta: row.charge_delta,
    petalsDelta: row.petals_delta,
    createdAt: row.created_at,
  };
}

function mapBloomRunRow(row: BloomRunRow): BloomRun {
  return {
    id: row.id,
    localDate: row.local_date,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    isCompleted: row.is_completed === 1,
    choice: row.choice,
    storyCardId: row.story_card_id,
    petalsAwarded: row.petals_awarded,
    stickerItemId: row.sticker_item_id,
    createdAt: row.created_at,
  };
}

function mapItemRow(row: ItemRow): Item {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    pricePetals: row.price_petals,
    metadata: parseJson<JsonMap>(row.metadata, {}),
    createdAt: row.created_at,
  };
}

function mapUserItemRow(row: UserItemRow): UserItem {
  return {
    id: row.id,
    itemId: row.item_id,
    acquiredAt: row.acquired_at,
    metadata: parseJson<JsonMap>(row.metadata, {}),
  };
}

function mapStoryCardRow(row: StoryCardRow): StoryCard {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    choiceAText: row.choice_a_text,
    choiceBText: row.choice_b_text,
    choiceATraitDeltas: parseJson<JsonMap>(row.choice_a_trait_deltas, {}),
    choiceBTraitDeltas: parseJson<JsonMap>(row.choice_b_trait_deltas, {}),
    rarity: row.rarity,
    createdAt: row.created_at,
  };
}

function mapStoryCardInstanceRow(
  row: StoryCardInstanceRow
): StoryCardInstance {
  return {
    id: row.id,
    storyCardId: row.story_card_id,
    bloomRunId: row.bloom_run_id,
    choice: row.choice,
    reflectionText: row.reflection_text,
    createdAt: row.created_at,
  };
}

function mapFriendRow(row: FriendRow): Friend {
  return {
    id: row.id,
    friendCode: row.friend_code,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

function mapSupportNoteRow(row: SupportNoteRow): SupportNote {
  return {
    id: row.id,
    friendId: row.friend_id ?? null,
    direction: row.direction,
    message: row.message,
    createdAt: row.created_at,
  };
}

async function getCompanionById(id: string) {
  const row = await getFirst<CompanionRow>(
    "select * from companions where id = ? limit 1",
    [id]
  );
  return row ? mapCompanionRow(row) : null;
}

async function getGoalById(id: string) {
  const row = await getFirst<GoalRow>("select * from goals where id = ? limit 1", [
    id,
  ]);
  return row ? mapGoalRow(row) : null;
}

async function getGoalCompletionById(id: string) {
  const row = await getFirst<GoalCompletionRow>(
    "select * from goal_completions where id = ? limit 1",
    [id]
  );
  return row ? mapGoalCompletionRow(row) : null;
}

async function getGoalCompletionForDate(goalId: string, localDate: string) {
  const row = await getFirst<GoalCompletionRow>(
    "select * from goal_completions where goal_id = ? and local_date = ? limit 1",
    [goalId, localDate]
  );
  return row ? mapGoalCompletionRow(row) : null;
}

async function getBloomRunById(id: string) {
  const row = await getFirst<BloomRunRow>(
    "select * from bloom_runs where id = ? limit 1",
    [id]
  );
  return row ? mapBloomRunRow(row) : null;
}

async function getStoryCardInstanceById(id: string) {
  const row = await getFirst<StoryCardInstanceRow>(
    "select * from story_card_instances where id = ? limit 1",
    [id]
  );
  return row ? mapStoryCardInstanceRow(row) : null;
}

function generateFriendCode() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `SEAL-${digits}`;
}

async function getFriendById(id: string) {
  const row = await getFirst<FriendRow>(
    "select * from friends where id = ? limit 1",
    [id]
  );
  return row ? mapFriendRow(row) : null;
}

async function getFriendByCode(friendCode: string) {
  const row = await getFirst<FriendRow>(
    "select * from friends where friend_code = ? limit 1",
    [friendCode]
  );
  return row ? mapFriendRow(row) : null;
}

async function getSupportNoteById(id: string) {
  const row = await getFirst<SupportNoteRow>(
    "select * from support_notes where id = ? limit 1",
    [id]
  );
  return row ? mapSupportNoteRow(row) : null;
}

export function createLocalRepos(): AppRepos {
  ensureLocalDb().catch((error) => {
    console.warn("Local DB init failed", error);
  });

  return {
    user: {
      async getSettings() {
        const row = await getFirst<{ value: string }>(
          "select value from meta where key = ?",
          ["pause_mode"]
        );
        return {
          pauseMode: row?.value === "true",
        };
      },
      async updateSettings(update: Partial<AppSettings>) {
        const current = await this.getSettings();
        const next = {
          ...current,
          ...update,
        };

        await executeSql(
          "insert into meta (key, value) values (?, ?) on conflict(key) do update set value = excluded.value",
          ["pause_mode", String(next.pauseMode)]
        );

        return next;
      },
    },
    companion: {
      async getCompanion() {
        const row = await getFirst<CompanionRow>(
          "select * from companions limit 1"
        );
        return row ? mapCompanionRow(row) : null;
      },
      async createCompanion(input: CompanionInput) {
        const id = createId("companion");
        const createdAt = nowIso();
        const paletteId = input.paletteId ?? defaultPaletteId;
        const charge = input.charge ?? 0;
        const petalsBalance = input.petalsBalance ?? 0;
        const traits = input.traits ?? {};
        const equippedItemIds = input.equippedItemIds ?? [];

        await executeSql(
          `insert into companions
           (id, palette_id, charge, petals_balance, traits, equipped_item_ids, created_at, updated_at)
           values (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            paletteId,
            charge,
            petalsBalance,
            toJson(traits),
            toJson(equippedItemIds),
            createdAt,
            createdAt,
          ]
        );

        const companion = await getCompanionById(id);
        if (!companion) {
          throw new Error("Failed to create companion.");
        }
        return companion;
      },
      async updateCompanion(id: string, update: CompanionInput) {
        const existing = await getCompanionById(id);
        if (!existing) {
          throw new Error("Companion not found.");
        }

        const next: Companion = {
          ...existing,
          paletteId: update.paletteId ?? existing.paletteId,
          charge: update.charge ?? existing.charge,
          petalsBalance: update.petalsBalance ?? existing.petalsBalance,
          traits: update.traits ?? existing.traits,
          equippedItemIds: update.equippedItemIds ?? existing.equippedItemIds,
          updatedAt: nowIso(),
        };

        await executeSql(
          `update companions
           set palette_id = ?, charge = ?, petals_balance = ?, traits = ?, equipped_item_ids = ?, updated_at = ?
           where id = ?`,
          [
            next.paletteId,
            next.charge,
            next.petalsBalance,
            toJson(next.traits),
            toJson(next.equippedItemIds),
            next.updatedAt,
            id,
          ]
        );

        const companion = await getCompanionById(id);
        if (!companion) {
          throw new Error("Failed to update companion.");
        }
        return companion;
      },
    },
    goals: {
      async listGoals(options) {
        const includeArchived = options?.includeArchived ?? false;
        const rows = await getAll<GoalRow>(
          `select * from goals ${includeArchived ? "" : "where is_archived = 0"} order by created_at desc`
        );
        return rows.map(mapGoalRow);
      },
      async createGoal(input: GoalInput) {
        const id = createId("goal");
        const createdAt = nowIso();
        const schedule = input.schedule ?? {};
        const isArchived = input.isArchived ? 1 : 0;

        await executeSql(
          `insert into goals
           (id, title, details, schedule, is_archived, created_at, updated_at)
           values (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            input.title,
            input.details ?? null,
            toJson(schedule),
            isArchived,
            createdAt,
            createdAt,
          ]
        );

        const goal = await getGoalById(id);
        if (!goal) {
          throw new Error("Failed to create goal.");
        }
        return goal;
      },
      async updateGoal(id: string, update: GoalUpdate) {
        const existing = await getGoalById(id);
        if (!existing) {
          throw new Error("Goal not found.");
        }

        const next: Goal = {
          ...existing,
          title: update.title ?? existing.title,
          details:
            update.details !== undefined ? update.details : existing.details,
          schedule: update.schedule ?? existing.schedule,
          isArchived: update.isArchived ?? existing.isArchived,
          updatedAt: nowIso(),
        };

        await executeSql(
          `update goals
           set title = ?, details = ?, schedule = ?, is_archived = ?, updated_at = ?
           where id = ?`,
          [
            next.title,
            next.details ?? null,
            toJson(next.schedule),
            next.isArchived ? 1 : 0,
            next.updatedAt,
            id,
          ]
        );

        const goal = await getGoalById(id);
        if (!goal) {
          throw new Error("Failed to update goal.");
        }
        return goal;
      },
      async listCompletions(options) {
        const clauses: string[] = [];
        const params: (string | number | null)[] = [];

        if (options?.localDate) {
          clauses.push("local_date = ?");
          params.push(options.localDate);
        }
        if (options?.goalId) {
          clauses.push("goal_id = ?");
          params.push(options.goalId);
        }

        const where = clauses.length > 0 ? `where ${clauses.join(" and ")}` : "";
        const rows = await getAll<GoalCompletionRow>(
          `select * from goal_completions ${where} order by created_at desc`,
          params
        );
        return rows.map(mapGoalCompletionRow);
      },
      async createCompletion(input: GoalCompletionInput) {
        const existing = await getGoalCompletionForDate(
          input.goalId,
          input.localDate
        );
        if (existing) {
          return existing;
        }

        const id = createId("completion");
        const createdAt = nowIso();

        await executeSql(
          `insert into goal_completions (id, goal_id, local_date, created_at)
           values (?, ?, ?, ?)`,
          [id, input.goalId, input.localDate, createdAt]
        );

        const completion = await getGoalCompletionById(id);
        if (!completion) {
          throw new Error("Failed to create completion.");
        }
        return completion;
      },
    },
    checkins: {
      async listCheckins(options) {
        const clauses: string[] = [];
        const params: (string | number | null)[] = [];

        if (options?.fromDate) {
          clauses.push("local_date >= ?");
          params.push(options.fromDate);
        }
        if (options?.toDate) {
          clauses.push("local_date <= ?");
          params.push(options.toDate);
        }

        const where = clauses.length > 0 ? `where ${clauses.join(" and ")}` : "";
        const limit = options?.limit ? `limit ${options.limit}` : "";

        const rows = await getAll<CheckinRow>(
          `select * from checkins ${where} order by local_date desc, created_at desc ${limit}`,
          params
        );
        return rows.map(mapCheckinRow);
      },
      async createCheckin(input: CheckinInput) {
        const id = createId("checkin");
        const createdAt = nowIso();

        await executeSql(
          `insert into checkins (id, local_date, mood, note, created_at)
           values (?, ?, ?, ?, ?)`,
          [id, input.localDate, input.mood, input.note ?? null, createdAt]
        );

        return {
          id,
          localDate: input.localDate,
          mood: input.mood,
          note: input.note ?? null,
          createdAt,
        };
      },
    },
    activity: {
      async listSessions(options) {
        const clauses: string[] = [];
        const params: (string | number | null)[] = [];

        if (options?.fromDate) {
          clauses.push("local_date >= ?");
          params.push(options.fromDate);
        }
        if (options?.toDate) {
          clauses.push("local_date <= ?");
          params.push(options.toDate);
        }

        const where = clauses.length > 0 ? `where ${clauses.join(" and ")}` : "";
        const limit = options?.limit ? `limit ${options.limit}` : "";

        const rows = await getAll<ActivitySessionRow>(
          `select * from activity_sessions ${where} order by local_date desc, created_at desc ${limit}`,
          params
        );
        return rows.map(mapActivityRow);
      },
      async createSession(input: ActivitySessionInput) {
        const id = createId("activity");
        const createdAt = nowIso();

        await executeSql(
          `insert into activity_sessions
           (id, activity_type, local_date, duration_seconds, note, metadata, created_at)
           values (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            input.activityType,
            input.localDate,
            input.durationSeconds ?? null,
            input.note ?? null,
            toJson(input.metadata ?? {}),
            createdAt,
          ]
        );

        return {
          id,
          localDate: input.localDate,
          activityType: input.activityType,
          durationSeconds: input.durationSeconds ?? null,
          note: input.note ?? null,
          metadata: input.metadata ?? {},
          createdAt,
        };
      },
    },
    quests: {
      async listQuests(options) {
        const params: (string | number | null)[] = [];
        const where = options?.localDate ? "where local_date = ?" : "";
        if (options?.localDate) {
          params.push(options.localDate);
        }

        const rows = await getAll<QuestRow>(
          `select * from quests ${where} order by created_at desc`,
          params
        );
        return rows.map(mapQuestRow);
      },
      async createQuest(input: QuestInput) {
        const id = createId("quest");
        const createdAt = nowIso();

        await executeSql(
          `insert into quests
           (id, local_date, quest_type, target, progress, reward_petals, is_claimed, claimed_at, created_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            input.localDate,
            input.questType,
            input.target,
            input.progress ?? 0,
            input.rewardPetals ?? 0,
            input.isClaimed ? 1 : 0,
            input.claimedAt ?? null,
            createdAt,
          ]
        );

        return {
          id,
          localDate: input.localDate,
          questType: input.questType,
          target: input.target,
          progress: input.progress ?? 0,
          rewardPetals: input.rewardPetals ?? 0,
          isClaimed: input.isClaimed ?? false,
          claimedAt: input.claimedAt ?? null,
          createdAt,
        };
      },
      async updateQuest(id: string, update: QuestUpdate) {
        const existing = await getFirst<QuestRow>(
          "select * from quests where id = ? limit 1",
          [id]
        );
        if (!existing) {
          throw new Error("Quest not found.");
        }

        const next: Quest = {
          ...mapQuestRow(existing),
          localDate: update.localDate ?? existing.local_date,
          questType: update.questType ?? existing.quest_type,
          target: update.target ?? existing.target,
          progress: update.progress ?? existing.progress,
          rewardPetals: update.rewardPetals ?? existing.reward_petals,
          isClaimed: update.isClaimed ?? (existing.is_claimed === 1),
          claimedAt:
            update.claimedAt !== undefined
              ? update.claimedAt
              : existing.claimed_at,
        };

        await executeSql(
          `update quests
           set local_date = ?, quest_type = ?, target = ?, progress = ?, reward_petals = ?, is_claimed = ?, claimed_at = ?
           where id = ?`,
          [
            next.localDate,
            next.questType,
            next.target,
            next.progress,
            next.rewardPetals,
            next.isClaimed ? 1 : 0,
            next.claimedAt ?? null,
            id,
          ]
        );

        return next;
      },
    },
    rewards: {
      async listLedgerEntries(options) {
        const limit = options?.limit ? `limit ${options.limit}` : "";
        const rows = await getAll<RewardLedgerRow>(
          `select * from rewards_ledger order by created_at desc ${limit}`
        );
        return rows.map(mapRewardRow);
      },
      async addLedgerEntry(input: RewardLedgerEntryInput) {
        const id = createId("ledger");
        const createdAt = nowIso();

        await executeSql(
          `insert into rewards_ledger
           (id, event_type, source_type, source_id, charge_delta, petals_delta, created_at)
           values (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            input.eventType,
            input.sourceType ?? null,
            input.sourceId ?? null,
            input.chargeDelta ?? 0,
            input.petalsDelta ?? 0,
            createdAt,
          ]
        );

        return {
          id,
          eventType: input.eventType,
          sourceType: input.sourceType ?? null,
          sourceId: input.sourceId ?? null,
          chargeDelta: input.chargeDelta ?? 0,
          petalsDelta: input.petalsDelta ?? 0,
          createdAt,
        };
      },
    },
    shop: {
      async listItems() {
        const rows = await getAll<ItemRow>(
          "select * from items order by price_petals asc"
        );
        return rows.map(mapItemRow);
      },
      async listStoryCards() {
        const rows = await getAll<StoryCardRow>(
          "select * from story_cards order by created_at desc"
        );
        return rows.map(mapStoryCardRow);
      },
      async listInventory() {
        const rows = await getAll<UserItemRow>(
          "select * from user_items order by acquired_at desc"
        );
        return rows.map(mapUserItemRow);
      },
      async addUserItem(itemId: string, metadata?: Record<string, unknown>) {
        const id = createId("user_item");
        const acquiredAt = nowIso();

        await executeSql(
          `insert into user_items (id, item_id, acquired_at, metadata)
           values (?, ?, ?, ?)`,
          [id, itemId, acquiredAt, toJson(metadata ?? {})]
        );

        return {
          id,
          itemId,
          acquiredAt,
          metadata: metadata ?? {},
        };
      },
    },
    friends: {
      async getFriendCode() {
        const row = await getFirst<{ value: string }>(
          "select value from meta where key = ?",
          ["friend_code"]
        );
        if (row?.value) {
          return row.value;
        }
        const code = generateFriendCode();
        await executeSql(
          "insert into meta (key, value) values (?, ?) on conflict(key) do update set value = excluded.value",
          ["friend_code", code]
        );
        return code;
      },
      async listFriends() {
        const rows = await getAll<FriendRow>(
          "select * from friends order by created_at desc"
        );
        return rows.map(mapFriendRow);
      },
      async addFriend(input: FriendInput) {
        const friendCode = input.friendCode.trim().toUpperCase();
        const displayName = input.displayName.trim() || "Seal buddy";
        const existing = await getFriendByCode(friendCode);
        if (existing) {
          return existing;
        }

        const id = createId("friend");
        const createdAt = nowIso();
        await executeSql(
          `insert into friends (id, friend_code, display_name, created_at)
           values (?, ?, ?, ?)`,
          [id, friendCode, displayName, createdAt]
        );

        const friend = await getFriendById(id);
        if (!friend) {
          throw new Error("Failed to add friend.");
        }
        return friend;
      },
      async listSupportNotes(options) {
        const clauses: string[] = [];
        const params: (string | number | null)[] = [];

        if (options?.friendId) {
          clauses.push("friend_id = ?");
          params.push(options.friendId);
        }

        const where = clauses.length > 0 ? `where ${clauses.join(" and ")}` : "";
        const limit = options?.limit ? `limit ${options.limit}` : "";
        const rows = await getAll<SupportNoteRow>(
          `select * from support_notes ${where} order by created_at desc ${limit}`,
          params
        );
        return rows.map(mapSupportNoteRow);
      },
      async addSupportNote(input: SupportNoteInput) {
        const id = createId("note");
        const createdAt = nowIso();
        const direction = input.direction ?? "outgoing";

        await executeSql(
          `insert into support_notes (id, friend_id, direction, message, created_at)
           values (?, ?, ?, ?, ?)`,
          [id, input.friendId ?? null, direction, input.message, createdAt]
        );

        const note = await getSupportNoteById(id);
        if (!note) {
          throw new Error("Failed to add support note.");
        }
        return note;
      },
    },
    bloom: {
      async createBloomRun(input: BloomRunInput) {
        const id = createId("bloom");
        const startedAt = input.startedAt ?? nowIso();
        const createdAt = nowIso();
        const isCompleted = input.isCompleted ? 1 : 0;

        await executeSql(
          `insert into bloom_runs
           (id, local_date, started_at, completed_at, is_completed, choice, story_card_id, petals_awarded, sticker_item_id, created_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            input.localDate,
            startedAt,
            input.completedAt ?? null,
            isCompleted,
            input.choice ?? null,
            input.storyCardId ?? null,
            input.petalsAwarded ?? 0,
            input.stickerItemId ?? null,
            createdAt,
          ]
        );

        const bloom = await getBloomRunById(id);
        if (!bloom) {
          throw new Error("Failed to create bloom run.");
        }
        return bloom;
      },
      async updateBloomRun(id: string, update: BloomRunUpdate) {
        const existing = await getBloomRunById(id);
        if (!existing) {
          throw new Error("Bloom run not found.");
        }

        const next: BloomRun = {
          ...existing,
          localDate: update.localDate ?? existing.localDate,
          startedAt: update.startedAt ?? existing.startedAt,
          completedAt:
            update.completedAt !== undefined
              ? update.completedAt
              : existing.completedAt,
          isCompleted: update.isCompleted ?? existing.isCompleted,
          choice: update.choice ?? existing.choice,
          storyCardId:
            update.storyCardId !== undefined
              ? update.storyCardId
              : existing.storyCardId,
          petalsAwarded: update.petalsAwarded ?? existing.petalsAwarded,
          stickerItemId:
            update.stickerItemId !== undefined
              ? update.stickerItemId
              : existing.stickerItemId,
        };

        await executeSql(
          `update bloom_runs
           set local_date = ?, started_at = ?, completed_at = ?, is_completed = ?, choice = ?, story_card_id = ?, petals_awarded = ?, sticker_item_id = ?
           where id = ?`,
          [
            next.localDate,
            next.startedAt,
            next.completedAt ?? null,
            next.isCompleted ? 1 : 0,
            next.choice ?? null,
            next.storyCardId ?? null,
            next.petalsAwarded,
            next.stickerItemId ?? null,
            id,
          ]
        );

        const bloom = await getBloomRunById(id);
        if (!bloom) {
          throw new Error("Failed to update bloom run.");
        }
        return bloom;
      },
      async createStoryCardInstance(input: StoryCardInstanceInput) {
        const id = createId("story_instance");
        const createdAt = nowIso();

        await executeSql(
          `insert into story_card_instances
           (id, story_card_id, bloom_run_id, choice, reflection_text, created_at)
           values (?, ?, ?, ?, ?, ?)`,
          [
            id,
            input.storyCardId,
            input.bloomRunId ?? null,
            input.choice ?? null,
            input.reflectionText ?? null,
            createdAt,
          ]
        );

        const instance = await getStoryCardInstanceById(id);
        if (!instance) {
          throw new Error("Failed to create story card instance.");
        }
        return instance;
      },
      async updateStoryCardInstance(
        id: string,
        update: Partial<StoryCardInstanceInput>
      ) {
        const existing = await getStoryCardInstanceById(id);
        if (!existing) {
          throw new Error("Story card instance not found.");
        }

        const next: StoryCardInstance = {
          ...existing,
          storyCardId: update.storyCardId ?? existing.storyCardId,
          bloomRunId:
            update.bloomRunId !== undefined
              ? update.bloomRunId
              : existing.bloomRunId,
          choice: update.choice ?? existing.choice,
          reflectionText:
            update.reflectionText !== undefined
              ? update.reflectionText
              : existing.reflectionText,
        };

        await executeSql(
          `update story_card_instances
           set story_card_id = ?, bloom_run_id = ?, choice = ?, reflection_text = ?
           where id = ?`,
          [
            next.storyCardId,
            next.bloomRunId ?? null,
            next.choice ?? null,
            next.reflectionText ?? null,
            id,
          ]
        );

        const instance = await getStoryCardInstanceById(id);
        if (!instance) {
          throw new Error("Failed to update story card instance.");
        }
        return instance;
      },
      async listStoryCardInstances() {
        const rows = await getAll<StoryCardInstanceRow>(
          "select * from story_card_instances order by created_at desc"
        );
        return rows.map(mapStoryCardInstanceRow);
      },
    },
  };
}
