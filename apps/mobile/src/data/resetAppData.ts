import { Platform } from "react-native";

import { clearLocalData } from "./local/db";
import { clearWebData } from "./web/createWebRepos";

export async function resetAppData() {
  if (Platform.OS === "web") {
    clearWebData();
    return;
  }
  await clearLocalData();
}
