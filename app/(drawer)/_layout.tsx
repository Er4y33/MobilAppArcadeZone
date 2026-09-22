import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useSound } from "../../context/SoundContext";
import { useTheme } from "../../context/ThemeContext";

type MenuOgesi = {
  ikon: keyof typeof Ionicons.glyphMap;
  anahtar: string; // locales/*.json → sekmeler.*
  yol: string;
};

// Tab bar'da olmayan, ara sıra açılan ekranlar
const MENU: MenuOgesi[] = [
  {
    ikon: "person-circle-outline",
    anahtar: "sekmeler.profil",
    yol: "/profile",
  },
  { ikon: "settings-outline", anahtar: "sekmeler.ayarlar", yol: "/settings" },
  {
    ikon: "information-circle-outline",
    anahtar: "sekmeler.hakkinda",
    yol: "/about",
  },
];

function DrawerIcerik(props: DrawerContentComponentProps) {
  const { colors } = useTheme();
  const { user, profile } = useAuth();
  const { cal } = useSound();
  const { t } = useTranslation();

  const username =
    profile?.username || user?.email?.split("@")[0] || t("ortak.oyuncu");
  const level = profile?.level ?? 1;
  const coins = profile?.coins ?? 0;

  const git = (yol: string) => {
    cal("click");
    props.navigation.closeDrawer();
    router.push(yol as never);
  };

  return (
    <View style={[styles.kap, { backgroundColor: colors.background }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.kaydirma}
      >
        {/* Oyuncu kartı */}
        <TouchableOpacity
          style={[styles.profilKart, { backgroundColor: colors.surface }]}
          onPress={() => git("/profile")}
          activeOpacity={0.85}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={26} color="#FFFFFF" />
          </View>
          <Text style={[styles.isim, { color: colors.text }]} numberOfLines={1}>
            {username}
          </Text>
          <View style={styles.rozetSatiri}>
            <View
              style={[styles.rozet, { backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={[styles.rozetMetin, { color: colors.textMuted }]}>
                {t("ortak.seviye")} {level}
              </Text>
            </View>
            <View
              style={[styles.rozet, { backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={[styles.rozetMetin, { color: colors.textMuted }]}>
                {coins} {t("ortak.coin")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Menü */}
        <View style={styles.menu}>
          {MENU.map((oge) => (
            <TouchableOpacity
              key={oge.yol}
              style={styles.satir}
              onPress={() => git(oge.yol)}
              activeOpacity={0.7}
            >
              <Ionicons name={oge.ikon} size={22} color={colors.text} />
              <Text style={[styles.satirMetin, { color: colors.text }]}>
                {t(oge.anahtar)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Alt bilgi */}
      <View style={[styles.altBilgi, { borderTopColor: colors.border }]}>
        <Text style={[styles.surum, { color: colors.textMuted }]}>
          ArcadeZone v{Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { colors } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <DrawerIcerik {...props} />}
      screenOptions={{
        headerShown: false, // header'ı Tabs kendi yönetiyor
        drawerType: "front",
        drawerStyle: {
          backgroundColor: colors.background,
          width: 290,
        },
        swipeEdgeWidth: 60, // soldan kaydırarak açma alanı
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  kap: { flex: 1 },
  kaydirma: { paddingTop: 0 },

  profilKart: {
    margin: 12,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  isim: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  rozetSatiri: { flexDirection: "row", gap: 8 },
  rozet: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rozetMetin: { fontSize: 11, fontWeight: "700" },

  menu: { paddingHorizontal: 8, paddingTop: 4 },
  satir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  satirMetin: { flex: 1, fontSize: 15, fontWeight: "600" },

  altBilgi: {
    padding: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  surum: { fontSize: 12 },
});
