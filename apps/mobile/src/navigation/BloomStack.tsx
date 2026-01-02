import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { BloomHomeScreen } from "../screens/BloomHomeScreen";
import { StoryCardScreen } from "../screens/StoryCardScreen";
import { BloomAlbumScreen } from "../screens/BloomAlbumScreen";
import { ShopScreen } from "../screens/ShopScreen";
import { InventoryScreen } from "../screens/InventoryScreen";

export type BloomStackParamList = {
  BloomHome: undefined;
  StoryCard: { bloomRunId: string; storyInstanceId: string };
  BloomAlbum: undefined;
  Shop: undefined;
  Inventory: { showShortcuts?: boolean } | undefined;
};

const Stack = createNativeStackNavigator<BloomStackParamList>();

export function BloomStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Shop"
    >
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="BloomHome" component={BloomHomeScreen} />
      <Stack.Screen name="StoryCard" component={StoryCardScreen} />
      <Stack.Screen name="BloomAlbum" component={BloomAlbumScreen} />
      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
        initialParams={{ showShortcuts: false }}
      />
    </Stack.Navigator>
  );
}
