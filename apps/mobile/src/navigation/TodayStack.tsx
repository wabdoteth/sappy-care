import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { TodayScreen } from "../screens/TodayScreen";

export type TodayStackParamList = {
  TodayHome: undefined;
};

const Stack = createNativeStackNavigator<TodayStackParamList>();

export function TodayStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TodayHome" component={TodayScreen} />
    </Stack.Navigator>
  );
}
