import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useCountdown } from "../hooks/useCountdown";
import { recordActivity } from "../services/localActions";
import { getLocalDate } from "../utils/date";
import { formatTimer } from "../utils/time";

const FOCUS_OPTIONS = [
  { label: "5 min", seconds: 5 * 60 },
  { label: "10 min", seconds: 10 * 60 },
  { label: "15 min", seconds: 15 * 60 },
];

export function ActivityFocusScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [selectedDuration, setSelectedDuration] = useState(FOCUS_OPTIONS[0].seconds);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { duration, secondsLeft, isRunning, start, pause, reset } = useCountdown(
    selectedDuration,
    () => setIsFinished(true)
  );

  const secondsElapsed = duration - secondsLeft;
  const canSave = secondsElapsed > 0 && !isSaving;

  const handleSelectDuration = (value: number) => {
    setSelectedDuration(value);
    setIsFinished(false);
    setIsSaved(false);
    setErrorMessage(null);
    reset(value);
  };

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
    reset(selectedDuration);
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
        activityType: "focus",
        durationSeconds: secondsElapsed,
        metadata: { focusMinutes: Math.round(duration / 60) },
      });
      setIsSaved(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companion"] }),
        queryClient.invalidateQueries({ queryKey: ["quests"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-sessions"] }),
      ]);
    } catch (error) {
      console.warn("Failed to save focus session", error);
      setErrorMessage("We couldn't save that session. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Focus"
          subtitle="Set a short focus block and check it off."
          icon="alarm-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">Duration</AppText>
          <View style={styles.chipRow}>
            {FOCUS_OPTIONS.map((option) => (
              <Chip
                key={option.seconds}
                label={option.label}
                active={selectedDuration === option.seconds}
                icon="timer-outline"
                onPress={() => handleSelectDuration(option.seconds)}
                style={styles.chip}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">Timer</AppText>
          <AppText variant="title" style={styles.timerText}>
            {formatTimer(secondsLeft)}
          </AppText>
          <AppText tone="secondary" style={styles.instructions}>
            Pick one task and stay with it for this block.
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
            Save this focus block to your care log.
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  chip: {
    marginRight: 10,
    marginBottom: 10,
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
