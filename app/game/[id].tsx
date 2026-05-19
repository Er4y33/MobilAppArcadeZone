import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../context/ScoreContext";
import { useTheme } from "../../context/ThemeContext";

const GAME_INFO = {
  reaction: {
    emoji: "⚡",
    howTo:
      "Hedef belirdiginde ekrana dokun. Ne kadar hizli, o kadar yuksek puan!",
    scoreLabel: "ms",
    lowerBetter: true,
  },
  memory: {
    emoji: "🧠",
    howTo:
      "Kartlarin yerini aklinda tut ve eslerini bul. Az hamle daha iyi skor.",
    scoreLabel: "moves",
    lowerBetter: true,
  },
  sonsaniye: {
    emoji: "⏱",
    howTo: "Karisik harflerden kelimeyi bul! Her dogru cevap puan kazandirir.",
    scoreLabel: "points",
    lowerBetter: false,
  },
} as const;

type GameKey = keyof typeof GAME_INFO;

export default function GameDetail() {
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();
  const { colors } = useTheme();
  const { getBestScore } = useScores();

  const gameKey = (id && id in GAME_INFO ? id : "reaction") as GameKey;
  const info = GAME_INFO[gameKey];
  const best = getBestScore(gameKey);

  const bestDisplay = best
    ? `${best.score} ${info.scoreLabel}`
    : "Henuz oynamadin";

  const handleStartGame = () => {
    if (id === "reaction") router.push("/game/play/reaction");
    else if (id === "memory") router.push("/game/play/memory");
    else if (id === "sonsaniye") router.push("/game/play/sonsaniye");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerWrap}>
        <Text style={styles.emoji}>{info.emoji}</Text>
        <Text style={[styles.title, { color: colors.primary }]}>
          {title || "Oyun Detayi"}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
          NASIL OYNANIR?
        </Text>
        <Text style={[styles.howTo, { color: colors.textSecondary }]}>
          {info.howTo}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
          EN IYI SKORUN
        </Text>
        <Text style={[styles.bestScore, { color: colors.accent }]}>
          {bestDisplay}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: colors.success }]}
        onPress={handleStartGame}
      >
        <Text style={styles.startText}>OYNA</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backText, { color: colors.textMuted }]}>
          Geri Don
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
