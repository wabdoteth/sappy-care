import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Card } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";

export function BloomAlbumScreen() {
  const repos = useRepos();
  const { palette } = useTheme();

  const { data: storyCards } = useQuery({
    queryKey: ["story-cards"],
    queryFn: () => repos.shop.listStoryCards(),
  });
  const { data: storyInstances } = useQuery({
    queryKey: ["story-card-instances"],
    queryFn: () => repos.bloom.listStoryCardInstances(),
  });

  const cardsById = useMemo(() => {
    return new Map((storyCards ?? []).map((card) => [card.id, card]));
  }, [storyCards]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Story album"
          subtitle="A record of the stories you've splashed."
          icon="albums-outline"
          action="back"
        />

        {(storyInstances ?? []).length === 0 ? (
          <Card style={styles.sectionCard}>
            <AppText tone="secondary">No story cards yet.</AppText>
          </Card>
        ) : (
          (storyInstances ?? []).map((instance) => {
            const card = cardsById.get(instance.storyCardId);
            return (
            <Card key={instance.id} style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <AppText variant="subtitle">{card?.title ?? "Story card"}</AppText>
                <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
              </View>
              <AppText tone="secondary" style={styles.cardMeta}>
                {new Date(instance.createdAt).toLocaleDateString()}
              </AppText>
                <AppText style={styles.cardBody}>{card?.body ?? ""}</AppText>
                {instance.choice ? (
                  <AppText tone="secondary" style={styles.cardMeta}>
                    Chose {instance.choice === "a" ? "A" : "B"}
                  </AppText>
                ) : null}
                {instance.reflectionText ? (
                  <AppText tone="secondary" style={styles.cardMeta}>
                    Reflection: {instance.reflectionText}
                  </AppText>
                ) : null}
              </Card>
            );
          })
        )}
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
  cardMeta: {
    marginTop: 6,
  },
  cardBody: {
    marginTop: 10,
  },
});
