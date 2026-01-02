import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen } from "../components/Screen";
import { AppText, Button, Card } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useCountdown } from "../hooks/useCountdown";
import { recordActivity } from "../services/localActions";
import { getLocalDate } from "../utils/date";
import { formatTimer } from "../utils/time";

const DEFAULT_DURATION = 60;

export function ActivityBreatheScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { duration, secondsLeft, isRunning, start, pause, reset } = useCountdown(
    DEFAULT_DURATION,
    () => setIsFinished(true)
  );

  const secondsElapsed = duration - secondsLeft;
  const canSave = secondsElapsed > 0 && !isSaving;

  const handleStartPause = () => {
    if (isRunning) {
      pause();
      return;
    }
    if (secondsLeft === 0) {
      setIsFinished(false);
      setIsSaved(false);
    }
    start();
  };

  const handleReset = () => {
    setIsFinished(false);
    setIsSaved(false);
    setErrorMessage(null);
    reset(DEFAULT_DURATION);
  };

  const handleSave = async () => {
    if (!canSave) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await recordActivity(repos, {
        localDate: getLocalDate(),
        activityType: "breathe",
        durationSeconds: secondsElapsed,
        metadata: { pace: "slow" },
      });
      setIsSaved(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companion"] }),
        queryClient.invalidateQueries({ queryKey: ["quests"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-sessions"] }),
      ]);
    } catch (error) {
      console.warn("Failed to save breathe session", error);
      setErrorMessage("We couldn't save that session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Breathe"
          subtitle="A short guided reset for your body and mind."
          icon="cloud-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">Timer</AppText>
          <AppText variant="title" style={styles.timerText}>
            {formatTimer(secondsLeft)}
          </AppText>
          <AppText tone="secondary" style={styles.instructions}>
            Inhale for 4, exhale for 6. Repeat slowly.
          </AppText>
          <View style={styles.buttonRow}>
            <Button
              label={isRunning ? "Pause" : secondsLeft === 0 ? "Restart" : "Start"}
              onPress={handleStartPause}
              style={styles.button}
              iconLeft={isRunning ? "pause-outline" : "play-outline"}
            />
            <Button
              label="Reset"
              variant="secondary"
              onPress={handleReset}
              style={[styles.button, styles.buttonSpacing]}
              iconLeft="refresh-outline"
            />
          </View>
          {isFinished ? (
            <AppText tone="secondary" style={styles.helperText}>
              Timer complete. Save your session when you're ready.
            </AppText>
          ) : null}
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">Save session</AppText>
          <AppText tone="secondary" style={styles.instructions}>
            Save this session to your care log for today.
          </AppText>
          <Button
            label={isSaving ? "Saving..." : "Save session"}
            onPress={handleSave}
            disabled={!canSave}
            iconLeft="checkmark-circle-outline"
          />
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
  timerText: {
    marginTop: 12,
  },
  instructions: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  buttonSpacing: {
    marginLeft: 12,
  },
  helperText: {
    marginTop: 12,
  },
  backButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
});
