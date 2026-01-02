import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { FriendsScreen } from "../screens/FriendsScreen";
import { AddFriendScreen } from "../screens/AddFriendScreen";
import { SupportInboxScreen } from "../screens/SupportInboxScreen";
import { SendSupportScreen } from "../screens/SendSupportScreen";

export type FriendsStackParamList = {
  FriendsHome: undefined;
  AddFriend: undefined;
  SupportInbox: undefined;
  SendSupport: { friendId?: string } | undefined;
};

const Stack = createNativeStackNavigator<FriendsStackParamList>();

export function FriendsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FriendsHome" component={FriendsScreen} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
      <Stack.Screen name="SupportInbox" component={SupportInboxScreen} />
      <Stack.Screen name="SendSupport" component={SendSupportScreen} />
    </Stack.Navigator>
  );
}
