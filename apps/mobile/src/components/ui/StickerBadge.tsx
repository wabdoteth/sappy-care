import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../theme/useTheme";
import { AppText } from "./Text";

type StickerTone = "accent" | "primary" | "mint";
type StickerSize = "sm" | "md";

type StickerBadgeProps = {
  label: string;
  icon: string;
  tone?: StickerTone;
  size?: StickerSize;
  style?: StyleProp<ViewStyle>;
};

const sizeConfig = {
  sm: { paddingX: 10, paddingY: 6, fontSize: 11, icon: 12 },
  md: { paddingX: 12, paddingY: 8, fontSize: 12, icon: 14 },
};

export function StickerBadge({
  label,
  icon,
  tone = "accent",
  size = "sm",
  style,
}: StickerBadgeProps) {
  const { palette } = useTheme();
  const sizing = sizeConfig[size];
  const backgroundColor =
    tone === "primary"
      ? palette.primary
      : tone === "mint"
        ? palette.success
        : palette.accent;
  const borderColor = palette.primaryDark;
  const textColor = "#ffffff";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderColor,
          paddingHorizontal: sizing.paddingX,
          paddingVertical: sizing.paddingY,
          shadowColor: palette.shadow,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.shine, { backgroundColor: palette.highlight }]}
      />
      <Ionicons name={icon} size={sizing.icon} color={textColor} style={styles.icon} />
      <AppText style={{ color: textColor, fontSize: sizing.fontSize }} variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
    transform: [{ rotate: "-4deg" }],
    overflow: "hidden",
  },
  icon: {
    marginRight: 6,
  },
  shine: {
    position: "absolute",
    top: -6,
    left: -8,
    right: -8,
    height: 16,
    opacity: 0.4,
  },
});
