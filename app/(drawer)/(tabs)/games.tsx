import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSound } from "../../../context/SoundContext";
import { useTheme } from "../../../context/ThemeContext";

// Başlık ve açıklama artık burada değil, locales/*.json içinde:
// oyunlar.<id>.ad  ve  oyunlar.<id>.aciklama
type Oyun = {
  id: string;
  emoji: string;
  renkAnahtari:
    | "gameReaction"
    | "gameMemory"
    | "gameWord"
    | "gameMath"
    | "gamePattern";
  // Görsel hazır olunca: gorsel: require("../../../assets/games/memory.png")
  gorsel?: ImageSourcePropType;
};

const OYUNLAR: Oyun[] = [
  { id: "reaction", emoji: "⚡", renkAnahtari: "gameReaction" },
  { id: "memory", emoji: "🧠", renkAnahtari: "gameMemory" },
  { id: "sonsaniye", emoji: "⏱", renkAnahtari: "gameWord" },
  { id: "mathrush", emoji: "🔢", renkAnahtari: "gameMath" },
  { id: "pattern", emoji: "🎯", renkAnahtari: "gamePattern" },
];

const KENAR = 20; // ScrollView yatay padding
const ARA = 14; // kartlar arası boşluk
const { width: EKRAN_G } = Dimensions.get("window");
const KART_G = Math.floor((EKRAN_G - KENAR * 2 - ARA) / 2);

export default function GamesScreen() {
  const { colors } = useTheme();
  const { cal } = useSound();
  const { t } = useTranslation();

  const ac = (oyun: Oyun) => {
    cal("click");
    router.push({
      pathname: "/game/[id]",
      params: { id: oyun.id, title: t(`oyunlar.${oyun.id}.ad`) },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.icerik}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {t("oyunlar.baslik")}
        </Text>
        <Text style={[styles.altBaslik, { color: colors.textMuted }]}>
          {t("oyunlar.altBaslik", { sayi: OYUNLAR.length })}
        </Text>

        <View style={styles.izgara}>
          {OYUNLAR.map((oyun, i) => {
            const vurgu = colors[oyun.renkAnahtari];

            return (
              <Animated.View
                key={oyun.id}
                entering={FadeInDown.delay(i * 60).duration(320)}
              >
                <TouchableOpacity
                  style={[
                    styles.kart,
                    { width: KART_G, backgroundColor: colors.surface },
                  ]}
                  onPress={() => ac(oyun)}
                  activeOpacity={0.85}
                >
                  {/* Görsel kutu — görsel yoksa renkli zemin + emoji */}
                  <View style={[styles.gorselKutu, { backgroundColor: vurgu }]}>
                    {oyun.gorsel ? (
                      <Image
                        source={oyun.gorsel}
                        style={styles.gorsel}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.emoji}>{oyun.emoji}</Text>
                    )}
                  </View>

                  <View style={styles.metinAlani}>
                    <Text
                      style={[styles.kartBaslik, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {t(`oyunlar.${oyun.id}.ad`)}
                    </Text>
                    <Text
                      style={[styles.kartAciklama, { color: colors.textMuted }]}
                      numberOfLines={2}
                    >
                      {t(`oyunlar.${oyun.id}.aciklama`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  icerik: {
    paddingHorizontal: KENAR,
    paddingTop: 8,
    paddingBottom: 100,
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  altBaslik: { fontSize: 14, marginBottom: 20 },

  izgara: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: ARA,
  },

  kart: {
    borderRadius: 18,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  gorselKutu: {
    width: "100%",
    height: KART_G * 0.62,
    justifyContent: "center",
    alignItems: "center",
  },
  gorsel: { width: "100%", height: "100%" },
  emoji: { fontSize: KART_G * 0.3 },

  metinAlani: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    minHeight: 76, // açıklama 1 veya 2 satır olsa da kartlar eşit boyda
  },
  kartBaslik: { fontSize: 15, fontWeight: "800", marginBottom: 4 },
  kartAciklama: { fontSize: 12, lineHeight: 16 },
});
