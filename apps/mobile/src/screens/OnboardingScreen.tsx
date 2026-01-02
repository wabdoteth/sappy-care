import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { PalettePicker } from "../components/PalettePicker";
import { AppText, Button, Card, Chip } from "../components/ui";
import { useRepos } from "../data/RepoProvider";
import { generateDailyQuests } from "../services/quests";
import { useTheme } from "../theme/useTheme";
import { getLocalDate } from "../utils/date";

type OnboardingScreenProps = {
  onComplete: () => void;
};

type StarterGoal = {
  id: string;
  title: string;
  details: string;
};

const intentions = [
  { id: "steady", label: "Feel steady" },
  { id: "gentle", label: "Go gently" },
  { id: "focused", label: "Find focus" },
  { id: "rested", label: "Rest well" },
  { id: "brave", label: "Be a little brave" },
];

const starterGoals: StarterGoal[] = [
  {
    id: "goal_checkin",
    title: "Check in with myself",
    details: "A quick mood check-in.",
  },
  {
    id: "goal_breathe",
    title: "Pause for two slow breaths",
    details: "Small reset, anytime.",
  },
  {
    id: "goal_water",
    title: "Drink a glass of water",
    details: "Easy care for today.",
  },
  {
    id: "goal_walk",
    title: "Take a five-minute walk",
    details: "Light movement and fresh air.",
  },
  {
    id: "goal_reflect",
    title: "Write one line of reflection",
    details: "Just one sentence is enough.",
  },
];

