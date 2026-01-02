import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { InventoryScreen } from "../screens/InventoryScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

export type MeStackParamList = {
  MeHome: { showShortcuts?: boolean } | undefined;
  Insights: undefined;
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MeStackParamList>();

export function MeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MeHome"
        component={InventoryScreen}
        initialParams={{ showShortcuts: true }}
      />
      <Stack.Screen name="Insights" component={InsightsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
