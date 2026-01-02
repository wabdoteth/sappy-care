import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { SealRoomScene } from "../components/companion/SealRoomScene";
import type { SealMood } from "../components/companion/SealCompanion";
import { useRepos } from "../data/RepoProvider";
import { startBloom } from "../services/localActions";
import { useTheme } from "../theme/useTheme";
import { getLocalDate } from "../utils/date";

const BLOOM_THRESHOLD = 60;
const petMessages = [
  "Your seal wiggles happily.",
  "Soft flippers, soft vibes.",
  "Happy seal squeaks!",
  "A tiny nose boop.",
];

export function BloomHomeScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const { palette } = useTheme();
  const [isBlooming, setIsBlooming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [petMessage, setPetMessage] = useState<string | null>(null);
  const [petMood, setPetMood] = useState<SealMood>("calm");
  const [petKey, setPetKey] = useState(0);
  const petTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const chargeValue = Math.min(100, Math.max(0, companion?.charge ?? 0));
  const canBloom = chargeValue >= BLOOM_THRESHOLD;
  const pauseMode = settings?.pauseMode ?? false;

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
      if (petTimeoutRef.current) {
        clearTimeout(petTimeoutRef.current);
      }
    };
  }, []);

  const handleBloom = async () => {
    if (!canBloom || isBlooming) {
      return;
    }
    setIsBlooming(true);
    setErrorMessage(null);
    try {
      const result = await startBloom(repos, getLocalDate());
      navigation.navigate(
        "StoryCard" as never,
        {
          bloomRunId: result.bloomRun.id,
          storyInstanceId: result.instance.id,
        } as never
      );
    } catch (error) {
      console.warn("Failed to start bloom", error);
      setErrorMessage("Cove splash isn't ready yet. Try again soon.");
    } finally {
      setIsBlooming(false);
    }
  };

  const handlePet = () => {
    const next = petMessages[Math.floor(Math.random() * petMessages.length)];
    setPetMessage(next);
    setPetMood("happy");
    setPetKey((value) => value + 1);
    if (petTimeoutRef.current) {
      clearTimeout(petTimeoutRef.current);
    }
    petTimeoutRef.current = setTimeout(() => {
      setPetMessage(null);
      setPetMood("calm");
    }, 2000);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Seal Cove"
          subtitle="Decorate the cove, splash into stories, and shop for goodies."
          icon="home-outline"
          action="auto"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Seal cove</AppText>
            <Chip
              label={pauseMode ? "Soft day" : "Adventure ready"}
              icon={pauseMode ? "heart-outline" : "sparkles-outline"}
              style={styles.headerChip}
            />
          </View>
          <SealRoomScene
            size={260}
            equippedItems={equippedItems}
            mood={petMood}
            interactionKey={petKey}
          />
          <View style={styles.metaRow}>
            <View
              style={[
                styles.metaPill,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              <Ionicons name="pulse-outline" size={14} color={palette.primaryDark} />
              <AppText variant="caption" style={styles.metaLabel}>
                Charge {chargeValue} / 100
              </AppText>
            </View>
            <View
              style={[
                styles.metaPill,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              <Ionicons name="flower-outline" size={14} color={palette.primaryDark} />
              <AppText variant="caption" style={styles.metaLabel}>
                {companion?.petalsBalance ?? 0} petals
              </AppText>
            </View>
          </View>
          <View style={styles.roomActions}>
            <Button
              label="Pet seal"
              variant="secondary"
              size="sm"
              iconLeft="hand-left-outline"
              onPress={handlePet}
              style={styles.roomButton}
            />
            <Button
              label={
                isBlooming ? "Splashing..." : canBloom ? "Cove splash" : "Cove locked"
              }
              onPress={handleBloom}
              disabled={!canBloom || isBlooming}
              style={[styles.roomButton, styles.roomButtonSpacing]}
              iconLeft="sparkles-outline"
              size="sm"
            />
          </View>
          <AppText tone="secondary" style={styles.helperText}>
            Cove splash unlocks at {BLOOM_THRESHOLD} charge.
          </AppText>
          {petMessage ? (
            <AppText tone="secondary" style={styles.helperText}>
              {petMessage}
            </AppText>
          ) : null}
          {pauseMode ? (
            <AppText tone="secondary" style={styles.helperText}>
              Pause mode is on. Gentle pace today.
            </AppText>
          ) : null}
          {errorMessage ? (
            <AppText tone="secondary" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Equipped finds</AppText>
            <Ionicons name="shirt-outline" size={18} color={palette.primaryDark} />
          </View>
          {equippedItems.length === 0 ? (
            <AppText tone="secondary" style={styles.helperText}>
              Outfit your seal and decorate the cove in the shop.
            </AppText>
          ) : (
            <View style={styles.chipRow}>
              {equippedItems.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  icon="sparkles-outline"
                  style={styles.chip}
                />
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Explore</AppText>
            <Ionicons name="compass-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.chipRow}>
            <Chip
              label="Story album"
              icon="book-outline"
              style={styles.chip}
              onPress={() => navigation.navigate("BloomAlbum" as never)}
            />
            <Chip
              label="Shop"
              icon="bag-outline"
              style={styles.chip}
              onPress={() => navigation.navigate("Shop" as never)}
            />
            <Chip
              label="Bag"
              icon="bag-handle-outline"
              style={styles.chip}
              onPress={() => navigation.navigate("Inventory" as never)}
            />
          </View>
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerChip: {
    alignSelf: "flex-start",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: "#1c2a33",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  metaLabel: {
    marginLeft: 6,
  },
  roomActions: {
    flexDirection: "row",
    marginTop: 10,
  },
  roomButton: {
    flex: 1,
  },
  roomButtonSpacing: {
    marginLeft: 12,
  },
  helperText: {
    marginTop: 10,
  },
  errorText: {
    marginTop: 10,
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
