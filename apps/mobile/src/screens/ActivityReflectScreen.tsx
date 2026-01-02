import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip, Input } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { recordActivity } from "../services/localActions";
import { getLocalDate } from "../utils/date";

const PROMPTS = [
  "What felt soft today?",
  "Where do you want more ease?",
  "Name one small win.",
  "What do you need tomorrow?",
  "What helped you feel steady?",
];

export function ActivityReflectScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [promptIndex, setPromptIndex] = useState(
    Math.floor(Math.random() * PROMPTS.length)
  );
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prompt = useMemo(() => PROMPTS[promptIndex], [promptIndex]);
  const canSave = note.trim().length > 0 && !isSaving;

  const handleShuffle = () => {
    setPromptIndex((current) => (current + 1) % PROMPTS.length);
    setIsSaved(false);
    setErrorMessage(null);
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
        activityType: "reflect",
        note: note.trim(),
        metadata: { prompt },
      });
      setIsSaved(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companion"] }),
        queryClient.invalidateQueries({ queryKey: ["quests"] }),
        queryClient.invalidateQueries({ queryKey: ["activity-sessions"] }),
      ]);
    } catch (error) {
      console.warn("Failed to save reflection", error);
      setErrorMessage("We couldn't save that reflection. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Reflect"
          subtitle="A few lines to help you slow down and notice."
          icon="pencil-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">Prompt</AppText>
          <AppText tone="secondary" style={styles.promptText}>
            {prompt}
          </AppText>
          <View style={styles.chipRow}>
            <Chip
              label="New prompt"
              icon="refresh-outline"
              onPress={handleShuffle}
              style={styles.chip}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">Your note</AppText>
          <Input
            placeholder="Write a few lines..."
            value={note}
            onChangeText={setNote}
            multiline
            style={styles.noteInput}
          />
          <Button
            label={isSaving ? "Saving..." : "Save session"}
            onPress={handleSave}
            disabled={!canSave}
            style={styles.saveButton}
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
  promptText: {
    marginTop: 8,
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
  noteInput: {
    marginTop: 12,
    minHeight: 120,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 12,
  },
  backButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
});
