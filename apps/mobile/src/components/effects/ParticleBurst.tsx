import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "../../theme/useTheme";

type BurstProps = {
  triggerKey: number;
  style?: StyleProp<ViewStyle>;
};

const burstParticles = [
  { x: -18, y: -8, size: 6 },
  { x: -12, y: -20, size: 4 },
  { x: 0, y: -24, size: 5 },
  { x: 12, y: -20, size: 4 },
  { x: 18, y: -8, size: 6 },
  { x: 16, y: 10, size: 4 },
  { x: 0, y: 14, size: 5 },
  { x: -16, y: 10, size: 4 },
];

export function ParticleBurst({ triggerKey, style }: BurstProps) {
  const { palette } = useTheme();
  const useNativeDriver = Platform.OS !== "web";
  const particles = useRef(
    burstParticles.map(() => ({
      progress: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.4),
    }))
  ).current;
  const colors = [palette.accent, palette.primary, palette.primaryDark];

  useEffect(() => {
    particles.forEach((particle, index) => {
      particle.progress.setValue(0);
      particle.opacity.setValue(0);
      particle.scale.setValue(0.4);
      Animated.sequence([
        Animated.delay(index * 18),
        Animated.parallel([
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 80,
            useNativeDriver,
          }),
          Animated.timing(particle.progress, {
            toValue: 1,
            duration: 520,
            useNativeDriver,
          }),
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 320,
            useNativeDriver,
          }),
        ]),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver,
        }),
      ]).start();
    });
  }, [particles, triggerKey, useNativeDriver]);

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {burstParticles.map((particle, index) => {
        const anim = particles[index];
        const translateX = anim.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.x],
        });
        const translateY = anim.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, particle.y],
        });
        const size = particle.size;
        return (
          <Animated.View
            key={`burst-${index}-${triggerKey}`}
            style={[
              styles.particle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colors[index % colors.length],
                opacity: anim.opacity,
                transform: [{ translateX }, { translateY }, { scale: anim.scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 1,
    height: 1,
    left: "50%",
    top: "50%",
  },
  particle: {
    position: "absolute",
  },
});
