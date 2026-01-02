import type { AppRepos } from "@sappy/shared/repos";
import type {
  ActivitySessionInput,
  CheckinInput,
  Goal,
  RewardEvent,
  StoryCard,
} from "@sappy/shared/types";

import { computeRewards } from "./rewards";
import { generateDailyQuests, type QuestTemplate } from "./quests";
import { getQuestProgressDelta } from "./questProgress";
import { getLocalDate } from "../utils/date";

const BLOOM_THRESHOLD = 60;

function clampCharge(value: number) {
  return Math.min(100, Math.max(0, value));
}

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickStoryCard(cards: StoryCard[], seed: string) {
  if (cards.length === 0) {
    throw new Error("No story cards available.");
  }
  const hash = hashSeed(seed);
  return cards[hash % cards.length];
}

function applyTraitDeltas(traits: Record<string, unknown>, deltas: Record<string, unknown>) {
  const nextTraits = { ...traits };

  Object.entries(deltas).forEach(([key, rawDelta]) => {
    const delta =
      typeof rawDelta === "number" ? rawDelta : Number(rawDelta);
    if (!Number.isFinite(delta)) {
      return;
    }
    const current =
      typeof nextTraits[key] === "number"
        ? (nextTraits[key] as number)
        : Number(nextTraits[key] ?? 0);
    nextTraits[key] = (Number.isFinite(current) ? current : 0) + delta;
  });

  return nextTraits;
}

async function applyRewardEvent(repos: AppRepos, event: RewardEvent) {
  const companion = await repos.companion.getCompanion();
  if (!companion) {
    throw new Error("Companion not found.");
  }
  const reward = computeRewards(event);

  const updatedCompanion = await repos.companion.updateCompanion(companion.id, {
    charge: clampCharge(companion.charge + reward.chargeDelta),
    petalsBalance: companion.petalsBalance + reward.petalsDelta,
  });

  await repos.rewards.addLedgerEntry({
    eventType: event.type,
    sourceType: event.type,
    sourceId:
      "checkinId" in event
        ? event.checkinId
        : "completionId" in event
          ? event.completionId
          : "sessionId" in event
            ? event.sessionId
            : "questId" in event
              ? event.questId
              : event.bloomRunId,
    chargeDelta: reward.chargeDelta,
    petalsDelta: reward.petalsDelta,
  });

  return { reward, companion: updatedCompanion };
}

async function updateQuestProgress(
  repos: AppRepos,
  event: RewardEvent,
  localDate: string
) {
  const quests = await repos.quests.listQuests({ localDate });
  const validQuestTypes = new Set<QuestTemplate["type"]>([
    "checkin_1",
    "goals_3",
    "activity_1",
  ]);

  await Promise.all(
    quests.map(async (quest) => {
      if (!validQuestTypes.has(quest.questType as QuestTemplate["type"])) {
        return;
      }
      if (quest.progress >= quest.target) {
        return;
      }
      const delta = getQuestProgressDelta(
        quest.questType as QuestTemplate["type"],
        event
      );
      if (delta <= 0) {
        return;
      }
      await repos.quests.updateQuest(quest.id, {
        progress: Math.min(quest.target, quest.progress + delta),
      });
    })
  );
}

export async function ensureDailyQuests(repos: AppRepos, localDate?: string) {
  const date = localDate ?? getLocalDate();
  const existing = await repos.quests.listQuests({ localDate: date });
  if (existing.length > 0) {
    return existing;
  }

  const templates = generateDailyQuests(date);
  return Promise.all(
    templates.map((template) =>
      repos.quests.createQuest({
        localDate: date,
        questType: template.type,
        target: template.target,
        progress: 0,
        rewardPetals: 10,
        isClaimed: false,
      })
    )
  );
}

export async function recordCheckin(repos: AppRepos, input: CheckinInput) {
  const checkin = await repos.checkins.createCheckin(input);
  const event: RewardEvent = { type: "checkin", checkinId: checkin.id };
  await applyRewardEvent(repos, event);
  await updateQuestProgress(repos, event, input.localDate);
  return checkin;
}

export async function completeGoal(
  repos: AppRepos,
  goal: Goal,
  localDate: string
) {
  const completion = await repos.goals.createCompletion({
    goalId: goal.id,
    localDate,
  });
  const event: RewardEvent = {
    type: "goal_complete",
    goalId: goal.id,
    completionId: completion.id,
  };
  await applyRewardEvent(repos, event);
  await updateQuestProgress(repos, event, localDate);
  return completion;
}

export async function recordActivity(
  repos: AppRepos,
  input: ActivitySessionInput
) {
  const session = await repos.activity.createSession(input);
  const event: RewardEvent = {
    type: "activity_complete",
    sessionId: session.id,
    activityType: session.activityType,
  };
  await applyRewardEvent(repos, event);
  await updateQuestProgress(repos, event, input.localDate);
  return session;
}

