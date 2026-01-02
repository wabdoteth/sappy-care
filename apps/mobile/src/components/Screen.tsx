import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../theme/useTheme";

type ScreenVariant = "default" | "plain";

type ScreenProps = {
  children: React.ReactNode;
  variant?: ScreenVariant;
};

const dotPattern = [
  { x: 0, y: 0, size: 6 },
  { x: 16, y: 4, size: 4 },
  { x: 28, y: 0, size: 6 },
  { x: 8, y: 16, size: 5 },
  { x: 24, y: 18, size: 4 },
  { x: 4, y: 30, size: 6 },
  { x: 20, y: 32, size: 5 },
];

export function Screen({ children, variant = "default" }: ScreenProps) {
  const { palette } = useTheme();
  const pointerEventsProp = Platform.OS === "web" ? undefined : "none";
  const pointerEventsStyle: ViewStyle | undefined =
    Platform.OS === "web"
      ? ({ pointerEvents: "none" } as ViewStyle)
      : undefined;
  const useNativeDriver = Platform.OS !== "web";
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;
  const showBackdrop = true;
  const backdropOpacity = variant === "plain" ? 0.2 : 0.36;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 9000,
          useNativeDriver,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 9000,
          useNativeDriver,
        }),
      ])
    );
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver,
        }),
      ])
    );
    floatLoop.start();
    pulseLoop.start();
    Animated.timing(enterAnim, {
      toValue: 1,
      duration: 520,
      useNativeDriver,
    }).start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [enterAnim, floatAnim, pulseAnim, useNativeDriver]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });
  const floatX = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const contentStyle = {
    opacity: enterAnim,
    transform: [
      {
        translateY: enterAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.background }]}
    >
      {showBackdrop ? (
        <>
          <Animated.View
            pointerEvents={pointerEventsProp}
            style={[
              styles.blobOne,
              pointerEventsStyle,
              {
                backgroundColor: palette.companionAura,
                opacity: backdropOpacity,
                transform: [{ translateY: floatY }, { translateX: floatX }],
              },
            ]}
          />
          <Animated.View
            pointerEvents={pointerEventsProp}
            style={[
              styles.blobTwo,
              pointerEventsStyle,
              {
                backgroundColor: palette.highlight,
                opacity: backdropOpacity * 0.9,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          <Animated.View
            pointerEvents={pointerEventsProp}
            style={[
              styles.blobThree,
              pointerEventsStyle,
              {
                backgroundColor: palette.surfaceMuted,
                opacity: backdropOpacity * 0.8,
                transform: [{ translateY: floatY }],
              },
            ]}
          />
          <Animated.View
            pointerEvents={pointerEventsProp}
            style={[
              styles.waveOne,
              pointerEventsStyle,
              {
                backgroundColor: palette.highlight,
                opacity: backdropOpacity * 0.75,
                transform: [{ translateX: floatX }],
              },
            ]}
          />
          <Animated.View
            pointerEvents={pointerEventsProp}
            style={[
              styles.waveTwo,
              pointerEventsStyle,
              {
                backgroundColor: palette.companionAura,
                opacity: backdropOpacity * 0.8,
                transform: [{ translateX: floatX }, { translateY: floatY }],
              },
            ]}
          />
          <View
            pointerEvents={pointerEventsProp}
            style={[styles.dotsCluster, styles.dotsOne, pointerEventsStyle]}
          >
            {dotPattern.map((dot, index) => (
              <View
                key={`dots-one-${index}`}
                style={[
                  styles.dot,
                  {
                    left: dot.x,
                    top: dot.y,
                    width: dot.size,
                    height: dot.size,
                    borderRadius: dot.size / 2,
                    backgroundColor: palette.primary,
                    opacity: backdropOpacity * 0.9,
                  },
                ]}
              />
            ))}
          </View>
          <View
            pointerEvents={pointerEventsProp}
            style={[styles.dotsCluster, styles.dotsTwo, pointerEventsStyle]}
          >
            {dotPattern.map((dot, index) => (
              <View
                key={`dots-two-${index}`}
                style={[
                  styles.dot,
                  {
                    left: dot.x + 8,
                    top: dot.y + 6,
                    width: dot.size,
                    height: dot.size,
                    borderRadius: dot.size / 2,
                    backgroundColor: palette.accent,
                    opacity: backdropOpacity * 0.8,
                  },
                ]}
              />
            ))}
          </View>
        </>
      ) : null}
      <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  blobOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    top: -70,
    right: -50,
    opacity: 0.35,
  },
  blobTwo: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
    bottom: -110,
    left: -80,
    opacity: 0.4,
  },
  blobThree: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 180,
    top: 180,
    left: -60,
    opacity: 0.25,
  },
  waveOne: {
    position: "absolute",
    height: 56,
    width: 340,
    borderRadius: 999,
    bottom: 140,
    right: -120,
    opacity: 0.35,
  },
  waveTwo: {
    position: "absolute",
    height: 48,
    width: 300,
    borderRadius: 999,
    bottom: 80,
    left: -80,
    opacity: 0.3,
  },
  dotsCluster: {
    position: "absolute",
    width: 48,
    height: 48,
  },
  dotsOne: {
    top: 90,
    right: 32,
  },
  dotsTwo: {
    bottom: 110,
    left: 28,
  },
  dot: {
    position: "absolute",
  },
});
