import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip, Input } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";

type SendSupportParams = {
  friendId?: string;
};

export function SendSupportScreen() {
  const { palette } = useTheme();
  const repos = useRepos();
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const initialFriendId =
    (route.params as SendSupportParams | undefined)?.friendId ?? null;
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(
    initialFriendId
  );
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      if (!repos.friends) {
        return [];
      }
      return repos.friends.listFriends();
    },
  });

  const handleSend = async () => {
    if (!repos.friends) {
      setErrorMessage("Friends are not available yet.");
      return;
    }
    const trimmed = message.trim();
    if (!trimmed) {
      setErrorMessage("Write a quick note before sending.");
      return;
    }
    if (isSending) {
      return;
    }
    setErrorMessage(null);
    setIsSending(true);
    try {
      await repos.friends.addSupportNote({
        friendId: selectedFriendId ?? null,
        message: trimmed,
        direction: "outgoing",
      });
      await queryClient.invalidateQueries({ queryKey: ["support-notes"] });
      navigation.goBack();
    } catch (error) {
      console.warn("Failed to send support note", error);
      setErrorMessage("We couldn't send that note yet.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Send Support"
          subtitle="Share a gentle note with a seal friend."
          icon="paper-plane-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Choose friend</AppText>
            <Ionicons name="people-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.chipRow}>
            <Chip
              label="Any seal"
              icon="sparkles-outline"
              active={!selectedFriendId}
              onPress={() => setSelectedFriendId(null)}
              style={styles.chip}
            />
            {(friends ?? []).map((friend) => (
              <Chip
                key={friend.id}
                label={friend.displayName}
                icon="heart-outline"
                active={selectedFriendId === friend.id}
                onPress={() => setSelectedFriendId(friend.id)}
                style={styles.chip}
              />
            ))}
          </View>
          {(friends ?? []).length === 0 ? (
            <AppText tone="secondary" style={styles.cardSubtitle}>
              Add a friend to send direct notes.
            </AppText>
          ) : null}
          <Button
            label="Add friend"
            variant="secondary"
            iconLeft="person-add-outline"
            onPress={() => navigation.navigate("AddFriend" as never)}
            style={styles.actionButton}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Your note</AppText>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={palette.primaryDark} />
          </View>
          <Input
            placeholder="Write something kind..."
            value={message}
            onChangeText={setMessage}
            multiline
            style={styles.noteInput}
          />
          {errorMessage ? (
            <AppText tone="secondary" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}
          <Button
            label={isSending ? "Sending..." : "Send note"}
            iconLeft="paper-plane-outline"
            onPress={handleSend}
            disabled={isSending}
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
  noteInput: {
    marginTop: 12,
    minHeight: 110,
    textAlignVertical: "top",
  },
  actionButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 10,
  },
});
