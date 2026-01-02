import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../theme/useTheme";
import { AppText } from "./Text";

type ChipProps = {
  label: string;
  onPress?: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: string;
};

export function Chip({ label, onPress, active = false, style, icon }: ChipProps) {
  const { palette } = useTheme();
  const backgroundColor = active ? palette.primary : palette.surfaceMuted;
  const textColor = active ? "#ffffff" : palette.chipText;
  const borderColor = active ? palette.primaryDark : palette.border;
  const scale = useRef(new Animated.Value(1)).current;
  const useNativeDriver = Platform.OS !== "web";
  const shadowColor = active ? palette.primaryDark : palette.shadow;
  const shadowOpacity = active ? 0.2 : 0.1;
  const shadowStyle: ViewStyle =
    Platform.OS === "web"
      ? ({
          boxShadow: `0px 8px 14px rgba(0,0,0,${shadowOpacity})`,
        } as ViewStyle)
      : {
          shadowColor,
          shadowOpacity,
        };

  const handlePressIn = () => {
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

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[
        styles.chip,
        { backgroundColor, borderColor },
        shadowStyle,
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.highlight,
          { backgroundColor: palette.highlight, opacity: active ? 0.35 : 0.25 },
        ]}
      />
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        {icon ? (
          <Ionicons name={icon} size={15} color={textColor} style={styles.icon} />
        ) : null}
        <AppText style={{ color: textColor }} variant="caption">
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "flex-start",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
  },
  highlight: {
    position: "absolute",
    top: -6,
    left: 0,
    right: 0,
    height: 18,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
});
