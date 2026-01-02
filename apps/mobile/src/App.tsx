import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Screen } from "./components/Screen";
import { AppText } from "./components/ui";
import { SealDrawer, SealDrawerProvider } from "./components/drawer/SealDrawer";
import { RepoProvider, useRepos } from "./data/RepoProvider";
import { RootTabs } from "./navigation/RootTabs";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { useThemeStore } from "./stores/useThemeStore";
import { ensureDailyQuests } from "./services/localActions";
import { getLocalDate } from "./utils/date";

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RepoProvider>
            <AppShell />
          </RepoProvider>
          <StatusBar style="dark" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  const repos = useRepos();
  const queryClient = useQueryClient();
  const setPaletteId = useThemeStore((state) => state.setPaletteId);
  const companionQuery = useQuery({
    queryKey: ["companion"],
    queryFn: () => repos.companion.getCompanion(),
  });

  useEffect(() => {
    if (companionQuery.data?.paletteId) {
      setPaletteId(companionQuery.data.paletteId);
    }
  }, [companionQuery.data?.paletteId, setPaletteId]);

  useEffect(() => {
    if (companionQuery.data) {
      ensureDailyQuests(repos, getLocalDate()).catch((error) => {
        console.warn("Failed to ensure daily quests", error);
      });
    }
  }, [companionQuery.data, repos]);

  if (companionQuery.isLoading) {
    return (
      <Screen>
        <AppText variant="subtitle">Getting things ready...</AppText>
      </Screen>
    );
  }

  if (companionQuery.isError) {
    return (
      <Screen>
        <AppText variant="subtitle">We hit a snag loading your space.</AppText>
        <AppText tone="secondary" style={{ marginTop: 8 }}>
          Close and reopen the app to retry.
        </AppText>
      </Screen>
    );
  }

  if (!companionQuery.data) {
    return (
      <OnboardingScreen
        onComplete={() =>
          queryClient.invalidateQueries({ queryKey: ["companion"] })
        }
      />
    );
  }

  return (
    <NavigationContainer>
      <SealDrawerProvider>
        <RootTabs />
        <SealDrawer />
      </SealDrawerProvider>
    </NavigationContainer>
  );
}
