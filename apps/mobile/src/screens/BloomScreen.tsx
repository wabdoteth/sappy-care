import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip } from "../components/ui";
import { useTheme } from "../theme/useTheme";

export function BloomScreen() {
  const { palette } = useTheme();

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={[styles.headerBadge, { backgroundColor: palette.surfaceMuted }]}>
          <Ionicons name="home-outline" size={20} color={palette.primaryDark} />
        </View>
        <View style={styles.headerCopy}>
          <AppText variant="display">Seal Cove</AppText>
          <AppText tone="secondary">
            Companion home, stories, and shop entry.
          </AppText>
        </View>
      </View>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <AppText variant="subtitle">Companion</AppText>
          <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
        </View>
        <AppText tone="secondary" style={styles.cardSubtitle}>
          Charge builds in Today and Quests. Cove splash unlocks at 60.
        </AppText>
        <Button label="Cove splash" disabled iconLeft="sparkles-outline" />
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <AppText variant="subtitle">Story album</AppText>
          <Ionicons name="book-outline" size={18} color={palette.primaryDark} />
        </View>
        <View style={styles.chipRow}>
          <Chip label="Story cards" icon="albums-outline" style={styles.chip} />
          <Chip label="Shop" icon="bag-outline" style={styles.chip} />
          <Chip label="Bag" icon="bag-handle-outline" style={styles.chip} />
        </View>
      </Card>
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  chip: {
    marginRight: 10,
    marginBottom: 10,
  },
});
