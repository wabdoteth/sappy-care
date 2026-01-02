import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { PaletteId } from "@sappy/shared/theme";
import { useTheme } from "../theme/useTheme";
import { AppText } from "./ui";

type PalettePickerProps = {
  selectedId: PaletteId;
  onSelect: (id: PaletteId) => void;
};

export function PalettePicker({ selectedId, onSelect }: PalettePickerProps) {
  const { palettes } = useTheme();

  return (
    <View style={styles.paletteRow}>
      {palettes.map((palette) => {
        const isActive = palette.id === selectedId;
        return (
          <Pressable
            key={palette.id}
            onPress={() => onSelect(palette.id)}
            style={[
              styles.paletteOption,
              {
                backgroundColor: palette.surface,
                borderColor: isActive ? palette.primaryDark : palette.border,
              },
            ]}
          >
            <View style={styles.swatchRow}>
              {palette.backgroundGradient.map((color, index) => (
                <View
                  key={`${palette.id}-${index}`}
                  style={[styles.swatch, { backgroundColor: color }]}
                />
              ))}
            </View>
            <AppText tone={isActive ? "accent" : "secondary"} variant="caption">
              {palette.name}
            </AppText>
            {isActive ? (
              <View style={[styles.checkBadge, { backgroundColor: palette.primary }]}>
                <Ionicons name="checkmark" size={12} color="#ffffff" />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  paletteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  paletteOption: {
    width: 120,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
    marginBottom: 12,
  },
  swatchRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
});
