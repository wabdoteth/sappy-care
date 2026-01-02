import React, { useMemo } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Checkin } from "@sappy/shared/types";
import { AppText, Button, Card, Chip } from "./ui";
import { useTheme } from "../theme/useTheme";

type ChargeMeterCardProps = {
  charge: number;
  petals: number;
  threshold: number;
  checkin: Checkin | null;
  onCheckin: () => void;
  pauseMode?: boolean;
  style?: StyleProp<ViewStyle>;
};

const moodMeta: Record<Checkin["mood"], { label: string; icon: string }> = {
  1: { label: "Stormy", icon: "rainy-outline" },
  2: { label: "Low tide", icon: "cloud-outline" },
  3: { label: "Steady", icon: "heart-outline" },
  4: { label: "Bright", icon: "sunny-outline" },
  5: { label: "Radiant", icon: "sparkles-outline" },
};

export function ChargeMeterCard({
  charge,
  petals,
  threshold,
  checkin,
  onCheckin,
  pauseMode = false,
  style,
}: ChargeMeterCardProps) {
  const { palette } = useTheme();
  const clampedCharge = useMemo(() => Math.min(100, Math.max(0, charge)), [charge]);
  const readyToBloom = clampedCharge >= threshold;
  const remaining = Math.max(0, threshold - clampedCharge);
  const statusLabel = readyToBloom ? "Cove ready" : `${remaining} to splash`;
  const statusIcon = readyToBloom ? "sparkles-outline" : "water-outline";
  const moodInfo = checkin ? moodMeta[checkin.mood] : null;
  const fillColor = readyToBloom ? palette.success : palette.primary;

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="subtitle">Charge meter</AppText>
          <AppText tone="secondary" variant="caption">
            {clampedCharge} / 100 charge
          </AppText>
        </View>
        <Chip label={statusLabel} icon={statusIcon} style={styles.statusChip} />
      </View>

      <View style={[styles.track, { backgroundColor: palette.chip }]}>
        <View style={[styles.fill, { width: `${clampedCharge}%`, backgroundColor: fillColor }]} />
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.metaPill,
            { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
          ]}
        >
          <Ionicons name="flower-outline" size={14} color={palette.primaryDark} />
          <AppText variant="caption" style={styles.metaLabel}>
            {petals} petals
          </AppText>
        </View>
        {pauseMode ? (
          <View
            style={[
              styles.metaPill,
              { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
            ]}
          >
            <Ionicons name="pause-circle-outline" size={14} color={palette.primaryDark} />
            <AppText variant="caption" style={styles.metaLabel}>
              Soft day
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.checkinRow}>
        <View style={styles.checkinLeft}>
          <View
            style={[styles.checkinIcon, { backgroundColor: palette.surfaceMuted }]}
          >
            <Ionicons
              name={moodInfo?.icon ?? "heart-outline"}
              size={18}
              color={palette.primaryDark}
            />
          </View>
          <View style={styles.checkinCopy}>
            <AppText variant="label">
              {checkin ? "Today's check-in" : "Check in with yourself"}
            </AppText>
            <AppText tone="secondary" variant="caption">
              {checkin
                ? `${moodInfo?.label ?? "Gentle"} mood`
                : "Log a quick mood to earn charge."}
            </AppText>
            {checkin?.note ? (
              <AppText tone="secondary" variant="caption" numberOfLines={1}>
                {checkin.note}
              </AppText>
            ) : null}
          </View>
        </View>
        <Button
          label={checkin ? "Update" : "Check in"}
          size="sm"
          variant={checkin ? "secondary" : "primary"}
          iconLeft="heart-outline"
          onPress={onCheckin}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  track: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: "#1c2a33",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  metaLabel: {
    marginLeft: 6,
  },
  checkinRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  checkinLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  checkinIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkinCopy: {
    flex: 1,
  },
});
