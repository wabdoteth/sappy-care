import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { ActivityType } from "@sappy/shared/types";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Card } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { formatLocalDate } from "../utils/date";
import { formatTimer } from "../utils/time";
import { useTheme } from "../theme/useTheme";

const activityLabels: Record<ActivityType, string> = {
  breathe: "Breathe",
  focus: "Focus",
  sound: "Sound",
  reflect: "Reflect",
  first_aid: "First aid",
};

type HistoryItem = {
  id: string;
  title: string;
  detail?: string | null;
  createdAt: string;
  localDate?: string | null;
  icon: string;
};

export function HistoryScreen() {
  const repos = useRepos();
  const { palette } = useTheme();

  const { data: checkins } = useQuery({
    queryKey: ["checkins", "history"],
    queryFn: () => repos.checkins.listCheckins({ limit: 10 }),
  });
  const { data: activities } = useQuery({
    queryKey: ["activity-sessions"],
    queryFn: () => repos.activity.listSessions({ limit: 10 }),
  });
  const { data: completions } = useQuery({
    queryKey: ["goal-completions"],
    queryFn: () => repos.goals.listCompletions(),
  });
  const { data: goals } = useQuery({
    queryKey: ["goals", "all"],
    queryFn: () => repos.goals.listGoals({ includeArchived: true }),
  });

  const goalMap = useMemo(() => {
    return new Map((goals ?? []).map((goal) => [goal.id, goal]));
  }, [goals]);

  const historyItems = useMemo(() => {
    const items: HistoryItem[] = [];

    (checkins ?? []).forEach((checkin) => {
      items.push({
        id: `checkin-${checkin.id}`,
        title: "Check-in",
        detail: `Mood ${checkin.mood} / 5${checkin.note ? ` - ${checkin.note}` : ""}`,
        createdAt: checkin.createdAt,
        localDate: checkin.localDate,
        icon: "heart-outline",
      });
    });

    (activities ?? []).forEach((session) => {
      const durationLabel =
        session.durationSeconds != null
          ? `Duration ${formatTimer(session.durationSeconds)}`
          : "Completed";
      items.push({
        id: `activity-${session.id}`,
        title: `Care: ${activityLabels[session.activityType] ?? session.activityType}`,
        detail: session.note ? `${durationLabel} - ${session.note}` : durationLabel,
        createdAt: session.createdAt,
        localDate: session.localDate,
        icon: "leaf-outline",
      });
    });

    (completions ?? []).forEach((completion) => {
      const goal = goalMap.get(completion.goalId);
      items.push({
        id: `goal-${completion.id}`,
        title: "Goal completed",
        detail: goal?.title ?? "Goal",
        createdAt: completion.createdAt,
        localDate: completion.localDate,
        icon: "checkmark-circle-outline",
      });
    });

    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [activities, checkins, completions, goalMap]);

  const recentItems = historyItems.slice(0, 20);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="History"
          subtitle="Your recent care moments and completions."
          icon="time-outline"
          action="back"
        />

        {recentItems.length === 0 ? (
          <Card style={styles.sectionCard}>
            <AppText tone="secondary">No activity yet.</AppText>
          </Card>
        ) : (
          recentItems.map((item) => (
            <Card key={item.id} style={styles.sectionCard}>
              <View style={styles.itemHeaderRow}>
                <View style={[styles.itemBadge, { backgroundColor: palette.surfaceMuted }]}>
                  <Ionicons name={item.icon} size={18} color={palette.primaryDark} />
                </View>
                <View style={styles.itemHeaderCopy}>
                  <AppText variant="subtitle">{item.title}</AppText>
                  <AppText tone="secondary" style={styles.metaText}>
                    {item.localDate ? formatLocalDate(item.localDate) : ""}
                  </AppText>
                </View>
              </View>
              {item.detail ? (
                <AppText tone="secondary" style={styles.detailText}>
                  {item.detail}
                </AppText>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  sectionCard: {
    marginTop: 20,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemHeaderCopy: {
    flex: 1,
  },
  itemBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  metaText: {
    marginTop: 4,
  },
  detailText: {
    marginTop: 8,
  },
});
