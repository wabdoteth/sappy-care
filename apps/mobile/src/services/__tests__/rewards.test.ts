import { describe, expect, it } from "vitest";

import { computeRewards } from "../rewards";

describe("computeRewards", () => {
  it("returns checkin rewards", () => {
    expect(computeRewards({ type: "checkin", checkinId: "checkin-1" })).toEqual({
      chargeDelta: 10,
      petalsDelta: 2,
    });
  });

  it("returns goal completion rewards", () => {
    expect(
      computeRewards({
        type: "goal_complete",
        goalId: "goal-1",
        completionId: "completion-1",
      })
    ).toEqual({
      chargeDelta: 8,
      petalsDelta: 3,
    });
  });

  it("returns activity completion rewards", () => {
    expect(
      computeRewards({
        type: "activity_complete",
        sessionId: "session-1",
        activityType: "breathe",
      })
    ).toEqual({
      chargeDelta: 6,
      petalsDelta: 2,
    });
  });

  it("returns quest claim rewards", () => {
    expect(computeRewards({ type: "quest_claim", questId: "quest-1" })).toEqual({
      chargeDelta: 0,
      petalsDelta: 10,
    });
  });

  it("returns bloom completion rewards", () => {
    expect(computeRewards({ type: "bloom_complete", bloomRunId: "bloom-1" })).toEqual({
      chargeDelta: 0,
      petalsDelta: 12,
    });
  });
});
