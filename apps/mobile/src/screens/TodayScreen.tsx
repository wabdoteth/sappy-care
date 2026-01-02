import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import type { Goal } from "@sappy/shared/types";
import { Screen } from "../components/Screen";
import { CheckinModal } from "../components/CheckinModal";
import { GoalModal } from "../components/GoalModal";
import { AppText, Button, Card, Chip, IconButton, StickerBadge } from "../components/ui";
import { SealRoomScene } from "../components/companion/SealRoomScene";
import { ParticleBurst } from "../components/effects/ParticleBurst";
import { ChargeMeterCard } from "../components/ChargeMeterCard";
import type { SealMood } from "../components/companion/SealCompanion";
import { QuickDrawer } from "../components/QuickDrawer";
import { useRepos } from "../data/RepoProvider";
import { useSealDrawer } from "../components/drawer/SealDrawer";
import { claimQuest, completeGoal, recordCheckin } from "../services/localActions";
import { isGoalDueToday } from "../services/goals";
import { useTheme } from "../theme/useTheme";
import { getLocalDate } from "../utils/date";

const playMessages = {
  toss: [
    "Seal chases the beachball!",
    "A perfect bounce and a splash.",
    "Seal is zooming in tiny circles.",
  ],
  nap: [
    "Seal curls up for a sunny nap.",
    "Soft snores, big calm.",
    "Seal is melting into the cushion.",
  ],
  splash: [
    "Splash! Tiny waves everywhere.",
    "Seal makes a bubble trail.",
    "A quick wiggle and a splash.",
  ],
};
const GOAL_REWARD_PETALS = 5;
const BLOOM_THRESHOLD = 60;

