import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

type CardType = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

const baseCards = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🍑", "🍍"];

function createGameCards(): CardType[] {
  const doubled = [...baseCards, ...baseCards];
  const shuffled = [...doubled].sort(() => Math.random() - 0.5);
  return shuffled.map((value, index) => ({
    id: index,
    value,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryMatchScreen() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const { addScore } = useScores();

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    const ca = cards.find((c) => c.id === a);
    const cb = cards.find((c) => c.id === b);
    if (!ca || !cb) return;

    setMoves((m) => m + 1);

    if (ca.value === cb.value) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === a || c.id === b ? { ...c, matched: true } : c,
        ),
      );
      setSelected([]);
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c,
          ),
        );
        setSelected([]);
      }, 700);
    }
  }, [selected]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched) && !gameWon) {
      setGameWon(true);
      addScore({ game: "memory", score: moves, label: "moves" });
      const xp =
        moves <= 8
          ? 100
          : moves <= 10
            ? 75
            : moves <= 14
              ? 55
              : moves <= 20
                ? 35
                : 20;
      setEarnedXP(xp);
    }
  }, [cards, gameWon, moves]);

  const resetGame = () => {
    setCards(createGameCards());
    setSelected([]);
    setMoves(0);
    setGameWon(false);
    setEarnedXP(0);
  };

  const handleCardPress = (id: number) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched || selected.length === 2) return;
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
    );
    setSelected((prev) => [...prev, id]);
  };

  const matched = cards.filter((c) => c.matched).length / 2;

  // ── OYUN SONU EKRANI ──────────────────────────────────────────
  if (gameWon) {
    const stars = moves <= 8 ? 3 : moves <= 12 ? 2 : 1;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>
            {stars === 3 ? "🏆" : stars === 2 ? "⭐" : "✅"}
          </Text>

          <Text style={styles.resultTitle}>
            {stars === 3
              ? "MÜKEMMEL!"
              : stars === 2
                ? "BÖLÜM TAMAM!"
                : "BÖLÜM TAMAM!"}
          </Text>
          <Text style={styles.resultSub}>Hafıza Oyunu</Text>

          {/* Yıldızlar */}
          <View style={styles.starsRow}>
            {[1, 2, 3].map((s) => (
              <Text
                key={s}
                style={[styles.star, s <= stars && styles.starActive]}
              >
                ★
              </Text>
            ))}
          </View>

          {/* İstatistikler */}
          <View style={styles.statsBox}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Kullanılan Hamle</Text>
              <Text style={styles.statValue}>{moves}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Eşleştirilen Çift</Text>
              <Text style={styles.statValue}>
                {baseCards.length} / {baseCards.length}
              </Text>
            </View>
          </View>

          {/* XP */}
          <View style={styles.xpBox}>
            <Text style={styles.xpText}>+{earnedXP} XP kazandın!</Text>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={resetGame}>
            <Text style={styles.btnPrimaryText}>YENİDEN OYNA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.btnSecondaryText}>ANA MENÜ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── OYUN EKRANI ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>HAMLE</Text>
          <Text style={styles.headerValue}>{moves}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.gameTitle}>HAFIZA OYUNU</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>ESLESME</Text>
          <Text style={[styles.headerValue, { color: "#EC4899" }]}>
            {matched}/{baseCards.length}
          </Text>
        </View>
      </View>

      {/* İlerleme barı */}
      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${(matched / baseCards.length) * 100}%` },
          ]}
        />
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.flipped && !card.matched && styles.cardFlipped,
              card.matched && styles.cardMatched,
            ]}
            onPress={() => handleCardPress(card.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.cardText}>
              {card.flipped || card.matched ? card.value : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const CARD_SIZE = "23%";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020", padding: 16 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { alignItems: "flex-start", minWidth: 60 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight: { alignItems: "flex-end", minWidth: 60 },
  headerLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  headerValue: { fontSize: 22, fontWeight: "900", color: "#FFFFFF" },
  gameTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EC4899",
    letterSpacing: 1,
  },

  // Progress
  progressBg: {
    height: 6,
    backgroundColor: "#1F2B47",
    borderRadius: 3,
    marginBottom: 16,
  },
  progressFill: { height: 6, backgroundColor: "#EC4899", borderRadius: 3 },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_SIZE,
    aspectRatio: 1,
    backgroundColor: "#151B2E",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#1F2B47",
  },
  cardFlipped: { backgroundColor: "#1E1B4B", borderColor: "#EC4899" },
  cardMatched: { backgroundColor: "#064E3B", borderColor: "#22C55E" },
  cardText: { fontSize: 26, fontWeight: "800" },

  // Back
  backButton: {
    marginTop: "auto",
    backgroundColor: "#151B2E",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2B47",
  },
  backText: { color: "#9CA3AF", fontWeight: "700" },

  // ── Oyun Sonu ───────────────────────────────────────────────────
  resultBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#EC4899",
    marginBottom: 4,
  },
  resultSub: { fontSize: 14, color: "#9CA3AF", marginBottom: 20 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  star: { fontSize: 36, color: "#374151" },
  starActive: { color: "#FBBF24" },
  statsBox: {
    backgroundColor: "#151B2E",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statLabel: { color: "#9CA3AF", fontSize: 14 },
  statValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  xpBox: {
    backgroundColor: "#064E3B",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 24,
  },
  xpText: { color: "#22C55E", fontSize: 16, fontWeight: "800" },
  btnPrimary: {
    backgroundColor: "#EC4899",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  btnSecondary: {
    backgroundColor: "#151B2E",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#1F2B47",
  },
  btnSecondaryText: { color: "#9CA3AF", fontWeight: "700" },
});
