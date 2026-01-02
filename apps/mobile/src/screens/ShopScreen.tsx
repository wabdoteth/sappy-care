import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import type { Item } from "@sappy/shared/types";
import { Screen } from "../components/Screen";
import { AppText, Button, Card, Chip } from "../components/ui";
import { ScreenHeader } from "../components/ScreenHeader";
import { useRepos } from "../data/RepoProvider";
import { purchaseItem } from "../services/localActions";
import { useTheme } from "../theme/useTheme";
import { SealRoomScene } from "../components/companion/SealRoomScene";

export function ShopScreen() {
  const repos = useRepos();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { palette } = useTheme();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: companion } = useQuery({
    queryKey: ["companion"],
    queryFn: () => repos.companion.getCompanion(),
  });
  const { data: items } = useQuery({
    queryKey: ["items"],
    queryFn: () => repos.shop.listItems(),
  });
  const { data: inventory } = useQuery({
    queryKey: ["inventory"],
    queryFn: () => repos.shop.listInventory(),
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
    accessory: "shirt-outline",
    outfit: "shirt-outline",
    room: "home-outline",
    toy: "balloon-outline",
  };
  const categoryOrder = ["outfit", "accessory", "room", "toy", "sticker", "palette"];

  const categories = useMemo(() => {
    if (!items || items.length === 0) {
      return ["all"];
    }
    const unique = new Set(items.map((item) => item.category));
    const ordered = categoryOrder.filter((category) => unique.has(category));
    for (const category of unique) {
      if (!categoryOrder.includes(category)) {
        ordered.push(category);
      }
    }
    return ["all", ...ordered];
  }, [items]);

  const ownedItemIds = useMemo(() => {
    return new Set((inventory ?? []).map((item) => item.itemId));
  }, [inventory]);

  const equippedItems = useMemo(() => {
    if (!companion || !items) {
      return [];
    }
    const itemMap = new Map(items.map((item) => [item.id, item]));
    return companion.equippedItemIds
      .map((id) => itemMap.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [companion, items]);

  const previewItem = useMemo(() => {
    if (!previewItemId || !items) {
      return null;
    }
    return items.find((item) => item.id === previewItemId) ?? null;
  }, [items, previewItemId]);

  const previewItems = useMemo(() => {
    if (!previewItem) {
      return equippedItems;
    }
    if (equippedItems.some((item) => item.id === previewItem.id)) {
      return equippedItems;
    }
    return [...equippedItems, previewItem];
  }, [equippedItems, previewItem]);

  const groupedItems = useMemo(() => {
    if (!items || items.length === 0) {
      return [];
    }
    const filtered =
      activeCategory === "all"
        ? items
        : items.filter((item) => item.category === activeCategory);
    if (activeCategory !== "all") {
      return [[activeCategory, filtered]] as Array<[string, typeof filtered]>;
    }
    const groups = new Map<string, typeof filtered>();
    filtered.forEach((item) => {
      const existing = groups.get(item.category) ?? [];
      existing.push(item);
      groups.set(item.category, existing);
    });
    return Array.from(groups.entries());
  }, [activeCategory, items]);

  const handlePurchase = async (itemId: string) => {
    if (purchasingId) {
      return;
    }
    setPurchasingId(itemId);
    setErrorMessage(null);
    try {
      await purchaseItem(repos, itemId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companion"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory"] }),
        queryClient.invalidateQueries({ queryKey: ["ledger"] }),
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to purchase item.";
      setErrorMessage(message);
    } finally {
      setPurchasingId(null);
    }
  };

  const renderItem = (item: Item) => {
    const isOwned = ownedItemIds.has(item.id);
    return (
      <Card key={item.id} style={styles.sectionCard}>
        <View style={styles.itemHeaderRow}>
          <View
            style={[
              styles.itemBadge,
              { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
            ]}
          >
            <Ionicons
              name={categoryIcons[item.category] ?? "sparkles-outline"}
              size={18}
              color={palette.primaryDark}
            />
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
          <View style={styles.itemMetaLeft}>
            <Chip
              label={categoryLabels[item.category] ?? item.category}
              icon={categoryIcons[item.category] ?? "sparkles-outline"}
              style={styles.chip}
            />
            <Chip
              label="Preview"
              icon="eye-outline"
              style={styles.previewAction}
              active={previewItemId === item.id}
              onPress={() => setPreviewItemId(item.id)}
            />
          </View>
          <AppText tone="secondary">{item.pricePetals} petals</AppText>
        </View>
        <Button
          label={
            isOwned
              ? "Owned"
              : purchasingId === item.id
                ? "Purchasing..."
                : "Buy"
          }
          onPress={() => handlePurchase(item.id)}
          disabled={isOwned || purchasingId === item.id}
          style={styles.buyButton}
          iconLeft={isOwned ? "checkmark-circle-outline" : "cart-outline"}
        />
      </Card>
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          title="Shop"
          subtitle="Outfits, room decor, and stickers for your seal."
          icon="storefront-outline"
          action="auto"
        />

        <Card style={styles.sectionCard}>
          <View style={styles.petalsRow}>
            <View
              style={[
                styles.metaPill,
                { backgroundColor: palette.surfaceMuted, borderColor: palette.border },
              ]}
            >
              <Ionicons name="flower-outline" size={14} color={palette.primaryDark} />
              <AppText variant="caption" style={styles.metaLabel}>
                {companion?.petalsBalance ?? 0} petals
              </AppText>
            </View>
            <Button
              label="Bag"
              size="sm"
              variant="secondary"
              iconLeft="bag-handle-outline"
              onPress={() => navigation.navigate("Me" as never)}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Shop categories</AppText>
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

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="subtitle">Seal try-on</AppText>
            <Ionicons name="sparkles-outline" size={18} color={palette.primaryDark} />
          </View>
          <View style={styles.previewRow}>
            <View style={styles.previewSeal}>
              <SealRoomScene size={200} equippedItems={previewItems} />
            </View>
            <View style={styles.previewCopy}>
              <AppText tone="secondary" variant="caption">
                Tap an item to preview it on your seal.
              </AppText>
              {previewItem ? (
                <Chip
                  label={`Previewing: ${previewItem.name}`}
                  icon="eye-outline"
                  style={styles.previewChip}
                />
              ) : (
                <Chip label="No preview yet" icon="sparkles-outline" style={styles.previewChip} />
              )}
              {previewItem ? (
                <Button
                  label="Clear preview"
                  variant="ghost"
                  size="sm"
                  iconLeft="close-outline"
                  onPress={() => setPreviewItemId(null)}
                  style={styles.previewClear}
                />
              ) : null}
            </View>
          </View>
        </Card>

        {groupedItems.length === 0 ? (
          <Card style={styles.sectionCard}>
            <AppText tone="secondary">No items yet.</AppText>
          </Card>
        ) : (
          groupedItems.map(([category, groupItems]) => (
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
              {groupItems.map((item) => renderItem(item))}
            </View>
          ))
        )}

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
  petalsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    shadowColor: "#1c2a33",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2,
  },
  metaLabel: {
    marginLeft: 6,
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
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCopy: {
    flex: 1,
    marginLeft: 6,
  },
  previewChip: {
    marginTop: 10,
  },
  previewClear: {
    marginTop: 8,
    alignSelf: "flex-start",
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
    borderWidth: 2,
  },
  itemMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  itemMetaLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    marginRight: 10,
  },
  previewAction: {
    marginRight: 10,
  },
  buyButton: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
});
