import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { QuestsScreen } from "../screens/QuestsScreen";
import { ActivityBreatheScreen } from "../screens/ActivityBreatheScreen";
import { ActivityFocusScreen } from "../screens/ActivityFocusScreen";
import { ActivitySoundScreen } from "../screens/ActivitySoundScreen";
import { ActivityReflectScreen } from "../screens/ActivityReflectScreen";
import { ActivityFirstAidScreen } from "../screens/ActivityFirstAidScreen";

export type CareStackParamList = {
  CareHome: undefined;
  ActivityBreathe: undefined;
  ActivityFocus: undefined;
  ActivitySound: undefined;
  ActivityReflect: undefined;
  ActivityFirstAid: undefined;
};

const Stack = createNativeStackNavigator<CareStackParamList>();

export function CareStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CareHome" component={QuestsScreen} />
      <Stack.Screen name="ActivityBreathe" component={ActivityBreatheScreen} />
      <Stack.Screen name="ActivityFocus" component={ActivityFocusScreen} />
      <Stack.Screen name="ActivitySound" component={ActivitySoundScreen} />
      <Stack.Screen name="ActivityReflect" component={ActivityReflectScreen} />
      <Stack.Screen name="ActivityFirstAid" component={ActivityFirstAidScreen} />
    </Stack.Navigator>
  );
}
