import React, { useCallback, useMemo, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import { useTheme } from "../../theme/useTheme";

type SliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

const THUMB_SIZE = 26;
const TRACK_HEIGHT = 8;

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 1,
  step = 1,
  disabled = false,
}: SliderProps) {
  const { palette } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const clampValue = useCallback(
    (nextValue: number) => Math.min(max, Math.max(min, nextValue)),
    [min, max]
  );

  const updateValueFromLocation = useCallback(
    (locationX: number) => {
      if (disabled || trackWidth <= 0) {
        return;
      }
      const ratio = Math.min(1, Math.max(0, locationX / trackWidth));
      const rawValue = min + ratio * (max - min);
      const steppedValue =
        step > 0
          ? Math.round((rawValue - min) / step) * step + min
          : rawValue;
      onValueChange(clampValue(steppedValue));
    },
    [clampValue, disabled, max, min, onValueChange, step, trackWidth]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          updateValueFromLocation(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          updateValueFromLocation(event.nativeEvent.locationX);
        },
      }),
    [disabled, updateValueFromLocation]
  );

  const range = Math.max(1, max - min);
  const ratio = trackWidth > 0 ? Math.min(1, Math.max(0, (value - min) / range)) : 0;
  const fillWidth = trackWidth * ratio;
  const thumbLeft = trackWidth > 0 ? Math.max(0, Math.min(trackWidth - THUMB_SIZE, fillWidth - THUMB_SIZE / 2)) : 0;

  return (
    <View
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      <View style={[styles.track, { backgroundColor: palette.surfaceMuted }]} />
      <View style={[styles.fill, { backgroundColor: palette.primary, width: fillWidth }]} />
      <View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            borderColor: palette.primaryDark,
            backgroundColor: palette.surface,
            shadowColor: palette.shadow,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 32,
    justifyContent: "center",
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  fill: {
    position: "absolute",
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
});
