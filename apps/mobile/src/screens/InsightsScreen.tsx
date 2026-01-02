import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Card } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";
import { addDays, formatLocalDate, getLocalDate, getRecentLocalDates } from "../utils/date";

export function InsightsScreen() {
  const repos = useRepos();
  const { palette } = useTheme();
  const fromDate = getLocalDate(addDays(new Date(), -13));

  const { data: checkins } = useQuery({
    queryKey: ["checkins", "recent"],
    queryFn: () => repos.checkins.listCheckins({ fromDate }),
  });

  const recentDates = useMemo(() => getRecentLocalDates(14), []);

  const moodsByDate = useMemo(() => {
    const map = new Map<string, number>();
    (checkins ?? []).forEach((checkin) => {
      if (!map.has(checkin.localDate)) {
        map.set(checkin.localDate, checkin.mood);
      }
    });
    return map;
  }, [checkins]);

  const moodSeries = recentDates.map((date) => moodsByDate.get(date) ?? null);
  const recentCheckins = (checkins ?? []).slice(0, 5);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Insights"
          subtitle="Gentle trends from your recent check-ins."
          icon="stats-chart-outline"
          action="back"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Mood trend</AppText>
            <Ionicons name="pulse-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.chartRow}>
            {moodSeries.map((mood, index) => (
              <View key={`${recentDates[index]}-${index}`} style={styles.chartColumn}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: mood ? mood * 12 + 4 : 6,
                      backgroundColor: mood ? palette.primary : palette.chip,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <AppText tone="secondary" style={styles.helperText}>
            Last 14 days
          </AppText>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Recent check-ins</AppText>
            <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
          </View>
          {recentCheckins.length === 0 ? (
            <AppText tone="secondary" style={styles.helperText}>
              No check-ins yet.
            </AppText>
          ) : (
            recentCheckins.map((checkin) => (
              <View key={checkin.id} style={styles.checkinRow}>
                <View>
                  <AppText>{formatLocalDate(checkin.localDate)}</AppText>
                  <AppText tone="secondary" variant="caption">
                    Mood {checkin.mood} / 5
                  </AppText>
                </View>
                {checkin.note ? (
                  <AppText tone="secondary" style={styles.checkinNote}>
                    {checkin.note}
                  </AppText>
                ) : null}
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  sectionCard: {
    marginTop: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 16,
  },
  chartColumn: {
    flex: 1,
    marginHorizontal: 2,
    alignItems: "center",
  },
  chartBar: {
    width: 8,
    borderRadius: 6,
  },
  helperText: {
    marginTop: 12,
  },
  checkinRow: {
    marginTop: 12,
  },
  checkinNote: {
    marginTop: 4,
  },
});
