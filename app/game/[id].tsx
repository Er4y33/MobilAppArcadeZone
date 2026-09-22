import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../context/ScoreContext";
import { useTheme } from "../../context/ThemeContext";

// Metinler locales/*.json'dan gelir:
//   oyunlar.<id>.ad / .nasil   →  başlık ve "nasıl oynanır"
//   birim.<birim>              →  skor birimi
const GAME_INFO = {
  reaction: { emoji: "⚡", birim: "ms" },
  memory: { emoji: "🧠", birim: "hamle" },
  sonsaniye: { emoji: "⏱", birim: "puan" },
  mathrush: { emoji: "🔢", birim: "puan" },
  pattern: { emoji: "🎨", birim: "seviye" },
} as const;

type GameKey = keyof typeof GAME_INFO;

export default function GameDetail() {
  const { id } = useLocalSearchParams<{ id?: string; title?: string }>();
  const { colors } = useTheme();
  const { getBestScore } = useScores();
  const { t } = useTranslation();

  const gameKey = (id && id in GAME_INFO ? id : "reaction") as GameKey;
  const info = GAME_INFO[gameKey];
  const best = getBestScore(gameKey);

  const bestDisplay = best
    ? `${best.score} ${t(`birim.${info.birim}`)}`
    : t("oyun.henuzOynamadin");

  const handleStartGame = () => {
    if (gameKey === "reaction") router.push("/game/play/reaction");
    else if (gameKey === "memory") router.push("/game/play/memory");
    else if (gameKey === "sonsaniye") router.push("/game/play/sonsaniye");
    else if (gameKey === "mathrush") router.push("/game/play/mathrush");
    else if (gameKey === "pattern") router.push("/game/play/pattern");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.icerik}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.emoji}>{info.emoji}</Text>
          <Text style={[styles.title, { color: colors.primary }]}>
            {t(`oyunlar.${gameKey}.ad`)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
            {t("oyun.nasilOynanir")}
          </Text>
          <Text style={[styles.howTo, { color: colors.textSecondary }]}>
            {t(`oyunlar.${gameKey}.nasil`)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
            {t("oyun.enIyiSkorun")}
          </Text>
          <Text style={[styles.bestScore, { color: colors.accent }]}>
            {bestDisplay}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.success }]}
          onPress={handleStartGame}
        >
          <Text style={styles.startText}>{t("oyun.oyna")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backText, { color: colors.textMuted }]}>
            {t("ortak.geriDon")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  icerik: { padding: 20, paddingBottom: 32 },
  headerWrap: { alignItems: "center", marginBottom: 24, marginTop: 16 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: 1 },
  card: { borderRadius: 18, padding: 20, marginBottom: 14 },
  cardTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },
  howTo: { fontSize: 15, lineHeight: 22 },
  bestScore: { fontSize: 28, fontWeight: "900" },
  startButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  startText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    letterSpacing: 2,
  },
  backButton: { padding: 14, borderRadius: 16, alignItems: "center" },
  backText: { fontWeight: "600", fontSize: 14 },
});