export async function claimQuest(repos: AppRepos, questId: string) {
  const quests = await repos.quests.listQuests();
  const quest = quests.find((item) => item.id === questId);
  if (!quest) {
    throw new Error("Quest not found.");
  }
  if (quest.isClaimed) {
    return quest;
  }

  await repos.quests.updateQuest(quest.id, {
    isClaimed: true,
    claimedAt: new Date().toISOString(),
  });

  const event: RewardEvent = { type: "quest_claim", questId: quest.id };
  await applyRewardEvent(repos, event);
  return quest;
}

export async function purchaseItem(repos: AppRepos, itemId: string) {
  const companion = await repos.companion.getCompanion();
  if (!companion) {
    throw new Error("Companion not found.");
  }

  const items = await repos.shop.listItems();
  const item = items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error("Item not found.");
  }

  if (companion.petalsBalance < item.pricePetals) {
    throw new Error("Not enough petals.");
  }

  await repos.rewards.addLedgerEntry({
    eventType: "purchase",
    sourceType: "item",
    sourceId: item.id,
    petalsDelta: -item.pricePetals,
    chargeDelta: 0,
  });

  await repos.companion.updateCompanion(companion.id, {
    petalsBalance: companion.petalsBalance - item.pricePetals,
  });

  return repos.shop.addUserItem(item.id, {
    source: "shop",
  });
}

export async function startBloom(repos: AppRepos, localDate?: string) {
  const companion = await repos.companion.getCompanion();
  if (!companion) {
    throw new Error("Companion not found.");
  }

  if (companion.charge < BLOOM_THRESHOLD) {
    throw new Error("Charge too low to bloom.");
  }

  const date = localDate ?? getLocalDate();
  const storyCards = await repos.shop.listStoryCards();
  const selectedCard = pickStoryCard(storyCards, date);

  const bloomRun = await repos.bloom.createBloomRun({
    localDate: date,
    storyCardId: selectedCard.id,
    startedAt: new Date().toISOString(),
  });

  const instance = await repos.bloom.createStoryCardInstance({
    storyCardId: selectedCard.id,
    bloomRunId: bloomRun.id,
  });

  return { bloomRun, storyCard: selectedCard, instance };
}

export async function completeBloom(
  repos: AppRepos,
  bloomRunId: string,
  storyInstanceId: string,
  choice: "a" | "b",
  reflectionText?: string
) {
  const companion = await repos.companion.getCompanion();
  if (!companion) {
    throw new Error("Companion not found.");
  }

  const completedAt = new Date().toISOString();
  await repos.bloom.updateBloomRun(bloomRunId, {
    isCompleted: true,
    completedAt,
    choice,
  });

  await repos.bloom.updateStoryCardInstance(storyInstanceId, {
    choice,
    reflectionText: reflectionText ?? null,
  });

  const [instances, storyCards] = await Promise.all([
    repos.bloom.listStoryCardInstances(),
    repos.shop.listStoryCards(),
  ]);
  const instance = instances.find((item) => item.id === storyInstanceId);
  const storyCard = storyCards.find(
    (card) => card.id === instance?.storyCardId
  );
  const traitDeltas = storyCard
    ? choice === "a"
      ? storyCard.choiceATraitDeltas
      : storyCard.choiceBTraitDeltas
    : {};
  const nextTraits = applyTraitDeltas(companion.traits, traitDeltas);

  const event: RewardEvent = { type: "bloom_complete", bloomRunId };
  const reward = computeRewards(event);
  const petalsAwarded = reward.petalsDelta;

  let stickerItemId: string | null = null;
  const items = await repos.shop.listItems();
  const stickerItems = items.filter((item) => item.category === "sticker");
  if (stickerItems.length > 0 && Math.random() < 0.15) {
    const selected = stickerItems[Math.floor(Math.random() * stickerItems.length)];
    stickerItemId = selected.id;
    await repos.shop.addUserItem(selected.id, { source: "bloom" });
  }

  await repos.bloom.updateBloomRun(bloomRunId, {
    petalsAwarded,
    stickerItemId: stickerItemId ?? undefined,
  });

  await repos.rewards.addLedgerEntry({
    eventType: event.type,
    sourceType: "bloom",
    sourceId: bloomRunId,
    chargeDelta: 0,
    petalsDelta: petalsAwarded,
  });

  const updatedCompanion = await repos.companion.updateCompanion(companion.id, {
    charge: 0,
    petalsBalance: companion.petalsBalance + petalsAwarded,
    traits: nextTraits,
  });

  await updateQuestProgress(repos, event, getLocalDate());

  return {
    companion: updatedCompanion,
    petalsAwarded,
    stickerItemId,
  };
}
