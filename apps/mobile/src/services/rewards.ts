import { RewardEvent } from "@sappy/shared/types";

export type RewardResult = {
  chargeDelta: number;
  petalsDelta: number;
  stickerAwardItemId?: string;
};

export function computeRewards(event: RewardEvent): RewardResult {
  switch (event.type) {
    case "checkin":
      return { chargeDelta: 10, petalsDelta: 2 };
    case "goal_complete":
      return { chargeDelta: 8, petalsDelta: 3 };
    case "activity_complete":
      return { chargeDelta: 6, petalsDelta: 2 };
    case "quest_claim":
      return { chargeDelta: 0, petalsDelta: 10 };
    case "bloom_complete":
      return { chargeDelta: 0, petalsDelta: 12 };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}
