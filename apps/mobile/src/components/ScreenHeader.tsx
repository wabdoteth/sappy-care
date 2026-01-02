import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { AppText, IconBadge, IconButton } from "./ui";
import { useSealDrawer } from "./drawer/SealDrawer";
import { useTheme } from "../theme/useTheme";

type ScreenHeaderAction = "menu" | "back" | "none" | "auto";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  icon: string;
  action?: ScreenHeaderAction;
  fallbackRoute?: string;
  fallbackParams?: Record<string, unknown>;
};

export function ScreenHeader({
  title,
  subtitle,
  icon,
  action = "menu",
  fallbackRoute,
  fallbackParams,
}: ScreenHeaderProps) {
  const { open } = useSealDrawer();
  const navigation = useNavigation();
  const { palette } = useTheme();
  const canGoBack = navigation.canGoBack();
  const resolvedAction =
    action === "auto"
      ? canGoBack || fallbackRoute
        ? "back"
        : "menu"
      : action;

  const handleAction = () => {
    if (resolvedAction === "menu") {
      open();
      return;
    }
    if (resolvedAction === "back") {
      if (canGoBack) {
        navigation.goBack();
        return;
      }
      if (fallbackRoute) {
        navigation.navigate(
          fallbackRoute as never,
          fallbackParams as never
        );
      }
    }
  };

  return (
    <View
      style={[
        styles.headerWrap,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: palette.shadow,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.headerShine, { backgroundColor: palette.highlight }]}
      />
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {resolvedAction === "back" ? (
            <IconButton
              name="arrow-back-outline"
              onPress={handleAction}
              variant="ghost"
              disabled={!canGoBack && !fallbackRoute}
              style={styles.backButton}
            />
          ) : null}
          <IconBadge name={icon} tone="accent" size={48} />
          <View style={styles.headerCopy}>
            <AppText variant="display">{title}</AppText>
            {subtitle ? <AppText tone="secondary">{subtitle}</AppText> : null}
          </View>
        </View>
        {resolvedAction === "menu" ? (
          <IconButton name="menu-outline" onPress={handleAction} variant="ghost" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 4,
    overflow: "hidden",
  },
  headerShine: {
    position: "absolute",
    top: -12,
    left: -18,
    right: -18,
    height: 40,
    opacity: 0.45,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerCopy: {
    marginLeft: 12,
    flex: 1,
  },
  backButton: {
    marginRight: 8,
  },
});
