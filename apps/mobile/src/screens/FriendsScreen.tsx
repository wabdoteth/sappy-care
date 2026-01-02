import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";

export function FriendsScreen() {
  const { palette } = useTheme();
  const repos = useRepos();
  const navigation = useNavigation();

  const { data: friendCode } = useQuery({
    queryKey: ["friend-code"],
    queryFn: async () => {
      if (!repos.friends) {
        return "SEAL-000000";
      }
      return repos.friends.getFriendCode();
    },
  });
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
      return repos.friends.listSupportNotes({ limit: 10 });
    },
  });

  const friendsById = useMemo(() => {
    return new Map((friends ?? []).map((friend) => [friend.id, friend]));
  }, [friends]);

  const handleSendNote = (friendId?: string) => {
    if (friendId) {
      navigation.navigate("SendSupport" as never, { friendId } as never);
      return;
    }
    navigation.navigate("SendSupport" as never);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Friends"
          subtitle="Friend codes and warm support notes."
          icon="people-outline"
          action="auto"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Your friend code</AppText>
            <Ionicons name="qr-code-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.codeRow}>
            <View style={[styles.codePill, { backgroundColor: palette.surfaceMuted }]}>
              <AppText variant="label">{friendCode ?? "SEAL-000000"}</AppText>
            </View>
            <Chip label="Share" icon="share-outline" style={styles.shareChip} />
          </View>
          <AppText tone="secondary" style={styles.cardSubtitle}>
            Share your code to connect with other seals.
          </AppText>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Friend actions</AppText>
            <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.chipRow}>
            <Chip
              label="Add friend"
              icon="person-add-outline"
              style={styles.chip}
              onPress={() => navigation.navigate("AddFriend" as never)}
            />
            <Chip
              label="Send note"
              icon="paper-plane-outline"
              style={styles.chip}
              onPress={() => handleSendNote()}
            />
            <Chip
              label="Inbox"
              icon="mail-outline"
              style={styles.chip}
              onPress={() => navigation.navigate("SupportInbox" as never)}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Friends</AppText>
            <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
          </View>
          {(friends ?? []).length === 0 ? (
            <AppText tone="secondary" style={styles.cardSubtitle}>
              No friends yet. Add a friend to start sharing support notes.
            </AppText>
          ) : (
            (friends ?? []).map((friend) => (
              <View
                key={friend.id}
                style={[styles.friendRow, { borderColor: palette.border }]}
              >
                <View style={styles.friendLeft}>
                  <View
                    style={[styles.friendIcon, { backgroundColor: palette.surfaceMuted }]}
                  >
                    <Ionicons name="happy-outline" size={18} color={palette.primaryDark} />
                  </View>
                  <View>
                    <AppText variant="label">{friend.displayName}</AppText>
                    <AppText tone="secondary" variant="caption">
                      {friend.friendCode}
                    </AppText>
                  </View>
                </View>
                <Pressable
                  style={[styles.noteButton, { borderColor: palette.border }]}
                  onPress={() => handleSendNote(friend.id)}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={16}
                    color={palette.primaryDark}
                  />
                </Pressable>
              </View>
            ))
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Support notes</AppText>
            <Ionicons name="mail-outline" size={18} color={palette.primaryDark} />
          </View>
          {(notes ?? []).length === 0 ? (
            <AppText tone="secondary" style={styles.cardSubtitle}>
              Send a gentle note or wait for a seal friend to wave hello.
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
            label="Open inbox"
            variant="secondary"
            iconLeft="mail-outline"
            onPress={() => navigation.navigate("SupportInbox" as never)}
            style={styles.sendButton}
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
  cardSubtitle: {
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  codePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  shareChip: {
    marginLeft: 10,
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
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  friendLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  friendIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  noteButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
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
  sendButton: {
    marginTop: 14,
  },
});
