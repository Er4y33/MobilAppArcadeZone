import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useSound } from "../../../context/SoundContext";
import { useTheme } from "../../../context/ThemeContext";

type Kisayol = {
  ikon: keyof typeof Ionicons.glyphMap;
  anahtar: string; // locales/*.json → sekmeler.*
  yol: string;
  renkAnahtari: "success" | "primaryAlt" | "accent";
};

const KISAYOLLAR: Kisayol[] = [
  {
    ikon: "checkbox",
    anahtar: "sekmeler.gorevler",
    yol: "/(drawer)/(tabs)/tasks",
    renkAnahtari: "success",
  },
  {
    ikon: "cart",
    anahtar: "sekmeler.magaza",
    yol: "/(drawer)/(tabs)/store",
    renkAnahtari: "primaryAlt",
  },
  {
    ikon: "trophy",
    anahtar: "sekmeler.skor",
    yol: "/(drawer)/(tabs)/leaderboard",
    renkAnahtari: "accent",
  },
];

const OYUN_SAYISI = 5;

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const { cal } = useSound();
  const { t } = useTranslation();

  const username =
    profile?.username || user?.email?.split("@")[0] || t("ortak.oyuncu");
  const level = profile?.level ?? 1;
  const coins = profile?.coins ?? 0;
  const xp = profile?.xp ?? 0;

  const git = (yol: string) => {
    cal("click");
    router.push(yol as never);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.icerik}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.logo, { color: colors.primary }]}>ARCADEZONE</Text>

        {/* Oyuncu kartı */}
        <Animated.View entering={FadeInDown.duration(320)}>
          <TouchableOpacity
            style={[styles.profilKart, { backgroundColor: colors.surface }]}
            onPress={() => git("/(drawer)/(tabs)/profile")}
            activeOpacity={0.85}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarHarf}>
                {username.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.profilMetin}>
              <Text
                style={[styles.isim, { color: colors.text }]}
                numberOfLines={1}
              >
                {username}
              </Text>
              <Text style={[styles.detay, { color: colors.textMuted }]}>
                {t("ortak.seviye")} {level} · {xp} {t("ortak.xp")}
              </Text>
            </View>

            <View
              style={[styles.coinKutu, { backgroundColor: colors.surfaceAlt }]}
            >
              <Text style={styles.coinSayi}>{coins}</Text>
              <Text style={[styles.coinEtiket, { color: colors.textMuted }]}>
                {t("ortak.coin")}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Büyük OYNA butonu */}
        <Animated.View entering={FadeInDown.delay(80).duration(320)}>
          <TouchableOpacity
            style={[styles.oynaBtn, { backgroundColor: colors.primary }]}
            onPress={() => git("/(drawer)/(tabs)/games")}
            activeOpacity={0.9}
          >
            <Ionicons name="game-controller" size={46} color="#FFFFFF" />
            <Text style={styles.oynaMetin}>{t("anaMenu.oyna")}</Text>
            <Text style={styles.oynaAlt}>
              {t("anaMenu.oynaAlt", { sayi: OYUN_SAYISI })}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Kısayollar */}
        <View style={styles.kisayolSatiri}>
          {KISAYOLLAR.map((k, i) => (
            <Animated.View
              key={k.yol}
              style={styles.kisayolSar}
              entering={FadeInDown.delay(140 + i * 60).duration(320)}
            >
              <TouchableOpacity
                style={[styles.kisayol, { backgroundColor: colors.surface }]}
                onPress={() => git(k.yol)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={k.ikon}
                  size={24}
                  color={colors[k.renkAnahtari]}
                />
                <Text style={[styles.kisayolMetin, { color: colors.text }]}>
                  {t(k.anahtar)}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  icerik: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
  },

  logo: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 24,
  },

  profilKart: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarHarf: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  profilMetin: { flex: 1, marginLeft: 14 },
  isim: { fontSize: 18, fontWeight: "800" },
  detay: { fontSize: 13, marginTop: 3 },
  coinKutu: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  coinSayi: { fontSize: 17, fontWeight: "900", color: "#FBBF24" },
  coinEtiket: { fontSize: 10, fontWeight: "700" },

  oynaBtn: {
    borderRadius: 22,
    paddingVertical: 34,
    alignItems: "center",
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  oynaMetin: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 4,
    marginTop: 10,
  },
  oynaAlt: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 16,
  },

  kisayolSatiri: { flexDirection: "row", gap: 12 },
  kisayolSar: { flex: 1 },
  kisayol: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    gap: 8,
  },
  kisayolMetin: { fontSize: 13, fontWeight: "700" },
});
