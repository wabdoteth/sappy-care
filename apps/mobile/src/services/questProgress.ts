import type { RewardEvent } from "@sappy/shared/types";
import type { QuestTemplate } from "./quests";

export function getQuestProgressDelta(
  questType: QuestTemplate["type"],
  event: RewardEvent
) {
  if (questType === "checkin_1" && event.type === "checkin") {
    return 1;
  }
  if (questType === "goals_3" && event.type === "goal_complete") {
    return 1;
  }
  if (questType === "activity_1" && event.type === "activity_complete") {
    return 1;
  }
  return 0;
}
