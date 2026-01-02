import React from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../theme/useTheme";

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
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

export function Card({ children, style }: CardProps) {
  const { palette } = useTheme();
  const shadowStyle: ViewStyle =
    Platform.OS === "web"
      ? ({
          boxShadow: `0px 16px 32px ${hexToRgba(palette.shadow, 0.18)}`,
        } as ViewStyle)
      : {
          shadowColor: palette.shadow,
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.18,
          shadowRadius: 28,
          elevation: 5,
        };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        shadowStyle,
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.shine, { backgroundColor: palette.highlight }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 2,
    overflow: "hidden",
  },
  shine: {
    position: "absolute",
    height: 58,
    width: "120%",
    top: -18,
    left: -24,
    opacity: 0.45,
    transform: [{ rotate: "-6deg" }],
  },
});
