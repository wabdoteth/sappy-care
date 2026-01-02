import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { PalettePicker } from "../components/PalettePicker";
import { AppText, Card, Chip } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";
import { SealCompanion } from "../components/companion/SealCompanion";

export function MeScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { paletteId, palette, setPaletteId } = useTheme();
  const { data: companion } = useQuery({
    queryKey: ["companion"],
    queryFn: () => repos.companion.getCompanion(),
  });

  const daysTogether = useMemo(() => {
    if (!companion?.createdAt) {
      return 0;
    }
    const createdAt = new Date(companion.createdAt).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  }, [companion?.createdAt]);

  const handlePaletteChange = async (nextPaletteId: typeof paletteId) => {
    setPaletteId(nextPaletteId);
    if (!companion) {
      return;
    }
    try {
      const updated = await repos.companion.updateCompanion(companion.id, {
        paletteId: nextPaletteId,
      });
      queryClient.setQueryData(["companion"], updated);
    } catch (error) {
      console.warn("Failed to update palette", error);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Me"
        subtitle="Insights, history, and settings."
        icon="person-outline"
        action="auto"
      />

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <AppText variant="subtitle">Seal bond</AppText>
          <Ionicons name="heart-outline" size={18} color={palette.primaryDark} />
        </View>
        <View style={styles.bondRow}>
          <View style={styles.bondSeal}>
            <SealCompanion size={120} />
          </View>
          <View style={styles.bondCopy}>
            <AppText>{daysTogether} days together</AppText>
            <AppText tone="secondary" variant="caption" style={styles.bondCaption}>
              Keep showing up for tiny wins.
            </AppText>
          </View>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <AppText variant="subtitle">Palette</AppText>
          <Ionicons name="color-palette-outline" size={18} color={palette.primaryDark} />
        </View>
        <AppText tone="secondary" style={styles.cardSubtitle}>
          Choose the mood that feels right today.
        </AppText>
        <PalettePicker selectedId={paletteId} onSelect={handlePaletteChange} />
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <AppText variant="subtitle">Shortcuts</AppText>
          <Ionicons name="compass-outline" size={18} color={palette.primaryDark} />
        </View>
        <View style={styles.settingsRow}>
          <Chip
            label="Insights"
            icon="stats-chart-outline"
            style={styles.chip}
            onPress={() => navigation.navigate("Insights" as never)}
          />
          <Chip
            label="History"
            icon="time-outline"
            style={styles.chip}
            onPress={() => navigation.navigate("History" as never)}
          />
          <Chip
            label="Settings"
            icon="settings-outline"
            style={styles.chip}
            onPress={() => navigation.navigate("Settings" as never)}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  bondRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  bondSeal: {
    width: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  bondCopy: {
    flex: 1,
    marginLeft: 6,
    justifyContent: "center",
  },
  bondCaption: {
    marginTop: 6,
  },
  settingsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  chip: {
    marginRight: 10,
    marginBottom: 10,
  },
});
