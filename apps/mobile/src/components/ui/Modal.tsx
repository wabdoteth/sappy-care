import React from "react";
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useTheme } from "../../theme/useTheme";
import { AppText } from "./Text";

type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  title?: string;
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

export function Modal({ visible, onClose, title, children, style }: ModalProps) {
  const { palette } = useTheme();

  return (
    <RNModal animationType="fade" transparent visible={visible}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: hexToRgba(palette.shadow, 0.28) }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              shadowColor: palette.shadow,
            },
            style,
          ]}
          onPress={() => {}}
        >
          <View
            pointerEvents="none"
            style={[styles.shine, { backgroundColor: palette.highlight }]}
          />
          {title ? (
            <AppText variant="subtitle" style={styles.title}>
              {title}
            </AppText>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 5,
    overflow: "hidden",
  },
  title: {
    marginBottom: 12,
  },
  shine: {
    position: "absolute",
    top: -16,
    left: -24,
    right: -24,
    height: 50,
    opacity: 0.4,
  },
});
