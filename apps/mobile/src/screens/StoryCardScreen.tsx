import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import type { BloomStackParamList } from "../navigation/BloomStack";
import { Screen } from "../components/Screen";
import { AppText, Button, Card, Input } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { completeBloom } from "../services/localActions";
import { useTheme } from "../theme/useTheme";

type StoryCardRoute = RouteProp<BloomStackParamList, "StoryCard">;

export function StoryCardScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { palette } = useTheme();
  const route = useRoute<StoryCardRoute>();
  const { bloomRunId, storyInstanceId } = route.params;

  const { data: storyCards, isLoading: isCardsLoading } = useQuery({
    queryKey: ["story-cards"],
    queryFn: () => repos.shop.listStoryCards(),
  });
  const { data: storyInstances, isLoading: isInstancesLoading } = useQuery({
    queryKey: ["story-card-instances"],
    queryFn: () => repos.bloom.listStoryCardInstances(),
  });

  const storyInstance = useMemo(
    () => storyInstances?.find((item) => item.id === storyInstanceId),
    [storyInstances, storyInstanceId]
  );
  const storyCard = useMemo(
    () => storyCards?.find((card) => card.id === storyInstance?.storyCardId),
    [storyCards, storyInstance?.storyCardId]
  );

  const [selectedChoice, setSelectedChoice] = useState<"a" | "b" | null>(null);
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{
    petalsAwarded: number;
    stickerItemId: string | null;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (storyInstance?.choice) {
      setSelectedChoice(storyInstance.choice);
      setReflection(storyInstance.reflectionText ?? "");
      setIsCompleted(true);
    }
  }, [storyInstance]);

  const handleComplete = async () => {
    if (!selectedChoice || isSaving || isCompleted) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const result = await completeBloom(
        repos,
        bloomRunId,
        storyInstanceId,
        selectedChoice,
        reflection.trim()
      );
      setRewardInfo({
        petalsAwarded: result.petalsAwarded,
        stickerItemId: result.stickerItemId ?? null,
      });
      setIsCompleted(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companion"] }),
        queryClient.invalidateQueries({ queryKey: ["quests"] }),
        queryClient.invalidateQueries({ queryKey: ["story-card-instances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["ledger"] }),
      ]);
    } catch (error) {
      console.warn("Failed to complete bloom", error);
      setErrorMessage("We couldn't finish this bloom. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isCardsLoading || isInstancesLoading) {
    return (
      <Screen>
        <AppText variant="subtitle">Loading your story...</AppText>
      </Screen>
    );
  }

  if (!storyCard || !storyInstance) {
    return (
      <Screen>
        <AppText variant="subtitle">Story card not found.</AppText>
        <AppText tone="secondary" style={{ marginTop: 8 }}>
          Return to Seal Cove and try again.
        </AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Story Card"
          subtitle="A short moment to reflect and choose."
          icon="book-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">{storyCard.title}</AppText>
            <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
          </View>
          <AppText style={styles.bodyText}>{storyCard.body}</AppText>
        </Card>

        <Card style={styles.sectionCard}>
          <AppText variant="subtitle">Choose a path</AppText>
          <View style={styles.choiceRow}>
            <Button
              label={storyCard.choiceAText}
              variant={selectedChoice === "a" ? "primary" : "secondary"}
              onPress={() => setSelectedChoice("a")}
              disabled={isCompleted}
              style={styles.choiceButton}
              iconLeft="compass-outline"
            />
          </View>
          <View style={styles.choiceRow}>
            <Button
              label={storyCard.choiceBText}
              variant={selectedChoice === "b" ? "primary" : "secondary"}
              onPress={() => setSelectedChoice("b")}
              disabled={isCompleted}
              style={styles.choiceButton}
              iconLeft="navigate-outline"
            />
          </View>
          <AppText tone="secondary" style={styles.helperText}>
            You can add a short reflection before finishing.
          </AppText>
          <Input
            placeholder="Optional reflection..."
            value={reflection}
            onChangeText={setReflection}
            multiline
            editable={!isCompleted}
            style={styles.reflectionInput}
          />
          <Button
            label={isSaving ? "Finishing..." : "Finish bloom"}
            onPress={handleComplete}
            disabled={!selectedChoice || isSaving || isCompleted}
            style={styles.completeButton}
            iconLeft="sparkles-outline"
          />
          {errorMessage ? (
            <AppText tone="secondary" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}
        </Card>

        {isCompleted ? (
          <Card style={styles.sectionCard}>
            <AppText variant="subtitle">Cove splash complete</AppText>
            <AppText tone="secondary" style={styles.helperText}>
              Petals earned: {rewardInfo?.petalsAwarded ?? 0}
            </AppText>
            {rewardInfo?.stickerItemId ? (
              <AppText tone="secondary" style={styles.helperText}>
                You also earned a sticker in your inventory.
              </AppText>
            ) : null}
            <Button
              label="Back to Seal Cove"
              variant="secondary"
              onPress={() => navigation.navigate("BloomHome" as never)}
              style={styles.backButton}
              iconLeft="arrow-back-outline"
            />
          </Card>
        ) : null}
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
  bodyText: {
    marginTop: 12,
  },
  choiceRow: {
    marginTop: 12,
  },
  choiceButton: {
    width: "100%",
  },
  helperText: {
    marginTop: 12,
  },
  reflectionInput: {
    marginTop: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  completeButton: {
    marginTop: 12,
  },
  backButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
});
