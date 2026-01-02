import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Modal } from "./ui/Modal";
import { AppText, Button, Input } from "./ui";

type GoalModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { title: string; details?: string }) => void;
  onArchive?: () => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: { title: string; details?: string | null };
  submitLabel?: string;
};

export function GoalModal({
  visible,
  onClose,
  onSubmit,
  onArchive,
  isSubmitting = false,
  initialValues,
  submitLabel,
}: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const isEditing = Boolean(initialValues);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setTitle(initialValues?.title ?? "");
    setDetails(initialValues?.details ?? "");
  }, [initialValues?.details, initialValues?.title, visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }
    onSubmit({ title: title.trim(), details: details.trim() });
    setTitle("");
    setDetails("");
  };

  const handleArchive = async () => {
    await onArchive?.();
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={isEditing ? "Edit goal" : "New goal"}>
      <AppText tone="secondary">Keep it tiny and kind.</AppText>
      <View style={styles.field}>
        <Input
          placeholder="Goal title"
          value={title}
          onChangeText={setTitle}
        />
      </View>
      <View style={styles.field}>
        <Input
          placeholder="Optional detail"
          value={details}
          onChangeText={setDetails}
          multiline
          style={styles.detailsInput}
        />
      </View>
      <Button
        label={isSubmitting ? "Saving..." : submitLabel ?? (isEditing ? "Save changes" : "Add goal")}
        onPress={handleSubmit}
        disabled={!title.trim() || isSubmitting}
        iconLeft={isEditing ? "save-outline" : "add-circle-outline"}
      />
      {onArchive ? (
        <Button
          label="Archive goal"
          variant="secondary"
          onPress={handleArchive}
          style={styles.archiveButton}
          iconLeft="archive-outline"
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 12,
  },
  detailsInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  archiveButton: {
    marginTop: 12,
  },
});