const onboardingSteps = ["Intention", "Palette", "Goals", "Ready"];
const stepIcons = [
  "compass-outline",
  "color-palette-outline",
  "flag-outline",
  "sparkles-outline",
];
const intentionIcons: Record<string, string> = {
  steady: "shield-outline",
  gentle: "leaf-outline",
  focused: "flash-outline",
  rested: "moon-outline",
  brave: "sunny-outline",
};
const goalIcons: Record<string, string> = {
  goal_checkin: "heart-outline",
  goal_breathe: "cloud-outline",
  goal_water: "water-outline",
  goal_walk: "walk-outline",
  goal_reflect: "pencil-outline",
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const repos = useRepos();
  const { paletteId, palette, setPaletteId } = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const [intentionId, setIntentionId] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const step = onboardingSteps[stepIndex] ?? onboardingSteps[0];

  const canContinue =
    (stepIndex === 0 && intentionId !== null) ||
    stepIndex === 1 ||
    (stepIndex === 2 && selectedGoals.length === 3) ||
    stepIndex === 3;

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((current) => {
      if (current.includes(goalId)) {
        return current.filter((id) => id !== goalId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, goalId];
    });
  };

  const handleNext = () => {
    if (stepIndex < onboardingSteps.length - 1) {
      setStepIndex((current) => current + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((current) => current - 1);
    }
  };

  const handleFinish = async () => {
    if (isSubmitting) {
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await repos.companion.createCompanion({
        paletteId,
        charge: 0,
        petalsBalance: 0,
        traits: {},
        equippedItemIds: [],
      });

      const goalsToCreate = starterGoals.filter((goal) =>
        selectedGoals.includes(goal.id)
      );

      await Promise.all(
        goalsToCreate.map((goal) =>
          repos.goals.createGoal({
            title: goal.title,
            details: goal.details,
            schedule: { type: "daily" },
          })
        )
      );

      const localDate = getLocalDate();
      const quests = generateDailyQuests(localDate);
      await Promise.all(
        quests.map((quest) =>
          repos.quests.createQuest({
            localDate,
            questType: quest.type,
            target: quest.target,
            progress: 0,
            rewardPetals: 10,
            isClaimed: false,
          })
        )
      );

      onComplete();
    } catch (error) {
      console.warn("Onboarding failed", error);
      setErrorMessage("We couldn't finish setup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={[styles.headerBadge, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons
            name={stepIcons[stepIndex] ?? "sparkles-outline"}
            size={20}
            color={palette.primaryDark}
          />
        </View>
        <View style={styles.headerCopy}>
          <AppText variant="caption" tone="secondary">
            Step {stepIndex + 1} of {onboardingSteps.length} - {step}
          </AppText>
          <AppText variant="display" style={styles.title}>
            {stepIndex === 0 && "Set the tone"}
            {stepIndex === 1 && "Pick a palette"}
            {stepIndex === 2 && "Choose starter goals"}
            {stepIndex === 3 && "You're ready"}
          </AppText>
        </View>
      </View>
      <AppText tone="secondary">
        {stepIndex === 0 && "What do you want this week to feel like?"}
        {stepIndex === 1 && "You can change this anytime in Me."}
        {stepIndex === 2 && "Select three small goals for today."}
        {stepIndex === 3 && "We will set up your seal and goals."}
      </AppText>

      <View style={styles.content}>
        {stepIndex === 0 && (
          <Card>
            <View style={styles.chipRow}>
              {intentions.map((intention) => (
                <Chip
                  key={intention.id}
                  label={intention.label}
                  active={intentionId === intention.id}
                  icon={intentionIcons[intention.id] ?? "sparkles-outline"}
                  onPress={() => setIntentionId(intention.id)}
                  style={styles.chip}
                />
              ))}
            </View>
          </Card>
        )}

        {stepIndex === 1 && (
          <Card>
            <PalettePicker selectedId={paletteId} onSelect={setPaletteId} />
          </Card>
        )}

        {stepIndex === 2 && (
          <Card>
            <AppText tone="secondary" variant="caption">
              Selected {selectedGoals.length} / 3
            </AppText>
            <View style={styles.goalList}>
              {starterGoals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <Chip
                    key={goal.id}
                    label={goal.title}
                    active={isSelected}
                    icon={goalIcons[goal.id] ?? "checkmark-circle-outline"}
                    onPress={() => toggleGoal(goal.id)}
                    style={styles.goalChip}
                  />
                );
              })}
            </View>
          </Card>
        )}

        {stepIndex === 3 && (
          <Card>
            <AppText variant="subtitle">Summary</AppText>
            <AppText tone="secondary" style={styles.summaryLine}>
              Intention: {intentions.find((item) => item.id === intentionId)?.label ?? "Set later"}
            </AppText>
            <AppText tone="secondary" style={styles.summaryLine}>
              Palette: {palette.name}
            </AppText>
            <AppText tone="secondary" style={styles.summaryLine}>
              Goals: {selectedGoals.length} selected
            </AppText>
          </Card>
        )}
      </View>

      {errorMessage ? (
        <AppText tone="secondary" style={styles.errorText}>
          {errorMessage}
        </AppText>
      ) : null}

      <View style={styles.footer}>
        {stepIndex > 0 ? (
          <Button
            label="Back"
            variant="secondary"
            iconLeft="arrow-back-outline"
            onPress={handleBack}
            style={styles.footerButton}
          />
        ) : null}
        {stepIndex < onboardingSteps.length - 1 ? (
          <Button
            label="Next"
            onPress={handleNext}
            disabled={!canContinue}
            iconRight="arrow-forward-outline"
            style={[
              styles.footerButton,
              stepIndex > 0 ? styles.footerButtonLeft : null,
            ]}
          />
        ) : (
          <Button
            label={isSubmitting ? "Setting up..." : "Start"}
            onPress={handleFinish}
            disabled={!canContinue || isSubmitting}
            iconRight="sparkles-outline"
            style={[
              styles.footerButton,
              stepIndex > 0 ? styles.footerButtonLeft : null,
            ]}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    marginTop: 4,
  },
  content: {
    marginTop: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    marginRight: 10,
    marginBottom: 10,
  },
  goalList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  goalChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  summaryLine: {
    marginTop: 8,
  },
  errorText: {
    marginTop: 16,
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  footerButton: {
    flex: 1,
  },
  footerButtonLeft: {
    marginLeft: 12,
  },
});
