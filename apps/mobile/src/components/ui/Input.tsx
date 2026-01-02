import React from "react";
import { Platform, StyleSheet, TextInput, type TextInputProps } from "react-native";

import { useTheme } from "../../theme/useTheme";

type InputProps = TextInputProps & {
  size?: "sm" | "md";
};

export function Input({ size = "md", style, ...props }: InputProps) {
  const { palette } = useTheme();
  const padding = size === "sm" ? 10 : 12;
  const fontFamily = Platform.select({
    ios: "Avenir Next",
    android: "sans-serif-rounded",
    web: "Trebuchet MS",
    default: "sans-serif",
  });

  return (
    <TextInput
      placeholderTextColor={palette.textMuted}
      style={[
        styles.input,
        {
          borderColor: palette.border,
          color: palette.textPrimary,
          backgroundColor: palette.surfaceMuted,
          shadowColor: palette.shadow,
          padding,
          fontFamily,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 22,
    borderWidth: 2,
    fontSize: 15,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
});
