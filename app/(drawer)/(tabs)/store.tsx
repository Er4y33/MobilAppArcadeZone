import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useSound } from "../../../context/SoundContext";
import { useTheme } from "../../../context/ThemeContext";
import { hapticSuccess } from "../../../lib/haptics";
import { supabase } from "../../../lib/supabase";
import { useMagazaMetni } from "../../../lib/useCeviri";

type StoreItem = {
  id: string;
  name: string;
  description: string | null;
  category: "frame" | "badge";
  price: number;
  value: string;
  sort_order: number;
};

type Category = "frame" | "badge";

// Labels come from locales/*.json: magaza.cerceveler / magaza.unvanlar
const CATEGORIES: { key: Category; anahtar: string }[] = [
  { key: "frame", anahtar: "magaza.cerceveler" },
  { key: "badge", anahtar: "magaza.unvanlar" },
];

export default function StoreScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const { cal } = useSound();
  const { t } = useTranslation();
  const metin = useMagazaMetni();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [category, setCategory] = useState<Category>("frame");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: storeData, error: storeError } = await supabase
      .from("store_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (storeError) {
      console.error("Store could not be loaded:", storeError.message);
    } else {
      setItems((storeData as StoreItem[]) ?? []);
    }

    if (user) {
      const { data: ownedData } = await supabase
        .from("player_items")
        .select("item_id")
        .eq("player_id", user.id);
      setOwnedIds((ownedData ?? []).map((r: any) => r.item_id));
    }

    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePurchase = (item: StoreItem) => {
    Alert.alert(
      t("magaza.satinAlBaslik"),
      t("magaza.satinAlSoru", {
        ad: metin.ad(item.id, item.name),
        fiyat: item.price,
      }),
      [
        { text: t("ayarlar.vazgec"), style: "cancel" },
        {
          text: t("magaza.satinAlBaslik"),
          onPress: async () => {
            setBusyId(item.id);
            const { error } = await supabase.rpc("purchase_item", {
              p_item_id: item.id,
            });
            setBusyId(null);

            if (error) {
              Alert.alert(t("magaza.satinAlinamadi"), error.message);
              return;
            }
            hapticSuccess();
            cal("win");
            await refreshProfile();
            await fetchData();
            Alert.alert(
              t("magaza.tebrikler"),
              t("magaza.artikSenin", { ad: metin.ad(item.id, item.name) }),
            );
          },
        },
      ],
    );
  };

  const handleEquip = async (item: StoreItem) => {
    setBusyId(item.id);
    const isEquipped =
      (item.category === "frame" && profile?.equipped_frame === item.id) ||
      (item.category === "badge" && profile?.equipped_badge === item.id);

    const { error } = isEquipped
      ? await supabase.rpc("unequip_category", { p_category: item.category })
      : await supabase.rpc("equip_item", { p_item_id: item.id });

    setBusyId(null);
    if (error) {
      Alert.alert(t("magaza.islemBasarisiz"), error.message);
      return;
    }
    cal("click");
    await refreshProfile();
  };

  const visibleItems = items.filter((i) => i.category === category);
  const coins = profile?.coins ?? 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Balance */}
      <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>
          {t("magaza.bakiye")}
        </Text>
        <Text style={[styles.balanceValue, { color: colors.accent }]}>
          🪙 {coins}
        </Text>
      </View>

      {/* Category tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[
              styles.tab,
              category === c.key && { backgroundColor: colors.accent },
            ]}
            onPress={() => setCategory(c.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textMuted },
                category === c.key && {
                  color: colors.background,
                  fontWeight: "900",
                },
              ]}
            >
              {t(c.anahtar)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          {visibleItems.map((item) => {
            const owned = ownedIds.includes(item.id);
            const equipped =
              (item.category === "frame" &&
                profile?.equipped_frame === item.id) ||
              (item.category === "badge" &&
                profile?.equipped_badge === item.id);
            const affordable = coins >= item.price;
            const busy = busyId === item.id;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: equipped ? colors.success : colors.border,
                  },
                ]}
              >
                <View style={styles.itemRow}>
                  {/* Preview */}
                  {item.category === "frame" ? (
                    <View
                      style={[
                        styles.framePreview,
                        {
                          borderColor: item.value,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    >
                      <Text style={styles.framePreviewText}>
                        {profile?.username?.charAt(0).toUpperCase() ?? "?"}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.badgePreview,
                        { borderColor: colors.accent },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgePreviewText,
                          { color: colors.accent },
                        ]}
                      >
                        {metin.unvan(item.id, item.value)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {metin.ad(item.id, item.name)}
                    </Text>
                    <Text
                      style={[styles.itemDesc, { color: colors.textMuted }]}
                    >
                      {metin.aciklama(item.id, item.description)}
                    </Text>
                  </View>
                </View>

                {owned ? (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: equipped
                          ? colors.surfaceAlt
                          : colors.success,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleEquip(item)}
                    disabled={busy}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        { color: equipped ? colors.text : "#FFFFFF" },
                      ]}
                    >
                      {busy
                        ? "..."
                        : equipped
                          ? t("magaza.kusanildiKaldir")
                          : t("magaza.kusan")}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: affordable
                          ? colors.primary
                          : colors.surfaceAlt,
                        borderColor: colors.border,
                        opacity: affordable ? 1 : 0.6,
                      },
                    ]}
                    onPress={() => handlePurchase(item)}
                    disabled={!affordable || busy}
                  >
                    <Text
                      style={[
                        styles.actionText,
                        { color: affordable ? "#FFFFFF" : colors.textMuted },
                      ]}
                    >
                      {busy
                        ? "..."
                        : affordable
                          ? t("magaza.satinAlBtn", { fiyat: item.price })
                          : t("magaza.yetersiz", { fiyat: item.price })}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  balanceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  balanceValue: { fontSize: 22, fontWeight: "900" },

  tabBar: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  tabText: { fontSize: 12, fontWeight: "700", letterSpacing: 1 },

  list: { flex: 1 },
  itemCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  framePreview: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  framePreviewText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  badgePreview: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 14,
  },
  badgePreviewText: { fontSize: 12, fontWeight: "900" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "800" },
  itemDesc: { fontSize: 13, marginTop: 3 },

  actionBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
});
