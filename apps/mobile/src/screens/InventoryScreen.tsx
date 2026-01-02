import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { palettes, type PaletteId } from "@sappy/shared/theme";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { useTheme } from "../theme/useTheme";
import { SealCompanion } from "../components/companion/SealCompanion";

export function InventoryScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();
  const { paletteId, palette, setPaletteId } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const showShortcuts =
    (route.params as { showShortcuts?: boolean } | undefined)?.showShortcuts ??
    false;

  const { data: companion } = useQuery({
    queryKey: ["companion"],
    queryFn: () => repos.companion.getCompanion(),
  });
  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => repos.shop.listInventory(),
  });
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: () => repos.shop.listItems(),
  });

  const categoryLabels: Record<string, string> = {
    all: "All",
    outfit: "Outfits",
    accessory: "Accessories",
    room: "Room",
    toy: "Toys",
    sticker: "Stickers",
    palette: "Palettes",
  };
  const categoryIcons: Record<string, string> = {
    all: "apps-outline",
    palette: "color-palette-outline",
    sticker: "sparkles-outline",
    outfit: "shirt-outline",
    room: "home-outline",
    toy: "balloon-outline",
    accessory: "shirt-outline",
  };
  const categoryOrder = ["outfit", "accessory", "room", "toy", "sticker", "palette"];

  const itemsById = useMemo(() => {
    return new Map((items ?? []).map((item) => [item.id, item]));
  }, [items]);

  const equippedItems = useMemo(() => {
    if (!companion) {
      return [];
    }
    return companion.equippedItemIds
      .map((id) => itemsById.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [companion, itemsById]);

  const handleToggleEquip = async (itemId: string) => {
    if (!companion || isSaving) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const isEquipped = companion.equippedItemIds.includes(itemId);
      const nextIds = isEquipped
        ? companion.equippedItemIds.filter((id) => id !== itemId)
        : [...companion.equippedItemIds, itemId];
      const updated = await repos.companion.updateCompanion(companion.id, {
        equippedItemIds: nextIds,
      });
      queryClient.setQueryData(["companion"], updated);
    } catch (error) {
      console.warn("Failed to update equipped items", error);
      setErrorMessage("We couldn't update that item. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPalette = async (nextPaletteId: PaletteId) => {
    if (!companion || isSaving) {
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      setPaletteId(nextPaletteId);
      const updated = await repos.companion.updateCompanion(companion.id, {
        paletteId: nextPaletteId,
      });
      queryClient.setQueryData(["companion"], updated);
    } catch (error) {
      console.warn("Failed to apply palette", error);
      setErrorMessage("We couldn't apply that palette.");
    } finally {
      setIsSaving(false);
    }
  };

  const inventoryItems = useMemo(() => {
    return (inventory ?? [])
      .map((entry) => {
        const item = itemsById.get(entry.itemId);
        return item ? { entry, item } : null;
      })
      .filter(
        (value): value is NonNullable<typeof value> => value !== null
      );
  }, [inventory, itemsById]);

  const categories = useMemo(() => {
    if (inventoryItems.length === 0) {
      return ["all"];
    }
    const unique = new Set(inventoryItems.map(({ item }) => item.category));
    const ordered = categoryOrder.filter((category) => unique.has(category));
    for (const category of unique) {
      if (!categoryOrder.includes(category)) {
        ordered.push(category);
      }
    }
    return ["all", ...ordered];
  }, [inventoryItems]);

  const groupedInventory = useMemo(() => {
    if (inventoryItems.length === 0) {
      return [];
    }
    const filtered =
      activeCategory === "all"
        ? inventoryItems
        : inventoryItems.filter(({ item }) => item.category === activeCategory);
    if (activeCategory !== "all") {
      return [[activeCategory, filtered]] as Array<[string, typeof filtered]>;
    }
    const groups = new Map<string, typeof filtered>();
    filtered.forEach((entry) => {
      const existing = groups.get(entry.item.category) ?? [];
      existing.push(entry);
      groups.set(entry.item.category, existing);
    });
    return Array.from(groups.entries());
  }, [activeCategory, inventoryItems]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Bag"
          subtitle="Outfits, room decor, and palettes for your seal."
          icon="bag-handle-outline"
          action="auto"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Seal wardrobe</AppText>
            <Ionicons name="shirt-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.previewRow}>
            <View style={styles.previewSeal}>
              <SealCompanion size={160} equippedItems={equippedItems} />
            </View>
            <View style={styles.previewCopy}>
              {equippedItems.length === 0 ? (
                <AppText tone="secondary" variant="caption">
                  Equip outfits, toys, and room decor for your seal.
                </AppText>
              ) : (
                <View style={styles.previewChips}>
                  {equippedItems.slice(0, 3).map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      icon="sparkles-outline"
                      style={styles.previewChip}
                    />
                  ))}
                  {equippedItems.length > 3 ? (
                    <Chip
                      label={`+${equippedItems.length - 3} more`}
                      icon="sparkles-outline"
                      style={styles.previewChip}
                    />
                  ) : null}
                </View>
              )}
            </View>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Bag categories</AppText>
            <Ionicons name="options-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={categoryLabels[category] ?? category}
                icon={categoryIcons[category] ?? "sparkles-outline"}
                active={activeCategory === category}
                onPress={() => setActiveCategory(category)}
                style={styles.categoryChip}
              />
            ))}
          </View>
        </Card>

        {groupedInventory.length === 0 ? (
          <Card style={styles.sectionCard}>
            <AppText tone="secondary">No items yet. Visit the shop to collect goodies.</AppText>
          </Card>
        ) : (
          groupedInventory.map(([category, groupedItems]) => (
            <View key={category} style={styles.groupBlock}>
              {activeCategory === "all" ? (
                <View style={styles.groupHeader}>
                  <AppText variant="subtitle">
                    {categoryLabels[category] ?? category}
                  </AppText>
                  <Ionicons
                    name={categoryIcons[category] ?? "sparkles-outline"}
                    size={18}
                    color={palette.primaryDark}
                  />
                </View>
              ) : null}
              {groupedItems.map(({ entry, item }) => {
                const isEquipped =
                  companion?.equippedItemIds.includes(item.id) ?? false;
                const paletteMatch =
                  item.category === "palette" && item.sku.startsWith("palette_")
                    ? (item.sku.replace("palette_", "") as PaletteId)
                    : null;
                const canApplyPalette =
                  paletteMatch &&
                  Object.prototype.hasOwnProperty.call(palettes, paletteMatch);
                const icon = categoryIcons[item.category] ?? "sparkles-outline";

                return (
                  <Card key={entry.id} style={styles.sectionCard}>
                    <View style={styles.itemHeaderRow}>
                      <View
                        style={[
                          styles.itemBadge,
                          { backgroundColor: palette.surfaceMuted },
                        ]}
                      >
                        <Ionicons name={icon} size={18} color={palette.primaryDark} />
                      </View>
                      <View style={styles.itemHeaderCopy}>
                        <AppText variant="subtitle">{item.name}</AppText>
                        {item.description ? (
                          <AppText tone="secondary" style={styles.itemDescription}>
                            {item.description}
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.itemMetaRow}>
                      <Chip
                        label={categoryLabels[item.category] ?? item.category}
                        icon={icon}
                        style={styles.chip}
                      />
                      <AppText tone="secondary">
                        {isEquipped ? "Equipped" : "Not equipped"}
                      </AppText>
                    </View>
                    {canApplyPalette ? (
                      <Button
                        label={paletteId === paletteMatch ? "Applied" : "Apply palette"}
                        onPress={() => handleApplyPalette(paletteMatch)}
                        disabled={paletteId === paletteMatch || isSaving}
                        style={styles.actionButton}
                        iconLeft="color-palette-outline"
                      />
                    ) : (
                      <Button
                        label={isEquipped ? "Unequip" : "Equip"}
                        onPress={() => handleToggleEquip(item.id)}
                        disabled={isSaving}
                        style={styles.actionButton}
                        iconLeft={
                          isEquipped ? "close-circle-outline" : "checkmark-circle-outline"
                        }
                      />
                    )}
                  </Card>
                );
              })}
            </View>
          ))
        )}

        {showShortcuts ? (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeaderRow}>
              <AppText variant="subtitle">Seal settings</AppText>
              <Ionicons name="settings-outline" size={18} color={palette.primaryDark} />
            </View>
            <View style={styles.shortcutRow}>
              <Chip
                label="Insights"
                icon="stats-chart-outline"
                style={styles.shortcutChip}
                onPress={() => navigation.navigate("Insights" as never)}
              />
              <Chip
                label="History"
                icon="time-outline"
                style={styles.shortcutChip}
                onPress={() => navigation.navigate("History" as never)}
              />
              <Chip
                label="Settings"
                icon="settings-outline"
                style={styles.shortcutChip}
                onPress={() => navigation.navigate("Settings" as never)}
              />
            </View>
          </Card>
        ) : null}

        {errorMessage ? (
          <AppText tone="secondary" style={styles.errorText}>
            {errorMessage}
          </AppText>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionCard: {
    marginTop: 20,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  categoryChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  previewSeal: {
    width: 170,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCopy: {
    flex: 1,
    marginLeft: 6,
    justifyContent: "center",
  },
  previewChips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  previewChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  groupBlock: {
    marginTop: 4,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  shortcutRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  shortcutChip: {
    marginRight: 10,
    marginBottom: 10,
  },
  itemDescription: {
    marginTop: 8,
  },
  itemHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemHeaderCopy: {
    flex: 1,
  },
  itemBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  itemMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  chip: {
    marginRight: 10,
  },
  actionButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
});
