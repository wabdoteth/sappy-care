import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../theme/useTheme";

type IconBadgeTone = "soft" | "accent";

type IconBadgeProps = {
  name: string;
  size?: number;
  tone?: IconBadgeTone;
  style?: StyleProp<ViewStyle>;
};

export function IconBadge({ name, size = 42, tone = "soft", style }: IconBadgeProps) {
  const { palette } = useTheme();
  const backgroundColor = tone === "accent" ? palette.highlight : palette.surfaceMuted;
  const iconColor = palette.primaryDark;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.shine, { backgroundColor: palette.highlight }]}
      />
      <Ionicons name={name} size={size * 0.48} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    top: -6,
    left: -8,
    right: -8,
    height: 18,
    opacity: 0.5,
  },
});
