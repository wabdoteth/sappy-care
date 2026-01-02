import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Platform, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { AppText, Chip, IconBadge, IconButton } from "../ui";
import { SealCompanion } from "../companion/SealCompanion";
import { useTheme } from "../../theme/useTheme";
import { useRepos } from "../../data/RepoProvider";
import { getLocalDate } from "../../utils/date";

type SealDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const SealDrawerContext = createContext<SealDrawerContextValue | null>(null);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SealDrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((value) => !value);

  return (
    <SealDrawerContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </SealDrawerContext.Provider>
  );
}

export function useSealDrawer() {
  const ctx = useContext(SealDrawerContext);
  if (!ctx) {
    throw new Error("useSealDrawer must be used within SealDrawerProvider");
  }
  return ctx;
}

export function SealDrawer() {
  const { isOpen, close } = useSealDrawer();
  const { palette } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const repos = useRepos();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";
  const drawerWidth = Math.min(Dimensions.get("window").width * 0.82, 360);

  const localDate = getLocalDate();
  const { data: companion } = useQuery({
    queryKey: ["companion"],
    queryFn: () => repos.companion.getCompanion(),
  });
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: () => repos.shop.listItems(),
  });
  const { data: quests } = useQuery({
    queryKey: ["quests", localDate],
    queryFn: () => repos.quests.listQuests({ localDate }),
  });

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver,
    }).start();
  }, [isOpen, slideAnim, useNativeDriver]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });
  const scale = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

  const overlayOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.42],
  });

  const daysTogether = useMemo(() => {
    if (!companion?.createdAt) {
      return 0;
    }
    const createdAt = new Date(companion.createdAt).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays + 1);
  }, [companion?.createdAt]);

  const equippedItems = useMemo(() => {
    if (!companion || !items) {
      return [];
    }
    const itemMap = new Map(items.map((item) => [item.id, item]));
    return companion.equippedItemIds
      .map((id) => itemMap.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [companion, items]);

  const questCount = quests?.length ?? 0;
  const completedCount =
    quests?.filter((quest) => quest.progress >= quest.target).length ?? 0;
  const progressPercent = questCount
    ? Math.round((completedCount / questCount) * 100)
    : 0;

  const handleNavigate = (route: string, params?: Record<string, unknown>) => {
    close();
    navigation.navigate(route, params);
  };

  return (
    <View
      pointerEvents={isOpen ? "auto" : "none"}
      style={[styles.overlay, StyleSheet.absoluteFillObject]}
    >
      <AnimatedPressable
        style={[styles.backdrop, { opacity: overlayOpacity }]}
        onPress={close}
      />
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: palette.surface,
            borderColor: palette.border,
            paddingTop: insets.top + 16,
            transform: [{ translateX }, { scale }],
          },
        ]}
      >
        <View
          style={[
            styles.drawerHandle,
            { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
          ]}
        />
        <View style={styles.header}>
          <SealCompanion size={90} equippedItems={equippedItems} />
          <View style={styles.headerCopy}>
            <AppText variant="subtitle">Seal cove</AppText>
            <AppText tone="secondary" variant="caption">
              Cozy shortcuts for your day.
            </AppText>
          </View>
          <IconButton name="close-outline" variant="ghost" onPress={close} />
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statPill,
              { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
            ]}
          >
            <IconBadge name="heart-outline" size={28} style={styles.statIcon} />
            <View>
              <AppText variant="caption">{daysTogether} days</AppText>
              <AppText tone="secondary" variant="caption">
                Together
              </AppText>
            </View>
          </View>
          <View
            style={[
              styles.statPill,
              styles.statPillLast,
              { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
            ]}
          >
            <IconBadge name="flower-outline" size={28} style={styles.statIcon} />
            <View>
              <AppText variant="caption">{companion?.petalsBalance ?? 0}</AppText>
              <AppText tone="secondary" variant="caption">
                Petals
              </AppText>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.adventureCard,
            { backgroundColor: palette.highlight, borderColor: palette.border },
          ]}
        >
          <View style={styles.adventureRow}>
            <AppText variant="subtitle">Daily adventure</AppText>
            <AppText tone="secondary" variant="caption">
              {completedCount}/{questCount || 3}
            </AppText>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: palette.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: palette.primary, width: `${progressPercent}%` },
              ]}
            />
          </View>
        </View>

        <AppText variant="subtitle" style={styles.sectionTitle}>
          Hop to
        </AppText>
        <View style={styles.linkGroup}>
          <DrawerItem
            label="Today"
            icon="home-outline"
            onPress={() => handleNavigate("Today")}
          />
          <DrawerItem
            label="Quests"
            icon="checkbox-outline"
            onPress={() => handleNavigate("Care")}
          />
          <DrawerItem
            label="Seal Cove"
            icon="flower-outline"
            onPress={() => handleNavigate("Bloom", { screen: "BloomHome" })}
          />
          <DrawerItem
            label="Shop"
            icon="storefront-outline"
            onPress={() => handleNavigate("Bloom", { screen: "Shop" })}
          />
          <DrawerItem
            label="Bag"
            icon="bag-handle-outline"
            onPress={() => handleNavigate("Me")}
          />
          <DrawerItem
            label="Friends"
            icon="people-outline"
            onPress={() => handleNavigate("Friends")}
          />
          <DrawerItem
            label="Story Album"
            icon="book-outline"
            onPress={() => handleNavigate("Bloom", { screen: "BloomAlbum" })}
          />
          <DrawerItem
            label="Settings"
            icon="settings-outline"
            onPress={() => handleNavigate("Me", { screen: "Settings" })}
          />
        </View>

        <AppText variant="subtitle" style={styles.sectionTitle}>
          Quick splashes
        </AppText>
        <View style={styles.quickRow}>
          <Chip
            label="Check-in"
            icon="heart-outline"
            style={styles.quickChip}
            onPress={() => handleNavigate("Today")}
          />
          <Chip
            label="Breathe"
            icon="cloud-outline"
            style={styles.quickChip}
            onPress={() => handleNavigate("Care", { screen: "ActivityBreathe" })}
          />
          <Chip
            label="Pet seal"
            icon="hand-left-outline"
            style={styles.quickChip}
            onPress={() => handleNavigate("Bloom", { screen: "BloomHome" })}
          />
        </View>
      </Animated.View>
    </View>
  );
}

type DrawerItemProps = {
  label: string;
  icon: string;
  onPress: () => void;
};

function DrawerItem({ label, icon, onPress }: DrawerItemProps) {
  const { palette } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.drawerItem,
        { borderColor: palette.border, backgroundColor: palette.surfaceMuted },
      ]}
    >
      <IconBadge name={icon} size={32} style={styles.drawerIcon} />
      <AppText>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0b1b2a",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 10,
    bottom: 10,
    borderRightWidth: 2,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 18,
    paddingBottom: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  drawerHandle: {
    alignSelf: "center",
    width: 64,
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 16,
    flex: 1,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#00000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  statPillLast: {
    marginRight: 0,
  },
  statIcon: {
    marginRight: 8,
  },
  adventureCard: {
    padding: 14,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#00000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  adventureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  linkGroup: {
    marginBottom: 6,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  drawerIcon: {
    marginRight: 10,
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  quickChip: {
    marginRight: 8,
    marginBottom: 8,
  },
});
