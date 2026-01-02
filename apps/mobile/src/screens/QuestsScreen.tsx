import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import type { Goal } from "@sappy/shared/types";
import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip, IconButton, StickerBadge } from "../components/ui";
import { GoalModal } from "../components/GoalModal";
import { ParticleBurst } from "../components/effects/ParticleBurst";
import { QuickDrawer } from "../components/QuickDrawer";
import { useRepos } from "../data/RepoProvider";
import { useSealDrawer } from "../components/drawer/SealDrawer";
import { claimQuest } from "../services/localActions";
import { getLocalDate, getRecentLocalDates } from "../utils/date";
import { useTheme } from "../theme/useTheme";

type JourneyTemplate = {
  id: string;
  title: string;
  description: string;
  goals: string[];
  icon: string;
};

const journeys: JourneyTemplate[] = [
  {
    id: "seal_basics",
    title: "Seal Basics",
    description: "Start with gentle habits and easy wins.",
    goals: ["Drink water", "Step outside", "Stretch gently"],
    icon: "heart-outline",
  },
  {
    id: "cozy_morning",
    title: "Cozy Morning",
    description: "Ease into your day with soft routines.",
    goals: ["Make the bed", "Wash your face", "Open the curtains"],
    icon: "sunny-outline",
  },
  {
    id: "steady_focus",
    title: "Steady Focus",
    description: "Build calm momentum with short focus bursts.",
    goals: ["5-minute focus", "Clear one surface", "Celebrate a win"],
    icon: "sparkles-outline",
  },
  {
    id: "tide_reset",
    title: "Tide Reset",
    description: "Hydrate and reset with tiny sips and breaths.",
    goals: ["Drink water", "Rinse your face", "Slow breaths"],
    icon: "water-outline",
  },
  {
    id: "moonlight_wind_down",
    title: "Moonlight Wind Down",
    description: "Unplug and settle your seal energy.",
    goals: ["Dim the lights", "Put phone away", "Gratitude note"],
    icon: "moon-outline",
  },
  {
    id: "sunny_steps",
    title: "Sunny Steps",
    description: "Move gently and soak up a little light.",
    goals: ["Step outside", "Gentle stretch", "Shoulder rolls"],
    icon: "sunny-outline",
  },
  {
    id: "brave_splash",
    title: "Brave Splash",
    description: "A tiny burst of courage and celebration.",
    goals: ["Pick one task", "5-minute focus", "Celebrate the win"],
    icon: "flash-outline",
  },
  {
    id: "seafoam_steady",
    title: "Seafoam Steady",
    description: "Slow pacing and a calmer mind.",
    goals: ["Breathe slowly", "Tidy one spot", "Warm check-in"],
    icon: "leaf-outline",
  },
];

const questLabels: Record<string, string> = {
  checkin_1: "Warm check-in",
  goals_3: "Tiny wins x3",
  activity_1: "Care break",
};
const questIcons: Record<string, string> = {
  checkin_1: "heart-outline",
  goals_3: "ribbon-outline",
  activity_1: "leaf-outline",
};

