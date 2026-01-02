import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import type { Mood } from "@sappy/shared/types";
import { Modal } from "./ui/Modal";
import { AppText, Button, Chip, Input, Slider } from "./ui";

type CheckinModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { mood: Mood; note: string }) => void;
  isSubmitting?: boolean;
};

const tags = ["Cozy", "Sleepy", "Bright", "Wavy", "Brave"];
const tagIcons: Record<string, string> = {
  Cozy: "heart-outline",
  Sleepy: "moon-outline",
  Bright: "sunny-outline",
  Wavy: "water-outline",
  Brave: "sparkles-outline",
};

export function CheckinModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CheckinModalProps) {
  const [mood, setMood] = useState<Mood>(3);
  const [note, setNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit({ mood, note: note.trim() });
    setNote("");
    setSelectedTags([]);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Check in">
      <AppText tone="secondary">How are you feeling right now?</AppText>
      <View style={styles.sliderRow}>
        <AppText variant="caption" tone="secondary">
          Low
        </AppText>
        <View style={styles.sliderFill}>
          <Slider
            min={1}
            max={5}
            step={1}
            value={mood}
            onValueChange={(value) => setMood(value as Mood)}
          />
        </View>
        <AppText variant="caption" tone="secondary">
          High
        </AppText>
      </View>

      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            active={selectedTags.includes(tag)}
            icon={tagIcons[tag] ?? "sparkles-outline"}
            onPress={() => toggleTag(tag)}
            style={styles.tag}
          />
        ))}
      </View>

      <Input
        placeholder="Optional note..."
        value={note}
        onChangeText={setNote}
        multiline
        style={styles.noteInput}
      />

      <Button
        label={isSubmitting ? "Saving..." : "Log check-in"}
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submitButton}
        iconLeft="heart-outline"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  sliderFill: {
    flex: 1,
    marginHorizontal: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  noteInput: {
    marginTop: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 16,
  },
});
