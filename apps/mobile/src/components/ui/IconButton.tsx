import React from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../theme/useTheme";

type IconButtonVariant = "soft" | "ghost" | "solid";

type IconButtonProps = {
  name: string;
  size?: number;
  variant?: IconButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  name,
  size = 36,
  variant = "soft",
  onPress,
  disabled = false,
  style,
}: IconButtonProps) {
  const { palette } = useTheme();

  const backgroundColor =
    variant === "solid"
      ? palette.primary
      : variant === "ghost"
        ? "transparent"
        : palette.surfaceMuted;
  const borderColor =
    variant === "ghost" ? palette.border : palette.primaryDark;
  const iconColor =
    variant === "solid" ? "#ffffff" : palette.primaryDark;
  const shadowOpacity = variant === "ghost" ? 0 : 0.18;
  const elevation = variant === "ghost" ? 0 : 3;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor,
          shadowColor: palette.shadow,
          shadowOpacity,
          elevation,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {variant !== "ghost" ? (
        <View
          pointerEvents="none"
          style={[styles.highlight, { backgroundColor: palette.highlight }]}
        />
      ) : null}
      <Ionicons name={name} size={size * 0.5} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    top: -6,
    left: -8,
    right: -8,
    height: 18,
    opacity: 0.5,
  },
});
