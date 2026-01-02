import React, { createContext, useContext, useMemo } from "react";
import { Platform } from "react-native";

import type { AppRepos } from "@sappy/shared/repos";
import { createLocalRepos } from "./local/createLocalRepos";
import { createSupabaseRepos } from "./supabase/createSupabaseRepos";
import { createWebRepos } from "./web/createWebRepos";

const RepoContext = createContext<AppRepos | null>(null);

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const useBackend = process.env.EXPO_PUBLIC_USE_BACKEND === "true";
  const isWeb = Platform.OS === "web" || typeof document !== "undefined";
  const repos = useMemo(
    () => {
      if (useBackend) {
        return createSupabaseRepos();
      }
      if (isWeb) {
        return createWebRepos();
      }
      return createLocalRepos();
    },
    [useBackend, isWeb]
  );

  return <RepoContext.Provider value={repos}>{children}</RepoContext.Provider>;
}

export function useRepos<T = AppRepos>(): T {
  const repos = useContext(RepoContext);
  if (!repos) {
    throw new Error("RepoProvider is missing from the component tree.");
  }
  return repos as T;
}
