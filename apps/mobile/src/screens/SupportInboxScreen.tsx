import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";

export function SupportInboxScreen() {
  const { palette } = useTheme();
  const repos = useRepos();
  const navigation = useNavigation();

  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      if (!repos.friends) {
        return [];
      }
      return repos.friends.listFriends();
    },
  });
  const { data: notes } = useQuery({
    queryKey: ["support-notes"],
    queryFn: async () => {
      if (!repos.friends) {
        return [];
      }
      return repos.friends.listSupportNotes({ limit: 40 });
    },
  });

  const friendsById = useMemo(() => {
    return new Map((friends ?? []).map((friend) => [friend.id, friend]));
  }, [friends]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Support Inbox"
          subtitle="Warm notes from your seal friends."
          icon="mail-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Quick actions</AppText>
            <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.chipRow}>
            <Chip
              label="Send note"
              icon="paper-plane-outline"
              style={styles.chip}
              onPress={() => navigation.navigate("SendSupport" as never)}
            />
            <Chip
              label="Add friend"
              icon="person-add-outline"
              style={styles.chip}
              onPress={() => navigation.navigate("AddFriend" as never)}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Recent notes</AppText>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={palette.primaryDark} />
          </View>
          {(notes ?? []).length === 0 ? (
            <AppText tone="secondary" style={styles.cardSubtitle}>
              No notes yet. Send a kind message to start the wave.
            </AppText>
          ) : (
            (notes ?? []).map((note) => {
              const friend = note.friendId ? friendsById.get(note.friendId) : null;
              return (
                <View
                  key={note.id}
                  style={[styles.noteRow, { backgroundColor: palette.surfaceMuted }]}
                >
                  <Ionicons
                    name={note.direction === "incoming" ? "heart-outline" : "paper-plane-outline"}
                    size={16}
                    color={palette.primaryDark}
                    style={styles.noteIcon}
                  />
                  <View style={styles.noteCopy}>
                    <AppText variant="label">
                      {friend?.displayName ?? "Seal pal"}
                    </AppText>
                    <AppText tone="secondary" variant="caption">
                      {note.message}
                    </AppText>
                  </View>
                </View>
              );
            })
          )}
          <Button
            label="Send another note"
            variant="secondary"
            iconLeft="paper-plane-outline"
            onPress={() => navigation.navigate("SendSupport" as never)}
            style={styles.actionButton}
          />
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
  cardSubtitle: {
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
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 10,
  },
  noteIcon: {
    marginRight: 10,
  },
  noteCopy: {
    flex: 1,
  },
  actionButton: {
    marginTop: 14,
  },
});
