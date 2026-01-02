import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Input } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";

export function AddFriendScreen() {
  const { palette } = useTheme();
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [friendNameInput, setFriendNameInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: friendCode } = useQuery({
    queryKey: ["friend-code"],
    queryFn: async () => {
      if (!repos.friends) {
        return "SEAL-000000";
      }
      return repos.friends.getFriendCode();
    },
  });

  const handleAddFriend = async () => {
    if (!repos.friends) {
      setErrorMessage("Friends are not available yet.");
      return;
    }
    const nextCode = friendCodeInput.trim();
    if (!nextCode) {
      setErrorMessage("Add a friend code to continue.");
      return;
    }
    if (isAdding) {
      return;
    }
    setErrorMessage(null);
    setIsAdding(true);
    try {
      await repos.friends.addFriend({
        friendCode: nextCode,
        displayName: friendNameInput.trim() || "Seal buddy",
      });
      await queryClient.invalidateQueries({ queryKey: ["friends"] });
      navigation.goBack();
    } catch (error) {
      console.warn("Failed to add friend", error);
      setErrorMessage("We couldn't add that friend yet.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Add Friend"
          subtitle="Share codes to connect with another seal."
          icon="person-add-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Your code</AppText>
            <Ionicons name="qr-code-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={[styles.codePill, { backgroundColor: palette.surfaceMuted }]}>
            <AppText variant="label">{friendCode ?? "SEAL-000000"}</AppText>
          </View>
          <AppText tone="secondary" style={styles.cardSubtitle}>
            Share this code with a friend to connect.
          </AppText>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Friend details</AppText>
            <Ionicons name="heart-outline" size={18} color={palette.primaryDark} />
          </View>
          <Input
            placeholder="Friend code (ex: SEAL-123456)"
            value={friendCodeInput}
            onChangeText={setFriendCodeInput}
            autoCapitalize="characters"
            style={styles.input}
          />
          <Input
            placeholder="Nickname (optional)"
            value={friendNameInput}
            onChangeText={setFriendNameInput}
            style={styles.input}
          />
          {errorMessage ? (
            <AppText tone="secondary" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}
          <Button
            label={isAdding ? "Adding..." : "Add friend"}
            iconLeft="heart-outline"
            onPress={handleAddFriend}
            disabled={isAdding}
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
  codePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 12,
  },
  input: {
    marginTop: 12,
  },
  actionButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 10,
  },
});