export function TodayScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const { open } = useSealDrawer();
  const queryClient = useQueryClient();
  const { palette } = useTheme();
  const [showCheckin, setShowCheckin] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const localDate = getLocalDate();
  const { data: companion } = useQuery({
    queryKey: ["companion"],
    queryFn: () => repos.companion.getCompanion(),
  });
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => repos.user.getSettings(),
  });
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: () => repos.shop.listItems(),
  });
  const { data: goals } = useQuery({
    queryKey: ["goals"],
    queryFn: () => repos.goals.listGoals({ includeArchived: false }),
  });
  const { data: completions } = useQuery({
    queryKey: ["goal-completions", localDate],
    queryFn: () => repos.goals.listCompletions({ localDate }),
  });
  const { data: quests } = useQuery({
    queryKey: ["quests", localDate],
    queryFn: () => repos.quests.listQuests({ localDate }),
  });
  const { data: todayCheckins } = useQuery({
    queryKey: ["checkins", localDate],
    queryFn: () =>
      repos.checkins.listCheckins({
        fromDate: localDate,
        toDate: localDate,
        limit: 1,
      }),
  });

  const activeGoals = useMemo(() => {
    return (goals ?? []).filter((goal) => isGoalDueToday(goal, localDate));
  }, [goals, localDate]);
  const completedGoalIds = useMemo(() => {
    return new Set((completions ?? []).map((completion) => completion.goalId));
  }, [completions]);
  const [completionHoldIds, setCompletionHoldIds] = useState<Set<string>>(new Set());
  const completionTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const remainingGoals = Math.max(0, activeGoals.length - completedGoalIds.size);
  const pauseMode = settings?.pauseMode ?? false;
  const chargeValue = Math.min(100, Math.max(0, companion?.charge ?? 0));
  const petalsBalance = companion?.petalsBalance ?? 0;
  const todayCheckin = todayCheckins?.[0] ?? null;
  const levelUpAnim = useRef(new Animated.Value(0)).current;
  const prevChargeRef = useRef(chargeValue);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const [playMessage, setPlayMessage] = useState<string | null>(null);
  const [playMood, setPlayMood] = useState<SealMood>("calm");
  const [playKey, setPlayKey] = useState(0);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [burstState, setBurstState] = useState<{ goalId: string | null; key: number }>({
    goalId: null,
    key: 0,
  });
  const [questHoldIds, setQuestHoldIds] = useState<Set<string>>(new Set());
  const questTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [questBurstState, setQuestBurstState] = useState<{
    questId: string | null;
    key: number;
  }>({
    questId: null,
    key: 0,
  });
  const useNativeDriver = Platform.OS !== "web";

  const visibleGoals = useMemo(() => {
    return activeGoals.filter(
      (goal) => !completedGoalIds.has(goal.id) || completionHoldIds.has(goal.id)
    );
  }, [activeGoals, completedGoalIds, completionHoldIds]);
  const visibleQuests = useMemo(() => {
    return (quests ?? []).filter(
      (quest) => !quest.isClaimed || questHoldIds.has(quest.id)
    );
  }, [quests, questHoldIds]);

  const equippedItems = useMemo(() => {
    if (!companion || !items) {
      return [];
    }
    const itemMap = new Map(items.map((item) => [item.id, item]));
    return companion.equippedItemIds
      .map((id) => itemMap.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [companion, items]);

  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
      completionTimers.current.forEach((timer) => clearTimeout(timer));
      completionTimers.current.clear();
      questTimers.current.forEach((timer) => clearTimeout(timer));
      questTimers.current.clear();
    };
  }, []);

  useEffect(() => {
    if (prevChargeRef.current < BLOOM_THRESHOLD && chargeValue >= BLOOM_THRESHOLD) {
      setLevelUpKey((value) => value + 1);
      levelUpAnim.stopAnimation();
      levelUpAnim.setValue(0);
      Animated.sequence([
        Animated.timing(levelUpAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver,
        }),
        Animated.delay(1700),
        Animated.timing(levelUpAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver,
        }),
      ]).start();
    }
    prevChargeRef.current = chargeValue;
  }, [chargeValue, levelUpAnim, useNativeDriver]);

  const holdCompletion = (goalId: string) => {
    setCompletionHoldIds((prev) => {
      const next = new Set(prev);
      next.add(goalId);
      return next;
    });
    const existing = completionTimers.current.get(goalId);
    if (existing) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      setCompletionHoldIds((prev) => {
        const next = new Set(prev);
        next.delete(goalId);
        return next;
      });
      completionTimers.current.delete(goalId);
    }, 900);
    completionTimers.current.set(goalId, timer);
  };

  const triggerBurst = (goalId: string) => {
    setBurstState((prev) => ({ goalId, key: prev.key + 1 }));
  };

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

  const handleCheckin = async (payload: { mood: 1 | 2 | 3 | 4 | 5; note: string }) => {
    await recordCheckin(repos, {
      localDate,
      mood: payload.mood,
      note: payload.note,
    });
    setShowCheckin(false);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["companion"] }),
      queryClient.invalidateQueries({ queryKey: ["checkins"] }),
      queryClient.invalidateQueries({ queryKey: ["quests"] }),
    ]);
  };

  const handlePlay = (key: keyof typeof playMessages) => {
    const messages = playMessages[key];
    const next = messages[Math.floor(Math.random() * messages.length)];
    setPlayMessage(next);
    setPlayMood(key === "nap" ? "sleepy" : "happy");
    setPlayKey((value) => value + 1);
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }
    playTimeoutRef.current = setTimeout(() => {
      setPlayMessage(null);
      setPlayMood("calm");
    }, 2000);
  };

  const handleCreateGoal = async (payload: { title: string; details?: string }) => {
    await repos.goals.createGoal({
      title: payload.title,
      details: payload.details,
      schedule: { type: "daily" },
    });
    setShowGoalModal(false);
    setEditingGoal(null);
    await queryClient.invalidateQueries({ queryKey: ["goals"] });
  };

  const handleUpdateGoal = async (payload: { title: string; details?: string }) => {
    if (!editingGoal) {
      return;
    }
    await repos.goals.updateGoal(editingGoal.id, {
      title: payload.title,
      details: payload.details ?? null,
    });
    setShowGoalModal(false);
    setEditingGoal(null);
    await queryClient.invalidateQueries({ queryKey: ["goals"] });
  };

  const handleArchiveGoal = async () => {
    if (!editingGoal) {
      return;
    }
    await repos.goals.updateGoal(editingGoal.id, { isArchived: true });
    setShowGoalModal(false);
    setEditingGoal(null);
    await queryClient.invalidateQueries({ queryKey: ["goals"] });
  };

  const handleCompleteGoal = async (goalId: string) => {
    const goal = activeGoals.find((item) => item.id === goalId);
    if (!goal) {
      return;
    }
    if (completedGoalIds.has(goal.id)) {
      return;
    }
    await completeGoal(repos, goal, localDate);
    holdCompletion(goalId);
    triggerBurst(goalId);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["companion"] }),
      queryClient.invalidateQueries({ queryKey: ["goal-completions"] }),
      queryClient.invalidateQueries({ queryKey: ["quests"] }),
    ]);
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

  const quickActions = [
    {
      key: "checkin",
      label: "Check-in",
      icon: "heart-outline",
      tone: "accent",
      onPress: () => setShowCheckin(true),
    },
    {
      key: "goal",
      label: "Add goal",
      icon: "add-circle-outline",
      tone: "primary",
      onPress: () => {
        setEditingGoal(null);
        setShowGoalModal(true);
      },
    },
    {
      key: "breathe",
      label: "Breathe",
      icon: "cloud-outline",
      tone: "mint",
      onPress: () =>
        navigation.navigate(
          "Care" as never,
          { screen: "ActivityBreathe" } as never
        ),
    },
    {
      key: "cove",
      label: "Seal cove",
      icon: "flower-outline",
      tone: "accent",
      onPress: () =>
        navigation.navigate(
          "Bloom" as never,
          { screen: "BloomHome" } as never
        ),
    },
    {
      key: "menu",
      label: "Menu",
      icon: "menu-outline",
      tone: "primary",
      onPress: open,
    },
  ];

  const levelUpTranslate = levelUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });
  const levelUpScale = levelUpAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  return (
    <Screen>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.levelUpBanner,
          {
            opacity: levelUpAnim,
            transform: [{ translateY: levelUpTranslate }, { scale: levelUpScale }],
            backgroundColor: palette.primary,
            borderColor: palette.primaryDark,
            shadowColor: palette.shadow,
          },
        ]}
      >
        <View style={[styles.levelUpBadge, { backgroundColor: palette.primaryDark }]}>
          <Ionicons name="sparkles-outline" size={16} color="#ffffff" />
        </View>
        <AppText variant="label" tone="inverted" style={styles.levelUpText}>
          Cove ready! Splash unlocked.
        </AppText>
        <ParticleBurst triggerKey={levelUpKey} />
      </Animated.View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <IconButton
            name="menu-outline"
            onPress={open}
            variant="ghost"
            style={styles.topIcon}
          />
          <IconButton
            name="add"
            onPress={() => {
              setEditingGoal(null);
              setShowGoalModal(true);
            }}
            variant="solid"
            style={styles.topIcon}
          />
        </View>

        <View style={styles.heroWrap}>
          <SealRoomScene
            size={320}
            equippedItems={equippedItems}
            variant="hero"
            mood={playMood}
            interactionKey={playKey}
          />
        </View>

        <Pressable
          style={[styles.chatPill, { backgroundColor: palette.surface, borderColor: palette.border }]}
          onPress={() => setShowCheckin(true)}
        >
          <AppText variant="label" style={styles.chatText}>
            Chat with him!
          </AppText>
        </Pressable>

        <ChargeMeterCard
          charge={chargeValue}
          petals={petalsBalance}
          threshold={BLOOM_THRESHOLD}
          checkin={todayCheckin}
          onCheckin={() => setShowCheckin(true)}
          pauseMode={pauseMode}
        />

        {pauseMode ? (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="subtitle">Pause mode</AppText>
              <Ionicons name="pause-circle-outline" size={18} color={palette.textSecondary} />
            </View>
            <AppText tone="secondary" style={styles.cardSubtitle}>
              No pressure today. Move at your own pace.
            </AppText>
          </Card>
        ) : null}

        <View style={styles.goalsSummaryRow}>
          <View style={styles.goalsSummaryLeft}>
            <View style={[styles.goalsSummaryIcon, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Ionicons name="calendar-outline" size={14} color={palette.primaryDark} />
            </View>
            <AppText variant="label">
              {remainingGoals} goals left for today!
            </AppText>
          </View>
          <View style={styles.goalsSummaryActions}>
            <StickerBadge label="Daily" icon="sparkles-outline" style={styles.summarySticker} />
            <Pressable
              style={[styles.summaryAction, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Ionicons name="options-outline" size={14} color={palette.textMuted} />
            </Pressable>
            <Pressable
              style={[styles.summaryAction, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Ionicons name="people-outline" size={14} color={palette.textMuted} />
            </Pressable>
            <Pressable
              style={[styles.summaryAction, { backgroundColor: palette.surface, borderColor: palette.border }]}
              onPress={() => {
                setEditingGoal(null);
                setShowGoalModal(true);
              }}
            >
              <Ionicons name="add" size={14} color={palette.textMuted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.goalsHeader}>
          <AppText variant="subtitle">Start the day</AppText>
          <Ionicons name="chevron-down" size={16} color={palette.textMuted} />
        </View>
      <View style={styles.goalList}>
        {visibleGoals.length === 0 ? (
          <AppText tone="secondary" style={styles.emptyText}>
            Add a goal to start your day.
          </AppText>
        ) : (
          visibleGoals.map((goal, index) => {
            const isDone = completedGoalIds.has(goal.id);
            const iconName =
              index % 3 === 0
                ? "flower-outline"
                : index % 3 === 1
                  ? "heart-outline"
                  : "sparkles-outline";
            return (
              <Pressable
                key={goal.id}
                onLongPress={() => {
                  setEditingGoal(goal);
                  setShowGoalModal(true);
                }}
                style={({ pressed }) => [
                  styles.goalCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    opacity: isDone ? 0.6 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <View style={[styles.goalBadge, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <Ionicons name={iconName} size={16} color={palette.primaryDark} />
                </View>
                <View style={styles.goalText}>
                  <AppText variant="label">{goal.title}</AppText>
                  {goal.details ? (
                    <AppText tone="secondary" variant="caption">
                      {goal.details}
                    </AppText>
                  ) : null}
                </View>
                <View style={styles.goalMeta}>
                  <View style={styles.goalReward}>
                    <Ionicons name="flash" size={12} color={palette.accent} />
                    <AppText variant="caption" style={styles.goalRewardText}>
                      {GOAL_REWARD_PETALS}
                    </AppText>
                  </View>
                  <View style={styles.goalCheckWrap}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => handleCompleteGoal(goal.id)}
                      disabled={isDone}
                      style={[
                        styles.goalCheck,
                        {
                          backgroundColor: isDone ? palette.success : palette.surface,
                          borderColor: isDone ? palette.success : palette.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={isDone ? "#ffffff" : palette.textMuted}
                      />
                    </Pressable>
                    {burstState.goalId === goal.id ? (
                      <ParticleBurst triggerKey={burstState.key} />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
        <Pressable
          accessibilityRole="button"
          style={[styles.addGoalPill, { backgroundColor: palette.surface, borderColor: palette.border }]}
          onPress={() => {
            setEditingGoal(null);
            setShowGoalModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={palette.primaryDark} />
          <AppText variant="label" style={styles.addGoalText}>
            Add goal
          </AppText>
        </Pressable>
      </View>

        <View style={styles.anytimeHeader}>
          <View style={styles.anytimeLeft}>
            <AppText variant="subtitle">Any time</AppText>
            <Ionicons
              name="chevron-down"
              size={16}
              color={palette.textMuted}
              style={styles.anytimeChevron}
            />
          </View>
          <Pressable
            style={[styles.anytimeAdd, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Ionicons name="add" size={14} color={palette.textMuted} />
          </Pressable>
        </View>
        <View style={styles.chipRow}>
        <Chip
          label="Breathe"
          icon="cloud-outline"
          style={styles.chip}
          onPress={() =>
            navigation.navigate(
              "Care" as never,
              { screen: "ActivityBreathe" } as never
            )
          }
        />
        <Chip
          label="Focus"
          icon="alarm-outline"
          style={styles.chip}
          onPress={() =>
            navigation.navigate(
              "Care" as never,
              { screen: "ActivityFocus" } as never
            )
          }
        />
        <Chip
          label="Reflect"
          icon="pencil-outline"
          style={styles.chip}
          onPress={() =>
            navigation.navigate(
              "Care" as never,
              { screen: "ActivityReflect" } as never
            )
          }
        />
        <Chip
          label="Toss ball"
          icon="football-outline"
          style={styles.chip}
          onPress={() => handlePlay("toss")}
        />
        <Chip
          label="Sun nap"
          icon="sunny-outline"
          style={styles.chip}
          onPress={() => handlePlay("nap")}
        />
        <Chip
          label="Splash"
          icon="water-outline"
          style={styles.chip}
          onPress={() => handlePlay("splash")}
        />
        <Chip
          label="Visit cove"
          icon="flower-outline"
          style={styles.chip}
          onPress={() =>
            navigation.navigate(
              "Bloom" as never,
              { screen: "BloomHome" } as never
            )
          }
        />
        <Chip
          label="Shop"
          icon="bag-outline"
          style={styles.chip}
          onPress={() =>
            navigation.navigate(
              "Bloom" as never,
              { screen: "Shop" } as never
            )
          }
        />
        <Chip
          label="Bag"
          icon="bag-handle-outline"
          style={styles.chip}
          onPress={() => navigation.navigate("Me" as never)}
        />
      </View>
        {playMessage ? (
          <AppText tone="secondary" style={styles.helperText}>
            {playMessage}
          </AppText>
        ) : null}

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Daily adventure</AppText>
            <AppText tone="secondary" variant="label">
              {pauseMode ? "Optional" : `${quests?.length ?? 0} today`}
            </AppText>
          </View>
          {(quests ?? []).length === 0 ? (
            <AppText tone="secondary" style={styles.emptyText}>
              Adventure steps show up after onboarding.
            </AppText>
          ) : visibleQuests.length === 0 ? (
            <AppText tone="secondary" style={styles.emptyText}>
              All steps claimed for today.
            </AppText>
          ) : (
            visibleQuests.map((quest) => {
              const progress = Math.min(quest.progress, quest.target);
              const progressPercent = Math.round((progress / quest.target) * 100);
              const isComplete = progress >= quest.target;
              return (
                <View key={quest.id} style={styles.questRow}>
                  <View style={styles.questText}>
                    <View style={styles.questLabelRow}>
                      <Ionicons
                        name={questIcons[quest.questType] ?? "sparkles-outline"}
                        size={16}
                        color={palette.primaryDark}
                        style={styles.questIcon}
                      />
                      <AppText>{questLabels[quest.questType] ?? quest.questType}</AppText>
                    </View>
                    {!pauseMode ? (
                      <AppText tone="secondary" variant="caption">
                        {progress} / {quest.target} - {quest.rewardPetals} petals
                      </AppText>
                    ) : (
                      <AppText tone="secondary" variant="caption">
                        {quest.rewardPetals} petals
                      </AppText>
                    )}
                    <View style={[styles.questTrack, { backgroundColor: palette.chip }]}>
                      <View
                        style={[
                          styles.questFill,
                          { backgroundColor: palette.primary, width: `${progressPercent}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.questActionWrap}>
                    <Button
                      label={
                        quest.isClaimed
                          ? "Claimed"
                          : isComplete
                            ? "Claim"
                            : "In progress"
                      }
                      variant={quest.isClaimed ? "secondary" : "primary"}
                      size="sm"
                      disabled={!isComplete || quest.isClaimed}
                      iconLeft={quest.isClaimed ? "checkmark-circle-outline" : "gift-outline"}
                      onPress={() => handleClaimQuest(quest.id)}
                    />
                    {questBurstState.questId === quest.id ? (
                      <ParticleBurst triggerKey={questBurstState.key} />
                    ) : null}
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>

      <QuickDrawer actions={quickActions} style={styles.quickDrawer} />

      <CheckinModal
        visible={showCheckin}
        onClose={() => setShowCheckin(false)}
        onSubmit={handleCheckin}
      />
      <GoalModal
        visible={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
        onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
        onArchive={editingGoal ? handleArchiveGoal : undefined}
        initialValues={
          editingGoal
            ? { title: editingGoal.title, details: editingGoal.details }
            : undefined
        }
        submitLabel={editingGoal ? "Save changes" : "Add goal"}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  levelUpBanner: {
    position: "absolute",
    top: 18,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
    zIndex: 10,
    overflow: "hidden",
  },
  levelUpBadge: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  levelUpText: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topIcon: {
    width: 38,
    height: 38,
    borderColor: "transparent",
    borderWidth: 0,
  },
  heroWrap: {
    marginHorizontal: -24,
    marginTop: 8,
  },
  chatPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 2,
    marginTop: -16,
    marginBottom: 8,
    shadowColor: "#1c2a33",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  chatText: {
    letterSpacing: 0.2,
  },
  sectionCard: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardSubtitle: {
    marginTop: 8,
  },
  helperText: {
    marginTop: 8,
  },
  goalsSummaryRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalsSummaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalsSummaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  goalsSummaryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  summarySticker: {
    marginRight: 8,
  },
  summaryAction: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  goalsHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 12,
  },
  goalList: {
    marginTop: 12,
  },
  emptyText: {
    marginTop: 8,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: "#1c2a33",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: "visible",
  },
  goalBadge: {
    width: 34,
    height: 34,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  goalText: {
    flex: 1,
  },
  goalMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalReward: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  goalRewardText: {
    marginLeft: 4,
  },
  goalCheck: {
    width: 30,
    height: 30,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  goalCheckWrap: {
    width: 34,
    height: 34,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },
  addGoalPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 4,
  },
  addGoalText: {
    marginLeft: 6,
  },
  questRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  questText: {
    flex: 1,
    marginRight: 12,
  },
  questLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  questIcon: {
    marginRight: 6,
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
  questActionWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  anytimeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  anytimeLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  anytimeAdd: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  anytimeChevron: {
    marginLeft: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  chip: {
    marginRight: 10,
    marginBottom: 10,
  },
  quickDrawer: {
    position: "absolute",
    right: 14,
    bottom: 120,
  },
});
