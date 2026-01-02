export type QuestTemplate =
  | { type: "checkin_1"; target: 1 }
  | { type: "goals_3"; target: 3 }
  | { type: "activity_1"; target: 1 };

export function generateDailyQuests(_seed: string): QuestTemplate[] {
  return [
    { type: "checkin_1", target: 1 },
    { type: "goals_3", target: 3 },
    { type: "activity_1", target: 1 },
  ];
}
