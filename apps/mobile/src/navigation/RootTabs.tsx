import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { TodayStack } from "./TodayStack";
import { CareStack } from "./CareStack";
import { BloomStack } from "./BloomStack";
import { FriendsStack } from "./FriendsStack";
import { MeStack } from "./MeStack";
import { useTheme } from "../theme/useTheme";

export type RootTabParamList = {
  Today: undefined;
  Care: undefined;
  Bloom: undefined;
  Friends: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootTabs() {
  const { palette } = useTheme();
  const labelFont = Platform.select({
    ios: "Avenir Next Rounded",
    android: "sans-serif-rounded",
    web: "Trebuchet MS",
    default: "sans-serif",
  });
  const iconBackgrounds: Record<string, string> = {
    Today: "#FFE6A9",
    Care: "#CDEFFF",
    Bloom: "#FFD7C6",
    Friends: "#DFF2B6",
    Me: "#DED9FF",
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderWidth: 2,
          borderRadius: 28,
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 8,
          height: 82,
          paddingBottom: 12,
          paddingTop: 10,
          shadowColor: palette.shadow,
          shadowOpacity: 0.16,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -8 },
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: labelFont,
          letterSpacing: 0.2,
        },
        tabBarLabel:
          route.name === "Today"
            ? "Home"
            : route.name === "Care"
              ? "Quests"
              : route.name === "Bloom"
                ? "Shop"
                : route.name === "Me"
                  ? "Bag"
                  : route.name,
        tabBarIcon: ({ focused }) => {
          const name =
            route.name === "Today"
              ? "home-outline"
              : route.name === "Care"
                ? "checkbox-outline"
                : route.name === "Bloom"
                  ? "storefront-outline"
                  : route.name === "Friends"
                    ? "people-outline"
                    : "bag-handle-outline";
          const iconColor = focused ? palette.primaryDark : palette.textSecondary;
          const backgroundColor = iconBackgrounds[route.name] ?? palette.surfaceMuted;
          const borderColor = palette.border;
          return (
            <View style={[styles.tabIcon, { backgroundColor, borderColor, shadowColor: palette.shadow }]}>
              <Ionicons name={name} size={20} color={iconColor} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayStack} />
      <Tab.Screen name="Care" component={CareStack} />
      <Tab.Screen name="Bloom" component={BloomStack} />
      <Tab.Screen name="Friends" component={FriendsStack} />
      <Tab.Screen name="Me" component={MeStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
});
