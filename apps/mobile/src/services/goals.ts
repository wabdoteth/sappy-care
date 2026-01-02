import type { Goal } from "@sappy/shared/types";

import { getLocalDate } from "../utils/date";

type GoalSchedule = {
  type?: "daily" | "weekly";
  daysOfWeek?: number[];
};

export function isGoalDueToday(goal: Goal, dateString?: string) {
  const schedule = goal.schedule as GoalSchedule;
  const localDate = dateString ?? getLocalDate();

  if (!schedule || !schedule.type) {
    return true;
  }

  if (schedule.type === "daily") {
    return true;
  }

  if (schedule.type === "weekly" && Array.isArray(schedule.daysOfWeek)) {
    const date = new Date(localDate);
    const day = date.getDay();
    return schedule.daysOfWeek.includes(day);
  }

  return true;
}
