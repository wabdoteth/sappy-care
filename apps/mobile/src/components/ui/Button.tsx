import React, { useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../theme/useTheme";
import { AppText } from "./Text";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  iconLeft?: string;
  iconRight?: string;
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; icon: number; minHeight: number }> = {
  sm: { paddingVertical: 10, paddingHorizontal: 18, fontSize: 13, icon: 15, minHeight: 36 },
  md: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 15, icon: 18, minHeight: 44 },
  lg: { paddingVertical: 18, paddingHorizontal: 26, fontSize: 18, icon: 20, minHeight: 52 },
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) {
    return `rgba(15, 23, 42, ${alpha})`;
  }
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  iconLeft,
  iconRight,
}: ButtonProps) {
  const { palette } = useTheme();
  const sizeConfig = sizeStyles[size];
  const scale = useRef(new Animated.Value(1)).current;
  const useNativeDriver = Platform.OS !== "web";

  const colors = useMemo(() => {
    if (variant === "primary") {
      return {
        background: palette.primary,
        border: palette.primaryDark,
        text: "#ffffff",
        shadow: palette.primaryDark,
        highlight: palette.highlight,
        shadowOpacity: 0.24,
      };
    }
    if (variant === "secondary") {
      return {
        background: palette.surfaceMuted,
        border: palette.border,
        text: palette.textPrimary,
        shadow: palette.shadow,
        highlight: palette.highlight,
        shadowOpacity: 0.12,
      };
    }
    return {
      background: "transparent",
      border: palette.border,
      text: palette.primaryDark,
      shadow: "transparent",
      highlight: "transparent",
      shadowOpacity: 0,
    };
  }, [palette, variant]);

  const handlePressIn = () => {
    if (disabled) {
      return;
    }
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver,
      speed: 28,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver,
      speed: 28,
      bounciness: 0,
    }).start();
  };

  const shadowStyle: ViewStyle =
    Platform.OS === "web"
      ? ({
          boxShadow: `0px 12px 20px ${hexToRgba(colors.shadow, colors.shadowOpacity)}`,
        } as ViewStyle)
      : {
          shadowColor: colors.shadow,
          shadowOpacity: colors.shadowOpacity,
        };

  const pressableStyle = ({ pressed }: PressableStateCallbackType) => [
    styles.base,
    {
      backgroundColor: colors.background,
      borderColor: colors.border,
      paddingVertical: sizeConfig.paddingVertical,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      minHeight: sizeConfig.minHeight,
      opacity: disabled ? 0.55 : pressed ? 0.9 : 1,
      shadowColor: colors.shadow,
    },
    shadowStyle,
    style,
  ];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={pressableStyle}
    >
      {variant !== "ghost" ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              backgroundColor: colors.highlight,
              opacity: disabled ? 0 : 0.42,
            },
          ]}
        />
      ) : null}
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        {iconLeft ? (
          <Ionicons
            name={iconLeft}
            size={sizeConfig.icon}
            color={colors.text}
            style={styles.iconLeft}
          />
        ) : null}
        <AppText
          variant="label"
          tone="inverted"
          style={[styles.label, { fontSize: sizeConfig.fontSize }, { color: colors.text }]}
        >
          {label}
        </AppText>
        {iconRight ? (
          <Ionicons
            name={iconRight}
            size={sizeConfig.icon}
            color={colors.text}
            style={styles.iconRight}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 26,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  label: {
    fontWeight: "600",
  },
  highlight: {
    position: "absolute",
    top: -8,
    left: 0,
    right: 0,
    height: 22,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
