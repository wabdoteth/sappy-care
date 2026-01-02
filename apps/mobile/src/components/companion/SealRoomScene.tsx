import React, { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { Item } from "@sappy/shared/types";
import { useTheme } from "../../theme/useTheme";
import { SealCompanion, type SealMood } from "./SealCompanion";

type SealRoomSceneProps = {
  size?: number;
  equippedItems?: Item[];
  variant?: "card" | "hero";
  mood?: SealMood;
  interactionKey?: number;
  style?: StyleProp<ViewStyle>;
};

type RoomItemSpec = {
  art: string;
};

function getRoomItems(items: Item[]) {
  return items
    .filter((item) => item.category === "room" || item.category === "toy")
    .map((item) => {
      const art =
        typeof item.metadata?.art === "string" ? item.metadata.art : null;
      return art ? { art } : null;
    })
    .filter((value): value is RoomItemSpec => Boolean(value));
}

export function SealRoomScene({
  size = 260,
  equippedItems = [],
  variant = "card",
  mood = "calm",
  interactionKey,
  style,
}: SealRoomSceneProps) {
  const { palette } = useTheme();
  const roomItems = useMemo(() => getRoomItems(equippedItems), [equippedItems]);
  const isHero = variant === "hero";
  const windowSize = size * 0.36;
  const windowLeft = size * 0.08;
  const windowTop = size * 0.07;
  const windowCrossSize = windowSize * 0.9;
  const windowCrossOffset = windowSize * 0.05;
  const doorWidth = size * 0.2;
  const doorHeight = size * 0.34;
  const doorRight = size * 0.08;
  const doorBottom = size * 0.24;
  const doorWindowSize = doorWidth * 0.42;
  const doorWindowRight = doorRight + (doorWidth - doorWindowSize) / 2;
  const doorWindowBottom = doorBottom + doorHeight * 0.2;
  const doorKnobRight = doorRight + doorWidth * 0.18;
  const doorKnobBottom = doorBottom + doorHeight * 0.5;
  const nestWidth = size * 0.42;
  const nestHeight = size * 0.2;
  const nestLeft = size * 0.06;
  const nestBottom = size * 0.22;
  const nestInnerLeft = nestLeft + nestWidth * 0.18;
  const nestInnerBottom = nestBottom + nestHeight * 0.2;
  const dresserWidth = size * 0.34;
  const dresserHeight = size * 0.11;
  const dresserLeft = windowLeft + size * 0.04;
  const dresserBottom = windowTop + windowSize + size * 0.06;
  const dresserHandleWidth = dresserWidth * 0.62;
  const dresserHandleHeight = size * 0.012;
  const dresserHandleLeft =
    dresserLeft + (dresserWidth - dresserHandleWidth) / 2;
  const dresserHandleBottom = dresserBottom + dresserHeight * 0.62;
  const dresserHandleLowerBottom = dresserBottom + dresserHeight * 0.25;
  const icebergWidth = size * 0.28;
  const icebergHeight = size * 0.18;
  const icebergLeft = size * 0.12;
  const icebergBottom = size * 0.26;
  const lampWidth = size * 0.16;
  const lampLeft = size * 0.4;
  const lampStemLeft = lampLeft + lampWidth * 0.5;
  const heartSize = size * 0.05;
  const heartRight = size * 0.34;
  const heartBottom = size * 0.26;
  const sealSize = isHero ? size * 0.56 : size * 0.78;
  const sealBottom = isHero ? size * 0.12 : 0;

  return (
    <View
      style={[
        styles.scene,
        {
          height: size,
          backgroundColor: isHero ? palette.roomWall : palette.surface,
          borderColor: palette.border,
          borderWidth: isHero ? 0 : 1,
          borderRadius: isHero ? 0 : 26,
          padding: isHero ? 0 : 16,
        },
        style,
      ]}
    >
      {isHero ? (
        <>
          <View style={[styles.heroFloor, { backgroundColor: palette.roomFloor }]} />
          <View
            style={[
              styles.heroFloorAccent,
              { backgroundColor: palette.roomFloorAccent },
            ]}
          />
          <View
            style={[
              styles.roundWindow,
              {
                width: windowSize,
                height: windowSize,
                borderRadius: windowSize / 2,
                borderColor: palette.surface,
                backgroundColor: palette.roomWindow,
                borderWidth: Math.max(6, size * 0.03),
                top: windowTop,
                left: windowLeft,
              },
            ]}
          />
          <View
            style={[
              styles.windowCross,
              {
                height: windowCrossSize,
                width: size * 0.03,
                backgroundColor: palette.surface,
                top: windowTop + windowCrossOffset,
                left: windowLeft + windowSize / 2 - size * 0.015,
              },
            ]}
          />
          <View
            style={[
              styles.windowCrossHorizontal,
              {
                width: windowCrossSize,
                height: size * 0.03,
                backgroundColor: palette.surface,
                top: windowTop + windowSize / 2 - size * 0.015,
                left: windowLeft + windowCrossOffset,
              },
            ]}
          />
          <View
            style={[
              styles.door,
              {
                width: doorWidth,
                height: doorHeight,
                borderRadius: doorWidth * 0.5,
                backgroundColor: palette.roomDoor,
                right: doorRight,
                bottom: doorBottom,
              },
            ]}
          />
          <View
            style={[
              styles.doorWindow,
              {
                width: doorWindowSize,
                height: doorWindowSize,
                borderRadius: doorWindowSize / 2,
                borderColor: palette.surface,
                backgroundColor: palette.roomWall,
                borderWidth: Math.max(3, size * 0.01),
                right: doorWindowRight,
                bottom: doorWindowBottom,
              },
            ]}
          />
          <View
            style={[
              styles.doorKnob,
              {
                backgroundColor: palette.roomWindow,
                right: doorKnobRight,
                bottom: doorKnobBottom,
              },
            ]}
          />
          <View
            style={[
              styles.nest,
              {
                width: nestWidth,
                height: nestHeight,
                borderRadius: nestHeight * 0.6,
                backgroundColor: palette.roomNest,
                borderColor: palette.roomNestInner,
                left: nestLeft,
                bottom: nestBottom,
              },
            ]}
          />
          <View
            style={[
              styles.nestInner,
              {
                width: nestWidth * 0.64,
                height: nestHeight * 0.6,
                borderRadius: nestHeight * 0.3,
                backgroundColor: palette.roomNestInner,
                left: nestInnerLeft,
                bottom: nestInnerBottom,
              },
            ]}
          />
          <View
            style={[
              styles.dresser,
              {
                backgroundColor: palette.roomDresser,
                width: dresserWidth,
                height: dresserHeight,
                left: dresserLeft,
                bottom: dresserBottom,
                borderRadius: dresserHeight * 0.3,
              },
            ]}
          />
          <View
            style={[
              styles.dresserHandle,
              {
                backgroundColor: palette.roomFloorAccent,
                width: dresserHandleWidth,
                height: dresserHandleHeight,
                left: dresserHandleLeft,
                bottom: dresserHandleBottom,
                borderRadius: dresserHandleHeight,
              },
            ]}
          />
          <View
            style={[
              styles.dresserHandle,
              styles.dresserHandleLower,
              {
                backgroundColor: palette.roomFloorAccent,
                width: dresserHandleWidth,
                height: dresserHandleHeight,
                left: dresserHandleLeft,
                bottom: dresserHandleLowerBottom,
                borderRadius: dresserHandleHeight,
              },
            ]}
          />
          <View
            style={[
              styles.iceberg,
              {
                width: icebergWidth,
                height: icebergHeight,
                left: icebergLeft,
                bottom: icebergBottom,
                backgroundColor: palette.highlight,
                borderColor: palette.surface,
              },
            ]}
          />
          <View
            style={[
              styles.lamp,
              {
                width: lampWidth,
                borderBottomColor: palette.roomLamp,
                left: lampLeft,
              },
            ]}
          />
          <View
            style={[
              styles.lampStem,
              { backgroundColor: palette.roomLampStem, left: lampStemLeft },
            ]}
          />
        </>
      ) : (
        <>
          <View
            style={[
              styles.sun,
              { backgroundColor: palette.accent, borderColor: palette.highlight },
            ]}
          />
          <View
            style={[
              styles.window,
              { backgroundColor: palette.highlight, borderColor: palette.border },
            ]}
          />
          <View style={[styles.wave, { backgroundColor: palette.surfaceMuted }]} />
          <View style={[styles.floor, { backgroundColor: palette.surfaceMuted }]} />
          <View style={[styles.sand, { backgroundColor: palette.highlight }]} />
          <View style={[styles.bubble, { backgroundColor: palette.highlight }]} />
          <View style={[styles.bubbleSmall, { backgroundColor: palette.surfaceMuted }]} />
        </>
      )}

      {!isHero
        ? roomItems.map((item, index) => (
            <View key={`${item.art}-${index}`} pointerEvents="none">
              {renderRoomItem(item, palette)}
            </View>
          ))
        : null}

      <View
        style={[
          styles.sealWrap,
          isHero
            ? {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: sealBottom,
              }
            : null,
        ]}
      >
        <SealCompanion
          size={sealSize}
          equippedItems={equippedItems}
          mood={mood}
          interactionKey={interactionKey}
        />
      </View>
      {isHero ? (
        <Ionicons
          name="heart"
          size={heartSize}
          color={palette.accent}
          style={[styles.heroHeart, { right: heartRight, bottom: heartBottom }]}
        />
      ) : null}
    </View>
  );
}

function renderRoomItem(
  item: RoomItemSpec,
  palette: {
    primary: string;
    primaryDark: string;
    accent: string;
    highlight: string;
    surface: string;
    surfaceMuted: string;
  }
) {
  switch (item.art) {
    case "sunmat":
      return (
        <View
          style={[
            styles.sunmat,
            { backgroundColor: palette.primary, borderColor: palette.primaryDark },
          ]}
        />
      );
    case "shelllamp":
      return (
        <View style={styles.shellLampWrap}>
          <View
            style={[
              styles.shellLampShade,
              { backgroundColor: palette.accent },
            ]}
          />
          <View
            style={[
              styles.shellLampBase,
              { backgroundColor: palette.primaryDark },
            ]}
          />
        </View>
      );
    case "pillow":
      return (
        <View
          style={[
            styles.pillow,
            { backgroundColor: palette.highlight, borderColor: palette.primary },
          ]}
        />
      );
    case "beachball":
      return (
        <View
          style={[
            styles.beachball,
            { backgroundColor: palette.accent, borderColor: palette.primaryDark },
          ]}
        />
      );
    default:
      return (
        <View
          style={[
            styles.sparkle,
            { backgroundColor: palette.highlight, borderColor: palette.primary },
          ]}
        />
      );
  }
}

const styles = StyleSheet.create({
  scene: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 16,
    overflow: "hidden",
    justifyContent: "center",
    width: "100%",
  },
  sun: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -40,
    right: -30,
    borderWidth: 6,
    opacity: 0.65,
  },
  window: {
    position: "absolute",
    width: 140,
    height: 90,
    borderRadius: 20,
    top: 24,
    left: 18,
    borderWidth: 1,
    opacity: 0.6,
  },
  wave: {
    position: "absolute",
    width: 160,
    height: 60,
    borderRadius: 40,
    bottom: 60,
    left: -30,
    opacity: 0.4,
  },
  floor: {
    position: "absolute",
    height: 90,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroFloor: {
    position: "absolute",
    height: 140,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  heroFloorAccent: {
    position: "absolute",
    height: 18,
    left: 0,
    right: 0,
    bottom: 120,
    opacity: 0.25,
  },
  roundWindow: {
    position: "absolute",
    opacity: 0.95,
  },
  windowCross: {
    position: "absolute",
    width: 8,
    opacity: 0.9,
    alignSelf: "flex-start",
  },
  windowCrossHorizontal: {
    position: "absolute",
    height: 8,
    opacity: 0.9,
    alignSelf: "flex-start",
  },
  door: {
    position: "absolute",
  },
  doorWindow: {
    position: "absolute",
  },
  doorKnob: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nest: {
    position: "absolute",
    borderWidth: 2,
  },
  nestInner: {
    position: "absolute",
  },
  dresser: {
    position: "absolute",
  },
  dresserHandle: {
    position: "absolute",
  },
  dresserHandleLower: {
  },
  iceberg: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.9,
  },
  lamp: {
    position: "absolute",
    top: 0,
    height: 0,
    borderBottomWidth: 22,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  lampStem: {
    position: "absolute",
    top: 0,
    width: 2,
    height: 24,
  },
  sand: {
    position: "absolute",
    width: 220,
    height: 70,
    borderRadius: 40,
    bottom: 18,
    alignSelf: "center",
    opacity: 0.6,
  },
  bubble: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    right: 24,
    top: 86,
    opacity: 0.35,
  },
  bubbleSmall: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    right: 46,
    top: 118,
    opacity: 0.4,
  },
  sealWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroHeart: {
    position: "absolute",
  },
  sunmat: {
    position: "absolute",
    width: 160,
    height: 34,
    borderRadius: 18,
    bottom: 24,
    alignSelf: "center",
    borderWidth: 2,
    opacity: 0.6,
  },
  shellLampWrap: {
    position: "absolute",
    right: 20,
    bottom: 28,
    alignItems: "center",
  },
  shellLampShade: {
    width: 36,
    height: 26,
    borderRadius: 14,
    marginBottom: 4,
  },
  shellLampBase: {
    width: 12,
    height: 18,
    borderRadius: 6,
  },
  pillow: {
    position: "absolute",
    width: 70,
    height: 30,
    borderRadius: 16,
    left: 24,
    bottom: 30,
    borderWidth: 2,
  },
  beachball: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    left: 28,
    bottom: 80,
    borderWidth: 3,
  },
  sparkle: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    right: 30,
    top: 28,
    borderWidth: 1,
  },
});
