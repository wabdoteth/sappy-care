import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "./ui";
import { useTheme } from "../theme/useTheme";

type QuickActionTone = "primary" | "accent" | "mint";

export type QuickAction = {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
  tone?: QuickActionTone;
};

type QuickDrawerProps = {
  title?: string;
  actions: QuickAction[];
  style?: StyleProp<ViewStyle>;
};

export function QuickDrawer({ title = "Quick dock", actions, style }: QuickDrawerProps) {
  const { palette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver,
    }).start();
  }, [anim, isOpen, useNativeDriver]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [90, 0],
  });
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleActionPress = (action: QuickAction) => {
    action.onPress();
    setIsOpen(false);
  };

  return (
    <View pointerEvents="box-none" style={[styles.container, style]}>
      <Animated.View
        pointerEvents={isOpen ? "auto" : "none"}
        style={[
          styles.drawer,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            shadowColor: palette.shadow,
            opacity,
            transform: [{ translateX }, { scale }],
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.drawerShine, { backgroundColor: palette.highlight }]}
        />
        <View style={styles.drawerHeader}>
          <Ionicons name="grid-outline" size={14} color={palette.primaryDark} />
          <AppText variant="caption" style={styles.drawerTitle}>
            {title}
          </AppText>
        </View>
        <View style={styles.actionList}>
          {actions.map((action, index) => {
            const tone = action.tone ?? "primary";
            const backgroundColor =
              tone === "accent"
                ? palette.accent
                : tone === "mint"
                  ? palette.success
                  : palette.primary;
            const borderColor = palette.primaryDark;
            return (
              <Pressable
                key={action.key}
                onPress={() => handleActionPress(action)}
                style={({ pressed }) => [
                  styles.actionRow,
                  {
                    backgroundColor,
                    borderColor,
                    shadowColor: palette.shadow,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    marginBottom: index === actions.length - 1 ? 0 : 8,
                  },
                ]}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name={action.icon} size={16} color="#ffffff" />
                </View>
                <AppText variant="label" tone="inverted" style={styles.actionLabel}>
                  {action.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((value) => !value)}
        style={[
          styles.handle,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
            shadowColor: palette.shadow,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[styles.handleShine, { backgroundColor: palette.highlight }]}
        />
        <Ionicons
          name={isOpen ? "close-outline" : "flash-outline"}
          size={18}
          color={palette.primaryDark}
          style={styles.handleIcon}
        />
        <AppText variant="caption">Dock</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
  },
  drawer: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 12,
    marginBottom: 8,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
    overflow: "hidden",
  },
  drawerShine: {
    position: "absolute",
    top: -12,
    left: -18,
    right: -18,
    height: 36,
    opacity: 0.45,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  drawerTitle: {
    marginLeft: 6,
  },
  actionList: {
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  actionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    marginRight: 8,
  },
  actionLabel: {
    letterSpacing: 0.2,
  },
  handle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 4,
    overflow: "hidden",
  },
  handleShine: {
    position: "absolute",
    top: -6,
    left: -10,
    right: -10,
    height: 18,
    opacity: 0.45,
  },
  handleIcon: {
    marginRight: 6,
  },
});
