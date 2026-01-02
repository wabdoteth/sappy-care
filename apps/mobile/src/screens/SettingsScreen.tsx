import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Modal } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { resetAppData } from "../data/resetAppData";
import { useTheme } from "../theme/useTheme";

export function SettingsScreen() {
  const repos = useRepos();
  const queryClient = useQueryClient();
  const { palette } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [exportJson, setExportJson] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => repos.user.getSettings(),
  });

  const handleTogglePauseMode = async () => {
    setErrorMessage(null);
    try {
      const updated = await repos.user.updateSettings({
        pauseMode: !settings?.pauseMode,
      });
      queryClient.setQueryData(["settings"], updated);
    } catch (error) {
      console.warn("Failed to update pause mode", error);
      setErrorMessage("We couldn't update pause mode.");
    }
  };

  const buildExport = async () => {
    const [
      currentSettings,
      companion,
      goals,
      completions,
      checkins,
      activities,
      quests,
      ledger,
      items,
      inventory,
      storyCards,
      storyInstances,
      friendCode,
      friends,
      supportNotes,
    ] = await Promise.all([
      repos.user.getSettings(),
      repos.companion.getCompanion(),
      repos.goals.listGoals({ includeArchived: true }),
      repos.goals.listCompletions(),
      repos.checkins.listCheckins(),
      repos.activity.listSessions(),
      repos.quests.listQuests(),
      repos.rewards.listLedgerEntries(),
      repos.shop.listItems(),
      repos.shop.listInventory(),
      repos.shop.listStoryCards(),
      repos.bloom.listStoryCardInstances(),
      repos.friends ? repos.friends.getFriendCode() : Promise.resolve(null),
      repos.friends ? repos.friends.listFriends() : Promise.resolve([]),
      repos.friends ? repos.friends.listSupportNotes() : Promise.resolve([]),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      settings: currentSettings,
      companion,
      goals,
      completions,
      checkins,
      activities,
      quests,
      ledger,
      items,
      inventory,
      storyCards,
      storyInstances,
      friendCode,
      friends,
      supportNotes,
    };
  };

  const handleExport = async () => {
    if (isExporting) {
      return;
    }
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const payload = await buildExport();
      setExportJson(JSON.stringify(payload, null, 2));
      setShowExport(true);
    } catch (error) {
      console.warn("Failed to export data", error);
      setErrorMessage("We couldn't export your data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = async () => {
    if (isResetting) {
      return;
    }
    setIsResetting(true);
    setErrorMessage(null);
    try {
      await resetAppData();
      queryClient.clear();
    } catch (error) {
      console.warn("Failed to reset data", error);
      setErrorMessage("We couldn't reset local data.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Settings"
          subtitle="Manage your local data and gentle mode."
          icon="settings-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Pause mode</AppText>
            <Ionicons name="pause-circle-outline" size={18} color={palette.primaryDark} />
          </View>
          <AppText tone="secondary" style={styles.cardSubtitle}>
            Reduce pressure cues on Today and Seal Cove.
          </AppText>
          <Button
            label={settings?.pauseMode ? "Pause mode: On" : "Pause mode: Off"}
            variant="secondary"
            onPress={handleTogglePauseMode}
            style={styles.actionButton}
            iconLeft={settings?.pauseMode ? "pause-circle-outline" : "play-circle-outline"}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Export data</AppText>
            <Ionicons name="download-outline" size={18} color={palette.primaryDark} />
          </View>
          <AppText tone="secondary" style={styles.cardSubtitle}>
            Generate a JSON export of your local data.
          </AppText>
          <Button
            label={isExporting ? "Preparing..." : "Generate export"}
            onPress={handleExport}
            style={styles.actionButton}
            iconLeft="download-outline"
          />
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Reset local data</AppText>
            <Ionicons name="trash-outline" size={18} color={palette.primaryDark} />
          </View>
          <AppText tone="secondary" style={styles.cardSubtitle}>
            Clears your companion, goals, and history on this device.
          </AppText>
          <Button
            label={isResetting ? "Resetting..." : "Reset data"}
            variant="secondary"
            onPress={handleReset}
            style={styles.actionButton}
            iconLeft="trash-outline"
          />
        </Card>

        {errorMessage ? (
          <AppText tone="secondary" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}
      </ScrollView>

      <Modal
        visible={showExport}
        onClose={() => setShowExport(false)}
        title="Export JSON"
      >
        <ScrollView style={styles.exportScroll}>
          <AppText selectable>{exportJson ?? ""}</AppText>
        </ScrollView>
        <View style={styles.exportActions}>
          <Button
            label="Close"
            variant="secondary"
            iconLeft="close-outline"
            onPress={() => setShowExport(false)}
          />
        </View>
      </Modal>
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
  cardSubtitle: {
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
  exportScroll: {
    maxHeight: 280,
  },
  exportActions: {
    marginTop: 16,
  },
});
