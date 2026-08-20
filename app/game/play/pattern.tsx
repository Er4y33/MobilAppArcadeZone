import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 16; // container padding
const GRID_GAP = 12;
const BUTTON_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

const COLORS = [
  { id: 0, base: "#450A0A", active: "#EF4444" },
  { id: 1, base: "#052E1B", active: "#22C55E" },
  { id: 2, base: "#1E3A5F", active: "#3B82F6" },
  { id: 3, base: "#451A03", active: "#FBBF24" },
];

const SHOW_DURATION = 550;
const GAP_DURATION = 250;

function randomColorIndex() {
  return Math.floor(Math.random() * COLORS.length);
}

export default function PatternSequenceScreen() {
  const [level, setLevel] = useState(1);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

  const sequenceRef = useRef<number[]>([]);
  const playerStepRef = useRef(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { addScore } = useScores();

  useEffect(() => {
    startGame();
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const startGame = () => {
    clearAllTimeouts();
    sequenceRef.current = [randomColorIndex()];
    playerStepRef.current = 0;
    setLevel(1);
    setGameOver(false);
    setEarnedXP(0);
    setFinalScore(0);
    playSequence();
  };

  const playSequence = () => {
    setIsShowingSequence(true);
    playerStepRef.current = 0;
    const seq = sequenceRef.current;

    seq.forEach((colorIndex, i) => {
      const showAt = i * (SHOW_DURATION + GAP_DURATION);
      const hideAt = showAt + SHOW_DURATION;

      timeoutsRef.current.push(
        setTimeout(() => setActiveIndex(colorIndex), showAt),
      );
      timeoutsRef.current.push(setTimeout(() => setActiveIndex(null), hideAt));
    });

    const totalDuration = seq.length * (SHOW_DURATION + GAP_DURATION);
    timeoutsRef.current.push(
      setTimeout(() => setIsShowingSequence(false), totalDuration),
    );
  };

  const handlePress = (colorIndex: number) => {
    if (isShowingSequence || gameOver) return;

    const expected = sequenceRef.current[playerStepRef.current];

    if (colorIndex !== expected) {
      const score = sequenceRef.current.length - 1;
      setFinalScore(score);
      setGameOver(true);
      addScore({ game: "pattern", score, label: "points" }).then((reward) =>
        setEarnedXP(reward?.xpEarned ?? 0),
      );
      return;
    }

    playerStepRef.current += 1;

    if (playerStepRef.current === sequenceRef.current.length) {
      // Tur tamamlandı, sıraya yeni bir renk ekle
      sequenceRef.current = [...sequenceRef.current, randomColorIndex()];
      setLevel(sequenceRef.current.length);
      timeoutsRef.current.push(setTimeout(playSequence, 700));
    }
  };

  // ── OYUN SONU EKRANI ──────────────────────────────────────────
  if (gameOver) {
    const stars = finalScore >= 9 ? 3 : finalScore >= 5 ? 2 : 1;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>
            {stars === 3 ? "🏆" : stars === 2 ? "⭐" : "✅"}
          </Text>
          <Text style={styles.resultTitle}>
            {stars === 3 ? "MÜKEMMEL!" : "BÖLÜM TAMAM!"}
          </Text>
          <Text style={styles.resultSub}>Sırayı Takip Et</Text>

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

          <View style={styles.statsBox}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Ulaşılan Seviye</Text>
              <Text style={styles.statValue}>{finalScore + 1}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tamamlanan Tur</Text>
              <Text style={styles.statValue}>{finalScore}</Text>
            </View>
          </View>

          <View style={styles.xpBox}>
            <Text style={styles.xpText}>+{earnedXP} XP kazandın!</Text>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={startGame}>
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>SEVİYE</Text>
          <Text style={styles.headerValue}>{level}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.gameTitle}>SIRAYI TAKİP ET</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          {isShowingSequence ? "İzle..." : "Şimdi sen tekrarla!"}
        </Text>
      </View>

      <View style={styles.grid}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.colorBtn,
              { backgroundColor: activeIndex === c.id ? c.active : c.base },
            ]}
            onPress={() => handlePress(c.id)}
            activeOpacity={0.8}
            disabled={isShowingSequence}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020", padding: 16 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { alignItems: "flex-start", minWidth: 60 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight: { minWidth: 60 },
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
    color: "#FBBF24",
    letterSpacing: 1,
  },

  statusBox: { alignItems: "center", marginBottom: 20 },
  statusText: { fontSize: 16, fontWeight: "700", color: "#9CA3AF" },

  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "center",
  },
  colorBtn: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 20,
    marginBottom: GRID_GAP,
    borderWidth: 2,
    borderColor: "#1F2B47",
  },
  backButton: {
    backgroundColor: "#151B2E",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2B47",
    marginTop: 16,
  },
  backText: { color: "#9CA3AF", fontWeight: "700" },

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
    color: "#FBBF24",
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
    backgroundColor: "#FBBF24",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: "#0B1020",
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
