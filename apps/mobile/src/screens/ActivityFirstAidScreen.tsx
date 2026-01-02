import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen } from "../components/Screen";
import { AppText, Button, Card } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { recordActivity } from "../services/localActions";
import { getLocalDate } from "../utils/date";

const STEPS = [
  {
    title: "Pause",
    body: "Place a hand on your chest and take three slow breaths.",
  },
  {
    title: "Ground",
    body: "Name five things you can see and four things you can touch.",
  },
  {
    title: "Soften",
    body: "Relax your shoulders and unclench your jaw.",
  },
  {
    title: "Support",
    body: "Reach out or jot a note to yourself with care.",
  },
];

export function ActivityFirstAidScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex >= STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      return;
    }
    setStepIndex((current) => Math.min(STEPS.length - 1, current + 1));
  };

  const handleComplete = async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await recordActivity(repos, {
        localDate: getLocalDate(),
        activityType: "first_aid",
        metadata: { stepsCompleted: STEPS.length },
      });
      setIsSaved(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companion"] }),
        queryClient.invalidateQueries({ queryKey: ["quests"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-sessions"] }),
      ]);
    } catch (error) {
      console.warn("Failed to save first aid session", error);
      setErrorMessage("We couldn't save that session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="First Aid"
          subtitle="A gentle step-by-step reset for stressful moments."
          icon="medkit-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">
            Step {stepIndex + 1} of {STEPS.length}
          </AppText>
          <AppText variant="subtitle" style={styles.stepTitle}>
            {step.title}
          </AppText>
          <AppText tone="secondary" style={styles.stepBody}>
            {step.body}
          </AppText>
          <View style={styles.buttonRow}>
            {isLastStep ? (
              <Button
                label={isSaving ? "Saving..." : "Save session"}
                onPress={handleComplete}
                disabled={isSaving}
                style={styles.button}
                iconLeft="checkmark-circle-outline"
              />
            ) : (
              <Button
                label="Next step"
                onPress={handleNext}
                style={styles.button}
                iconLeft="arrow-forward-outline"
              />
            )}
          </View>
          {isSaved ? (
            <Button
              label="Back to Quests"
              variant="secondary"
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              iconLeft="arrow-back-outline"
            />
          ) : null}
          {errorMessage ? (
            <AppText tone="secondary" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}
        </Card>
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
  stepTitle: {
    marginTop: 12,
  },
  stepBody: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  backButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
});
