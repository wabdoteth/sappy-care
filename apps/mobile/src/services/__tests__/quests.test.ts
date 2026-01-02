import { describe, expect, it } from "vitest";

import { generateDailyQuests } from "../quests";

describe("generateDailyQuests", () => {
  it("returns the baseline quest templates", () => {
    const quests = generateDailyQuests("2025-12-30");

    expect(quests).toHaveLength(3);
    expect(quests.map((quest) => quest.type)).toEqual([
      "checkin_1",
      "goals_3",
      "activity_1",
    ]);
  });
});