export function QuestsScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { open } = useSealDrawer();
  const { palette } = useTheme();
  const canGoBack = navigation.canGoBack();
  const localDate = getLocalDate();
  const [startingJourney, setStartingJourney] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [questHoldIds, setQuestHoldIds] = useState<Set<string>>(new Set());
  const questTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [questBurstState, setQuestBurstState] = useState<{
    questId: string | null;
    key: number;
  }>({
    questId: null,
    key: 0,
  });

  const { data: companion } = useQuery({
    queryKey: ["companion"],
    queryFn: () => repos.companion.getCompanion(),
  });
  const { data: quests } = useQuery({
    queryKey: ["quests", localDate],
    queryFn: () => repos.quests.listQuests({ localDate }),
  });
  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: () => repos.goals.listGoals({ includeArchived: false }),
  });
  const { data: completions } = useQuery({
    queryKey: ["goal-completions", localDate],
    queryFn: () => repos.goals.listCompletions({ localDate }),
  });
  const { data: checkins } = useQuery({
    queryKey: ["checkins", "recent"],
    queryFn: () => repos.checkins.listCheckins({ limit: 30 }),
  });

  const completionIds = useMemo(() => {
    return new Set((completions ?? []).map((completion) => completion.goalId));
  }, [completions]);
  const visibleQuests = useMemo(() => {
    return (quests ?? []).filter(
      (quest) => !quest.isClaimed || questHoldIds.has(quest.id)
    );
  }, [quests, questHoldIds]);

  const journeyStatus = useMemo(() => {
    return journeys.map((journey) => {
      const journeyGoals = (goals ?? []).filter((goal) => {
        const schedule = goal.schedule as Record<string, unknown>;
        return schedule?.journeyId === journey.id;
      });
      const totalGoals = journeyGoals.length;
      const completedGoals = journeyGoals.filter((goal) =>
        completionIds.has(goal.id)
      ).length;
      return {
        journey,
        isStarted: totalGoals > 0,
        completedGoals,
        totalGoals,
      };
    });
  }, [completionIds, goals]);

  const streakCount = useMemo(() => {
    const dates = new Set((checkins ?? []).map((checkin) => checkin.localDate));
    const recentDates = getRecentLocalDates(30);
    let streak = 0;
    for (let i = recentDates.length - 1; i >= 0; i -= 1) {
      if (dates.has(recentDates[i])) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [checkins]);

  const questCount = quests?.length ?? 0;
  const completedCount =
    quests?.filter((quest) => quest.progress >= quest.target).length ?? 0;
  const adventureProgress = questCount
    ? Math.round((completedCount / questCount) * 100)
    : 0;
  const totalPetals =
    quests?.reduce((sum, quest) => sum + quest.rewardPetals, 0) ?? 0;

  useEffect(() => {
    return () => {
      questTimers.current.forEach((timer) => clearTimeout(timer));
      questTimers.current.clear();
    };
  }, []);

  const holdQuestClaim = (questId: string) => {
    setQuestHoldIds((prev) => {
      const next = new Set(prev);
      next.add(questId);
      return next;
    });
    const existing = questTimers.current.get(questId);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      setQuestHoldIds((prev) => {
        const next = new Set(prev);
        next.delete(questId);
        return next;
      });
      questTimers.current.delete(questId);
    }, 900);
    questTimers.current.set(questId, timer);
  };

  const triggerQuestBurst = (questId: string) => {
    setQuestBurstState((prev) => ({ questId, key: prev.key + 1 }));
  };

  const handleCreateGoal = async (payload: { title: string; details?: string }) => {
    await repos.goals.createGoal({
      title: payload.title,
      details: payload.details,
      schedule: { type: "daily" },
    });
    setShowGoalModal(false);
    await queryClient.invalidateQueries({ queryKey: ["goals"] });
  };

  const handleStartJourney = async (journey: JourneyTemplate) => {
    if (startingJourney) {
      return;
    }
    setStartingJourney(journey.id);
    try {
      const existing = (goals ?? []).filter((goal) => {
        const schedule = goal.schedule as Record<string, unknown>;
        return schedule?.journeyId === journey.id;
      });
      if (existing.length === 0) {
        await Promise.all(
          journey.goals.map((title) =>
            repos.goals.createGoal({
              title,
              schedule: { type: "daily", journeyId: journey.id },
            })
          )
        );
      }
      await queryClient.invalidateQueries({ queryKey: ["goals"] });
    } finally {
      setStartingJourney(null);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    await claimQuest(repos, questId);
    holdQuestClaim(questId);
    triggerQuestBurst(questId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["companion"] }),
      queryClient.invalidateQueries({ queryKey: ["quests"] }),
    ]);
  };

  const activities = [
    {
      id: "breathe",
      title: "Breathe",
      description: "Slow inhale, longer exhale.",
      icon: "cloud-outline",
      route: "ActivityBreathe",
    },
    {
      id: "focus",
      title: "Focus",
      description: "A short timer for one tiny task.",
      icon: "alarm-outline",
      route: "ActivityFocus",
    },
    {
      id: "sound",
      title: "Sound",
      description: "Ambient sound + timer.",
      icon: "headset-outline",
      route: "ActivitySound",
    },
    {
      id: "reflect",
      title: "Reflect",
      description: "A gentle prompt to jot down.",
      icon: "pencil-outline",
      route: "ActivityReflect",
    },
    {
      id: "first_aid",
      title: "First Aid",
      description: "Step-by-step grounding reset.",
      icon: "medkit-outline",
      route: "ActivityFirstAid",
    },
  ];

  const quickActions = [
    {
      key: "goal",
      label: "Add goal",
      icon: "add-circle-outline",
      tone: "primary",
      onPress: () => setShowGoalModal(true),
    },
    {
      key: "breathe",
      label: "Breathe",
      icon: "cloud-outline",
      tone: "mint",
      onPress: () => navigation.navigate("ActivityBreathe" as never),
    },
    {
      key: "focus",
      label: "Focus",
      icon: "alarm-outline",
      tone: "accent",
      onPress: () => navigation.navigate("ActivityFocus" as never),
    },
    {
      key: "home",
      label: "Today",
      icon: "home-outline",
      tone: "primary",
      onPress: () => navigation.navigate("Today" as never),
    },
    {
      key: "menu",
      label: "Menu",
      icon: "menu-outline",
      tone: "primary",
      onPress: open,
    },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topBar}>
          <IconButton
            name="arrow-back-outline"
            onPress={() => {
              if (canGoBack) {
                navigation.goBack();
              } else {
                navigation.navigate("Today" as never);
              }
            }}
            variant="ghost"
          />
          <View style={styles.topCenter}>
            <AppText variant="subtitle">Quests</AppText>
          </View>
          <View style={styles.topActions}>
            <IconButton
              name="add"
              onPress={() => setShowGoalModal(true)}
              variant="ghost"
            />
            <IconButton name="menu-outline" onPress={open} variant="ghost" />
          </View>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <AppText variant="subtitle">Daily energy</AppText>
              <AppText tone="secondary" variant="caption">
                {companion?.charge ?? 0} charge
              </AppText>
            </View>
            <View style={styles.summaryPills}>
              <View
                style={[
                  styles.summaryPill,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <Ionicons name="flame-outline" size={14} color={palette.warning} />
                <AppText variant="caption" style={styles.summaryLabel}>
                  {streakCount} day streak
                </AppText>
              </View>
              <View
                style={[
                  styles.summaryPill,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <Ionicons name="flower-outline" size={14} color={palette.accent} />
                <AppText variant="caption" style={styles.summaryLabel}>
                  {companion?.petalsBalance ?? 0} petals
                </AppText>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.adventureCard}>
          <View style={styles.adventureHeader}>
            <View style={styles.adventureTitleRow}>
              <AppText variant="subtitle">Daily adventure</AppText>
              <StickerBadge
                label="Quest"
                icon="ribbon-outline"
                style={styles.adventureBadge}
              />
            </View>
            <AppText tone="secondary" variant="caption">
              {questCount ? `${completedCount}/${questCount} steps` : "No quests yet"}
            </AppText>
          </View>
          <AppText tone="secondary" variant="caption" style={styles.adventureCopy}>
            {questCount
              ? `Earn up to ${totalPetals} petals today.`
              : "Complete onboarding to unlock daily quests."}
          </AppText>
          <View style={[styles.adventureTrack, { backgroundColor: palette.chip }]}>
            <View
              style={[
                styles.adventureFill,
                { width: `${adventureProgress}%`, backgroundColor: palette.primary },
              ]}
            />
          </View>
          <View style={styles.adventureActions}>
            <Button
              label={
                questCount === 0
                  ? "Start the day"
                  : completedCount === questCount
                    ? "Adventure complete"
                    : "Go to Home"
              }
              size="sm"
              variant={
                questCount > 0 && completedCount === questCount ? "secondary" : "primary"
              }
              iconLeft={
                questCount > 0 && completedCount === questCount
                  ? "checkmark-circle-outline"
                  : "compass-outline"
              }
              onPress={() => navigation.navigate("Today" as never)}
              disabled={questCount > 0 && completedCount === questCount}
            />
            <Chip
              label={questCount ? `${questCount} quests` : "Seal ready"}
              icon="ribbon-outline"
              style={styles.adventureChip}
            />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">Daily quests</AppText>
          <Ionicons name="chevron-down" size={16} color={palette.textMuted} />
        </View>
        {(quests ?? []).length === 0 ? (
          <Card style={styles.sectionCard}>
            <AppText tone="secondary">Quests appear each day.</AppText>
          </Card>
        ) : visibleQuests.length === 0 ? (
          <Card style={styles.sectionCard}>
            <AppText tone="secondary">All quests claimed for today.</AppText>
          </Card>
        ) : (
          visibleQuests.map((quest) => {
            const progress = Math.min(quest.progress, quest.target);
            const progressPercent = Math.round((progress / quest.target) * 100);
            const isComplete = progress >= quest.target;
            return (
              <Card key={quest.id} style={styles.questCard}>
                <View style={styles.questRow}>
                  <View
                    style={[
                      styles.questIcon,
                      { backgroundColor: palette.surface, borderColor: palette.border },
                    ]}
                  >
                    <Ionicons
                      name={questIcons[quest.questType] ?? "sparkles-outline"}
                      size={16}
                      color={palette.primaryDark}
                    />
                  </View>
                  <View style={styles.questText}>
                    <AppText variant="label">
                      {questLabels[quest.questType] ?? quest.questType}
                    </AppText>
                    <AppText tone="secondary" variant="caption">
                      {progress} / {quest.target} - {quest.rewardPetals} petals
                    </AppText>
                    <View style={[styles.questTrack, { backgroundColor: palette.chip }]}>
                      <View
                        style={[
                          styles.questFill,
                          { width: `${progressPercent}%`, backgroundColor: palette.primary },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.questActionWrap}>
                    <Button
                      label={quest.isClaimed ? "Claimed" : isComplete ? "Claim" : "Go"}
                      variant={quest.isClaimed ? "secondary" : "primary"}
                      size="sm"
                      disabled={!isComplete || quest.isClaimed}
                      onPress={() => handleClaimQuest(quest.id)}
                    />
                    {questBurstState.questId === quest.id ? (
                      <ParticleBurst triggerKey={questBurstState.key} />
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">Journeys</AppText>
          <Ionicons name="chevron-down" size={16} color={palette.textMuted} />
        </View>
        {journeyStatus.map(({ journey, isStarted, completedGoals, totalGoals }) => {
          const progress = totalGoals
            ? Math.round((completedGoals / totalGoals) * 100)
            : 0;
          return (
            <Card key={journey.id} style={styles.journeyCard}>
              <View style={styles.journeyHeader}>
                <View
                  style={[
                    styles.journeyIcon,
                    { borderColor: palette.border, backgroundColor: palette.surface },
                  ]}
                >
                  <Ionicons name={journey.icon} size={18} color={palette.primaryDark} />
                </View>
                <View style={styles.journeyCopy}>
                  <AppText variant="subtitle">{journey.title}</AppText>
                  <AppText tone="secondary" variant="caption">
                    {journey.description}
                  </AppText>
                </View>
              </View>
              <View style={styles.journeyGoals}>
                {journey.goals.map((goal) => (
                  <Chip key={goal} label={goal} />
                ))}
              </View>
              <View style={styles.journeyFooter}>
                <View
                  style={[
                    styles.journeyProgressTrack,
                    { backgroundColor: palette.chip },
                  ]}
                >
                  <View
                    style={[
                      styles.journeyProgressFill,
                      { width: `${progress}%`, backgroundColor: palette.primary },
                    ]}
                  />
                </View>
                <Button
                  label={
                    startingJourney === journey.id
                      ? "Starting..."
                      : isStarted
                        ? "Continue"
                        : "Start journey"
                  }
                  size="sm"
                  onPress={() => handleStartJourney(journey)}
                  disabled={startingJourney === journey.id}
                />
              </View>
            </Card>
          );
        })}

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">Care tools</AppText>
          <Ionicons name="chevron-down" size={16} color={palette.textMuted} />
        </View>
        <View style={styles.activityList}>
          {activities.map((activity) => (
            <Pressable
              key={activity.id}
              onPress={() => navigation.navigate(activity.route as never)}
              style={({ pressed }) => [
                styles.activityCard,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.activityIcon,
                  { borderColor: palette.border, backgroundColor: palette.surface },
                ]}
              >
                <Ionicons name={activity.icon} size={18} color={palette.primaryDark} />
              </View>
              <View style={styles.activityCopy}>
                <AppText variant="label">{activity.title}</AppText>
                <AppText tone="secondary" variant="caption">
                  {activity.description}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <QuickDrawer actions={quickActions} style={styles.quickDrawer} />

      <GoalModal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSubmit={handleCreateGoal}
        submitLabel="Add goal"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topCenter: {
    alignItems: "center",
    flex: 1,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryCard: {
    marginBottom: 16,
  },
  adventureCard: {
    marginBottom: 16,
  },
  adventureHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adventureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  adventureBadge: {
    marginLeft: 8,
  },
  adventureCopy: {
    marginTop: 6,
  },
  adventureTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10,
  },
  adventureFill: {
    height: "100%",
    borderRadius: 999,
  },
  adventureActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  adventureChip: {
    marginLeft: 10,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLeft: {
    flex: 1,
  },
  summaryPills: {
    alignItems: "flex-end",
  },
  summaryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 6,
    shadowColor: "#1c2a33",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  summaryLabel: {
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10,
  },
  sectionCard: {
    marginBottom: 12,
  },
  questCard: {
    marginBottom: 12,
  },
  questRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  questIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginRight: 12,
  },
  questText: {
    flex: 1,
    marginRight: 12,
  },
  questActionWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  questTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 8,
  },
  questFill: {
    height: "100%",
    borderRadius: 999,
  },
  journeyCard: {
    marginBottom: 12,
  },
  journeyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  journeyIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  journeyCopy: {
    flex: 1,
  },
  journeyGoals: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  journeyFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  journeyProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    marginRight: 12,
  },
  journeyProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  activityList: {
    marginBottom: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 10,
    shadowColor: "#1c2a33",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityCopy: {
    flex: 1,
  },
  quickDrawer: {
    position: "absolute",
    right: 14,
    bottom: 120,
  },
});
