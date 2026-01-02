import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";

import type { Item } from "@sappy/shared/types";
import { useTheme } from "../../theme/useTheme";

export type SealMood = "calm" | "happy" | "sleepy";

type SealCompanionProps = {
  size?: number;
  mood?: SealMood;
  equippedItems?: Item[];
  interactionKey?: number;
};

type AccessorySpec = {
  art: string;
  slot?: string;
};

function getAccessorySpecs(items: Item[]) {
  return items
    .map((item) => {
      const art =
        typeof item.metadata?.art === "string" ? item.metadata.art : null;
      if (!art) {
        return null;
      }
      const slot =
        typeof item.metadata?.slot === "string" ? item.metadata.slot : undefined;
      return { art, slot };
    })
    .filter((value): value is AccessorySpec => Boolean(value));
}

export function SealCompanion({
  size = 180,
  mood = "calm",
  equippedItems = [],
  interactionKey,
}: SealCompanionProps) {
  const { palette } = useTheme();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver,
        }),
      ])
    );
    floatLoop.start();

    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 90,
          useNativeDriver,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver,
        }),
        Animated.delay(2200),
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 90,
          useNativeDriver,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver,
        }),
      ])
    );
    blinkLoop.start();

    return () => {
      floatLoop.stop();
      blinkLoop.stop();
    };
  }, [blinkAnim, floatAnim, useNativeDriver]);

  useEffect(() => {
    if (interactionKey === undefined) {
      return;
    }
    wiggleAnim.setValue(0);
    Animated.sequence([
      Animated.timing(wiggleAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver,
      }),
    ]).start();
  }, [interactionKey, useNativeDriver, wiggleAnim]);

  const bob = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const wiggleRotate = wiggleAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: ["0deg", "-5deg", "5deg", "0deg"],
  });
  const wiggleScale = wiggleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.04, 1],
  });
  const wiggleLift = wiggleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -4, 0],
  });

  const accessories = useMemo(
    () => getAccessorySpecs(equippedItems),
    [equippedItems]
  );

  const bodyWidth = size * 0.72;
  const bodyHeight = size * 0.46;
  const bodyBottom = size * 0.14;
  const headWidth = size * 0.6;
  const headHeight = size * 0.46;
  const headTop = size * 0.02;
  const headCenterX = size * 0.5;
  const snoutWidth = headWidth * 0.5;
  const snoutHeight = headHeight * 0.3;
  const snoutTop = headTop + headHeight * 0.6;
  const eyeSize = size * 0.055;
  const eyeTop = headTop + headHeight * 0.3;
  const eyeSpacing = headWidth * 0.22;
  const eyeLeft = headCenterX - eyeSpacing - eyeSize / 2;
  const eyeRight = headCenterX + eyeSpacing - eyeSize / 2;
  const noseWidth = snoutWidth * 0.22;
  const noseHeight = snoutHeight * 0.2;
  const noseTop = snoutTop + snoutHeight * 0.22;
  const noseLeft = headCenterX - noseWidth / 2;
  const mouthWidth = snoutWidth * 0.52;
  const mouthTop = snoutTop + snoutHeight * 0.6;
  const mouthLeft = headCenterX - mouthWidth / 2;
  const cheekSize = size * 0.065;
  const cheekTop = snoutTop + snoutHeight * 0.4;
  const cheekOffset = headWidth * 0.33;
  const flipperWidth = bodyWidth * 0.3;
  const flipperHeight = bodyHeight * 0.26;
  const flipperTop = bodyBottom + bodyHeight * 0.56;
  const flipperOffset = size * 0.02;
  const tailWidth = bodyWidth * 0.2;
  const tailHeight = bodyHeight * 0.14;
  const tailFlukeWidth = bodyWidth * 0.2;
  const tailFlukeHeight = bodyHeight * 0.18;
  const tailFlukeTop = bodyBottom + bodyHeight * 0.82;
  const tailFlukeOffset = bodyWidth * 0.2;
  const whiskerLength = snoutWidth * 0.66;
  const whiskerTop = snoutTop + snoutHeight * 0.58;
  const whiskerOffset = snoutHeight * 0.16;
  const earSize = size * 0.075;
  const earTop = headTop + headHeight * 0.12;
  const earOffset = headWidth * 0.33;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { translateY: bob },
            { translateY: wiggleLift },
            { rotate: wiggleRotate },
            { scale: wiggleScale },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.shadow,
          {
            width: bodyWidth * 0.9,
            height: bodyHeight * 0.25,
            backgroundColor: palette.shadow,
            opacity: 0.08,
          },
        ]}
      />

      <View
        style={[
          styles.body,
          {
            width: bodyWidth,
            height: bodyHeight,
            borderRadius: bodyHeight * 0.6,
            backgroundColor: palette.companionBase,
            bottom: bodyBottom,
          },
        ]}
      />
      <View
        style={[
          styles.belly,
          {
            width: bodyWidth * 0.58,
            height: bodyHeight * 0.5,
            borderRadius: bodyHeight * 0.4,
            backgroundColor: palette.highlight,
            bottom: bodyBottom + bodyHeight * 0.08,
          },
        ]}
      />
      <View
        style={[
          styles.tail,
          {
            width: tailWidth,
            height: tailHeight,
            borderRadius: tailHeight * 0.6,
            backgroundColor: palette.companionBase,
            top: bodyBottom + bodyHeight * 0.78,
          },
        ]}
      />
      <View
        style={[
          styles.tailFluke,
          {
            width: tailFlukeWidth,
            height: tailFlukeHeight,
            borderRadius: tailFlukeHeight * 0.6,
            backgroundColor: palette.companionBase,
            top: tailFlukeTop,
            left: headCenterX - tailFlukeOffset - tailFlukeWidth * 0.5,
            transform: [{ rotate: "-12deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.tailFluke,
          {
            width: tailFlukeWidth,
            height: tailFlukeHeight,
            borderRadius: tailFlukeHeight * 0.6,
            backgroundColor: palette.companionBase,
            top: tailFlukeTop,
            left: headCenterX + tailFlukeOffset - tailFlukeWidth * 0.5,
            transform: [{ rotate: "12deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.spot,
          {
            width: size * 0.08,
            height: size * 0.08,
            borderRadius: size * 0.04,
            backgroundColor: palette.highlight,
            top: bodyBottom + bodyHeight * 0.2,
            left: size * 0.28,
            opacity: 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.spot,
          {
            width: size * 0.06,
            height: size * 0.06,
            borderRadius: size * 0.03,
            backgroundColor: palette.highlight,
            top: bodyBottom + bodyHeight * 0.3,
            left: size * 0.38,
            opacity: 0.4,
          },
        ]}
      />
      <View
        style={[
          styles.ear,
          {
            width: earSize,
            height: earSize,
            borderRadius: earSize * 0.5,
            backgroundColor: palette.companionBase,
            top: earTop,
            left: headCenterX - earOffset - earSize * 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.ear,
          {
            width: earSize,
            height: earSize,
            borderRadius: earSize * 0.5,
            backgroundColor: palette.companionBase,
            top: earTop,
            left: headCenterX + earOffset - earSize * 0.5,
          },
        ]}
      />
      <View
        style={[
          styles.head,
          {
            width: headWidth,
            height: headHeight,
            borderRadius: headHeight * 0.64,
            backgroundColor: palette.companionBase,
            top: headTop,
          },
        ]}
      />
      <View
        style={[
          styles.snout,
          {
            width: snoutWidth,
            height: snoutHeight,
            borderRadius: snoutHeight * 0.6,
            backgroundColor: palette.highlight,
            top: snoutTop,
          },
        ]}
      />
      <View
        style={[
          styles.flipperLeft,
          {
            width: flipperWidth,
            height: flipperHeight,
            borderRadius: flipperHeight * 0.8,
            backgroundColor: palette.companionBase,
            left: flipperOffset,
            top: flipperTop,
          },
        ]}
      />
      <View
        style={[
          styles.flipperRight,
          {
            width: flipperWidth,
            height: flipperHeight,
            borderRadius: flipperHeight * 0.8,
            backgroundColor: palette.companionBase,
            right: flipperOffset,
            top: flipperTop,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.eye,
          {
            width: eyeSize,
            height: eyeSize,
            borderRadius: eyeSize * 0.5,
            backgroundColor: palette.shadow,
            transform: [{ scaleY: blinkAnim }],
            left: eyeLeft,
            top: eyeTop,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.eye,
          {
            width: eyeSize,
            height: eyeSize,
            borderRadius: eyeSize * 0.5,
            backgroundColor: palette.shadow,
            transform: [{ scaleY: blinkAnim }],
            left: eyeRight,
            top: eyeTop,
          },
        ]}
      />
      <View
        style={[
          styles.nose,
          {
            width: noseWidth,
            height: noseHeight,
            borderRadius: noseHeight * 0.6,
            backgroundColor: palette.shadow,
            top: noseTop,
            left: noseLeft,
          },
        ]}
      />
      {[-1, 0, 1].map((offset) => (
        <View
          key={`whisker-left-${offset}`}
          style={[
            styles.whisker,
            {
              width: whiskerLength,
              top: whiskerTop + offset * whiskerOffset,
              left: headCenterX - snoutWidth * 0.65 - whiskerLength,
              backgroundColor: palette.shadow,
              opacity: 0.5,
            },
          ]}
        />
      ))}
      {[-1, 0, 1].map((offset) => (
        <View
          key={`whisker-right-${offset}`}
          style={[
            styles.whisker,
            {
              width: whiskerLength,
              top: whiskerTop + offset * whiskerOffset,
              left: headCenterX + snoutWidth * 0.65,
              backgroundColor: palette.shadow,
              opacity: 0.5,
            },
          ]}
        />
      ))}
      <View
        style={[
          styles.cheek,
          {
            width: cheekSize,
            height: cheekSize,
            borderRadius: cheekSize * 0.5,
            backgroundColor: palette.accent,
            opacity: mood === "sleepy" ? 0.25 : 0.35,
            left: headCenterX - cheekOffset,
            top: cheekTop,
          },
        ]}
      />
      <View
        style={[
          styles.cheek,
          {
            width: cheekSize,
            height: cheekSize,
            borderRadius: cheekSize * 0.5,
            backgroundColor: palette.accent,
            opacity: mood === "sleepy" ? 0.25 : 0.35,
            left: headCenterX + cheekOffset - cheekSize,
            top: cheekTop,
          },
        ]}
      />
      <View
        style={[
          styles.mouth,
          {
            width: mouthWidth,
            height: noseHeight,
            borderBottomWidth: 2,
            borderColor: palette.shadow,
            borderRadius: noseHeight,
            opacity: mood === "happy" ? 1 : 0.6,
            top: mouthTop,
            left: mouthLeft,
          },
        ]}
      />

      {accessories.map((accessory, index) => (
        <View key={`${accessory.art}-${index}`} pointerEvents="none">
          {renderAccessory(accessory, size, palette)}
        </View>
      ))}
    </Animated.View>
  );
}

function renderAccessory(
  accessory: AccessorySpec,
  size: number,
  palette: { primary: string; primaryDark: string; accent: string; surface: string }
) {
  const baseSize = size * 0.2;
  switch (accessory.art) {
    case "sunhat":
      return (
        <View style={[styles.accessoryWrap, { top: size * 0.02 }]}>
          <View
            style={[
              styles.hatTop,
              {
                width: baseSize,
                height: baseSize * 0.6,
                borderRadius: baseSize * 0.3,
                backgroundColor: palette.primary,
              },
            ]}
          />
          <View
            style={[
              styles.hatBrim,
              {
                width: baseSize * 1.4,
                height: baseSize * 0.25,
                borderRadius: baseSize * 0.2,
                backgroundColor: palette.primaryDark,
              },
            ]}
          />
        </View>
      );
    case "floatie":
      return (
        <View
          style={[
            styles.floatie,
            {
              width: size * 0.52,
              height: size * 0.32,
              borderRadius: size * 0.26,
              borderColor: palette.accent,
              bottom: size * 0.22,
            },
          ]}
        />
      );
    case "scarf":
      return (
        <View
          style={[
            styles.scarf,
            {
              width: size * 0.36,
              height: size * 0.12,
              borderRadius: size * 0.06,
              backgroundColor: palette.primary,
              top: size * 0.5,
            },
          ]}
        />
      );
    case "shades":
      return (
        <View style={[styles.shadesRow, { top: size * 0.22 }]}>
          <View
            style={[
              styles.shadeLens,
              {
                width: baseSize * 0.36,
                height: baseSize * 0.28,
                borderRadius: baseSize * 0.14,
                backgroundColor: palette.primaryDark,
              },
            ]}
          />
          <View
            style={[
              styles.shadeBridge,
              {
                width: baseSize * 0.2,
                height: baseSize * 0.08,
                backgroundColor: palette.primaryDark,
              },
            ]}
          />
          <View
            style={[
              styles.shadeLens,
              {
                width: baseSize * 0.36,
                height: baseSize * 0.28,
                borderRadius: baseSize * 0.14,
                backgroundColor: palette.primaryDark,
              },
            ]}
          />
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    position: "absolute",
    bottom: 12,
    borderRadius: 999,
    alignSelf: "center",
  },
  body: {
    position: "absolute",
    alignSelf: "center",
  },
  belly: {
    position: "absolute",
    alignSelf: "center",
  },
  tail: {
    position: "absolute",
    alignSelf: "center",
    transform: [{ rotate: "12deg" }],
  },
  tailFluke: {
    position: "absolute",
  },
  spot: {
    position: "absolute",
  },
  head: {
    position: "absolute",
    alignSelf: "center",
  },
  ear: {
    position: "absolute",
  },
  snout: {
    position: "absolute",
    alignSelf: "center",
  },
  flipperLeft: {
    position: "absolute",
    transform: [{ rotate: "-20deg" }],
  },
  flipperRight: {
    position: "absolute",
    transform: [{ rotate: "20deg" }],
  },
  eye: {
    position: "absolute",
  },
  whisker: {
    position: "absolute",
    height: 2,
    borderRadius: 999,
  },
  nose: {
    position: "absolute",
  },
  cheek: {
    position: "absolute",
  },
  mouth: {
    position: "absolute",
  },
  accessoryWrap: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    alignItems: "center",
  },
  hatTop: {
    marginBottom: 2,
  },
  hatBrim: {},
  floatie: {
    position: "absolute",
    bottom: 36,
    borderWidth: 3,
  },
  scarf: {
    position: "absolute",
    alignSelf: "center",
  },
  shadesRow: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  shadeLens: {},
  shadeBridge: {
    marginHorizontal: 4,
  },
});
