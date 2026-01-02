import React from "react";
import { Platform, Text as RNText, StyleSheet, type StyleProp, type TextProps, type TextStyle } from "react-native";

import { useTheme } from "../../theme/useTheme";

type TextTone = "primary" | "secondary" | "accent" | "muted" | "inverted";
type TextVariant = "display" | "title" | "subtitle" | "body" | "caption" | "label";

type AppTextProps = TextProps & {
  tone?: TextTone;
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  tone = "primary",
  variant = "body",
  style,
  ...props
}: AppTextProps) {
  const { palette } = useTheme();

  const color =
    tone === "inverted"
      ? "#ffffff"
      : tone === "accent"
        ? palette.accent
        : tone === "muted"
          ? palette.textMuted
          : tone === "secondary"
            ? palette.textSecondary
            : palette.textPrimary;

  return (
    <RNText style={[styles[variant], { color }, style]} {...props} />
  );
}

const displayFont = Platform.select({
  ios: "Avenir Next Rounded",
  android: "sans-serif-rounded",
  web: "Trebuchet MS",
  default: "sans-serif",
});

const bodyFont = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif-rounded",
  web: "Trebuchet MS",
  default: "sans-serif",
});

const styles = StyleSheet.create({
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -0.4,
    fontFamily: displayFont,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontFamily: displayFont,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
    fontFamily: displayFont,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: bodyFont,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    fontFamily: bodyFont,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
    fontFamily: bodyFont,
  },
});
