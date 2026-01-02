import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Card } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useTheme } from "../theme/useTheme";

const activities = [
  {
    id: "breathe",
    title: "Breathe",
    description: "Slow inhale, longer exhale.",
    icon: "cloud-outline",
    route: "ActivityBreathe",
  },
  {
    id: "focus",
    title: "Focus",
    description: "A short timer for one tiny task.",
    icon: "alarm-outline",
    route: "ActivityFocus",
  },
  {
    id: "sound",
    title: "Sound",
    description: "Ambient sound + timer.",
    icon: "headset-outline",
    route: "ActivitySound",
  },
  {
    id: "reflect",
    title: "Reflect",
    description: "A gentle prompt to jot down.",
    icon: "pencil-outline",
    route: "ActivityReflect",
  },
  {
    id: "first_aid",
    title: "First Aid",
    description: "Step-by-step grounding reset.",
    icon: "medkit-outline",
    route: "ActivityFirstAid",
  },
];

export function CareScreen() {
  const navigation = useNavigation();
  const { palette } = useTheme();

  return (
    <Screen>
      <ScreenHeader
        title="Care Cove"
        subtitle="Quick resets and cozy rituals."
        icon="heart-outline"
      />

      <View style={styles.activityList}>
        {activities.map((activity) => (
          <Pressable
            key={activity.id}
            onPress={() => navigation.navigate(activity.route as never)}
            style={styles.activityPressable}
          >
            <Card style={styles.activityCard}>
              <View style={styles.activityRow}>
                <View style={[styles.activityBadge, { backgroundColor: palette.surfaceMuted }]}>
                  <Ionicons name={activity.icon} size={20} color={palette.primaryDark} />
                </View>
                <View style={styles.activityCopy}>
                  <AppText variant="subtitle">{activity.title}</AppText>
                  <AppText tone="secondary" variant="caption">
                    {activity.description}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={palette.textMuted} />
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  activityList: {
    marginTop: 12,
  },
  activityPressable: {
    marginBottom: 14,
  },
  activityCard: {
    paddingVertical: 16,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityCopy: {
    flex: 1,
  },
});
