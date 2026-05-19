import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

type GameState = "waiting" | "ready" | "tapped" | "tooSoon";

export default function ReactionTapScreen() {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [result, setResult] = useState<number | null>(null);
  const [bestSession, setBestSession] = useState<number | null>(null);
  const [showRecord, setShowRecord] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { addScore, getBestScore } = useScores();

  useEffect(() => {
    startRound();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startRound = () => {
    setGameState("waiting");
    setResult(null);
    setShowRecord(false);
    startTimeRef.current = null;

    const delay = Math.floor(Math.random() * 3000) + 1500;
    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleTap = () => {
    if (gameState === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState("tooSoon");
      return;
    }

    if (gameState === "ready") {
      const ms = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      setResult(ms);
      setGameState("tapped");

      // Rekor kontrolü
      const prevBest = getBestScore("reaction");
      const isRecord = !prevBest || ms < prevBest.score;
      if (!bestSession || ms < bestSession) {
        setBestSession(ms);
        if (isRecord) setShowRecord(true);
      }

      addScore({ game: "reaction", score: ms, label: "ms" });
      return;
    }

    // tapped veya tooSoon → yeni round
    startRound();
  };

  // Renk mantığı
  const areaColor =
    gameState === "ready"
      ? "#22C55E"
      : gameState === "tooSoon"
        ? "#DC2626"
        : gameState === "tapped"
          ? result !== null && result < 200
            ? "#A855F7"
            : "#1F2B47"
          : "#151B2E";

  // Mesaj
  const message =
    gameState === "waiting"
      ? "Hazır ol..."
      : gameState === "ready"
        ? "DOKUN!"
        : gameState === "tooSoon"
          ? "Çok erken!"
          : result !== null
            ? `${result} ms`
            : "";

  const subMessage =
    gameState === "waiting"
      ? "Yeşile dönünce dokun"
      : gameState === "ready"
        ? "ŞİMDİ!"
        : gameState === "tooSoon"
          ? "Tekrar denemek için dokun"
          : gameState === "tapped"
            ? result !== null && result < 150
              ? "İnanılmaz hız! ⚡"
              : result !== null && result < 200
                ? "Çok hızlı! 🔥"
                : result !== null && result < 300
                  ? "İyi tepki 👍"
                  : "Biraz yavaş, tekrar dene"
            : "";

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.topBar}>
        <Text style={styles.gameTitle}>TEPKİ OYUNU</Text>
        {bestSession !== null && (
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>EN İYİ: {bestSession}ms</Text>
          </View>
        )}
      </View>

      {/* Rekor banner */}
      {showRecord && (
        <View style={styles.recordBanner}>
          <Text style={styles.recordText}>🎉 YENİ REKOR!</Text>
        </View>
      )}

      {/* Ana dokunma alanı */}
      <TouchableOpacity
        style={[styles.tapArea, { backgroundColor: areaColor }]}
        onPress={handleTap}
        activeOpacity={0.92}
      >
        {/* Daire animasyonu (waiting state) */}
        {gameState === "waiting" && (
          <View style={styles.waitCircleOuter}>
            <View style={styles.waitCircleInner}>
              <Text style={styles.waitDot}>●</Text>
            </View>
          </View>
        )}

        {gameState === "ready" && (
          <View style={styles.readyCircle}>
            <Text style={styles.readyLabel}>DOKUN!</Text>
          </View>
        )}

        {gameState === "tapped" && result !== null && (
          <View style={styles.resultWrap}>
            <Text style={styles.resultMs}>{result}</Text>
            <Text style={styles.resultUnit}>ms</Text>
          </View>
        )}

        {gameState === "tooSoon" && <Text style={styles.tooSoonIcon}>✕</Text>}

        <Text style={styles.message}>
          {message !== `${result} ms` ? message : ""}
        </Text>
        <Text style={styles.subMessage}>{subMessage}</Text>
      </TouchableOpacity>

      {/* Alt bilgi (tapped state'de) */}
      {gameState === "tapped" && result !== null && (
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>SKOR</Text>
            <Text style={styles.statValue}>{result} ms</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>EN İYİ</Text>
            <Text style={[styles.statValue, { color: "#A855F7" }]}>
              {bestSession ?? result} ms
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020", padding: 20 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#A855F7",
    letterSpacing: 2,
  },
  bestBadge: {
    backgroundColor: "#1F2B47",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bestBadgeText: { color: "#A855F7", fontSize: 11, fontWeight: "700" },

  recordBanner: {
    backgroundColor: "#A855F7",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  recordText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 2,
  },

  tapArea: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  // Waiting state
  waitCircleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: "#A855F7",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  waitCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1F2B47",
    justifyContent: "center",
    alignItems: "center",
  },
  waitDot: { fontSize: 32, color: "#A855F7" },

  // Ready state
  readyCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#22C55E",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  readyLabel: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },

  // Result
  resultWrap: { alignItems: "center", marginBottom: 16 },
  resultMs: { fontSize: 72, fontWeight: "900", color: "#FFFFFF" },
  resultUnit: {
    fontSize: 18,
    color: "#9CA3AF",
    fontWeight: "700",
    marginTop: -8,
  },

  // Too soon
  tooSoonIcon: { fontSize: 72, color: "#FFFFFF", marginBottom: 16 },

  message: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subMessage: { fontSize: 14, color: "#E5E7EB", textAlign: "center" },

  // Stats row (tapped state)
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: "#151B2E",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  statValue: { fontSize: 20, fontWeight: "900", color: "#FFFFFF" },

  backButton: {
    backgroundColor: "#151B2E",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2B47",
  },
  backText: { color: "#9CA3AF", fontWeight: "700" },
});
