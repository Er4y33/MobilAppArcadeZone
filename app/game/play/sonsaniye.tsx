import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  LEVELS,
  MAX_TIME,
  WORDS_PER_LEVEL,
  shuffleLetters,
} from "../../data/sonsaniyeKelimeler";

// Türkçe büyük/küçük harf yardımcıları
const toLowerTR = (s: string) =>
  s.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase();

const toUpperTR = (ch: string) => {
  if (ch === "i") return "İ";
  if (ch === "ı") return "I";
  return ch.toUpperCase();
};

type GamePhase = "playing" | "levelUp" | "gameOver";

export default function SonSaniyeScreen() {
  const { addScore } = useScores();
  const { colors } = useTheme();

  const [phase, setPhase] = useState<GamePhase>("playing");
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [levelSolved, setLevelSolved] = useState(0);
  const [usedInLevel, setUsedInLevel] = useState<string[]>([]);
  const [targetWord, setTargetWord] = useState("");
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isVictory, setIsVictory] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);
  const scoreRef = useRef(0); // Skor ref'i — gameOver anında güncel değeri yakala

  // ─── OYUN BAŞLAT ────────────────────────────────────────────
  const startGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    submittedRef.current = false;
    scoreRef.current = 0;
    setPhase("playing");
    setTimeLeft(MAX_TIME);
    setScore(0);
    setLevelIndex(0);
    setLevelSolved(0);
    setUsedInLevel([]);
    setFeedback("");
    setEarnedXP(0);
    loadWord(0, []);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          endGame(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ─── KELİME YÜKLE ───────────────────────────────────────────
  const loadWord = (lvlIdx: number, used: string[]) => {
    const pool = LEVELS[lvlIdx].pool;
    const available = pool.filter((w) => !used.includes(w));
    const candidates = available.length > 0 ? available : pool;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    setTargetWord(next);
    setScrambled(shuffleLetters(next));
    setInput("");
  };

  // ─── OYUNU BİTİR ────────────────────────────────────────────
  const endGame = (victory: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsVictory(victory);
    setPhase("gameOver");

    if (!submittedRef.current) {
      submittedRef.current = true;
      const finalScore = scoreRef.current;
      addScore({ game: "sonsaniye", score: finalScore, label: "points" });

      // XP tahmini göster (gerçek XP Supabase'den geliyor ama feedback için)
      const xp =
        finalScore >= 375
          ? 100
          : finalScore >= 300
            ? 85
            : finalScore >= 225
              ? 70
              : finalScore >= 150
                ? 50
                : finalScore >= 75
                  ? 35
                  : 20;
      setEarnedXP(xp);
    }
  };

  // ─── CEVAP GÖNDER ───────────────────────────────────────────
  const submitWord = () => {
    if (!input.trim() || phase !== "playing") return;
    const guess = toLowerTR(input.trim());
    const target = toLowerTR(targetWord);

    if (guess === target) {
      const pts = LEVELS[levelIndex].points;
      const newScore = scoreRef.current + pts;
      scoreRef.current = newScore;
      setScore(newScore);
      setTimeLeft((t) => Math.min(t + 5, 99));

      const newSolved = levelSolved + 1;
      const newUsed = [...usedInLevel, targetWord];

      if (newSolved >= WORDS_PER_LEVEL) {
        if (levelIndex >= LEVELS.length - 1) {
          setFeedback(`🎉 +${pts} Puan! Tüm seviyeler tamam!`);
          setTimeout(() => endGame(true), 800);
        } else {
          const nextIdx = levelIndex + 1;
          setLevelIndex(nextIdx);
          setLevelSolved(0);
          setUsedInLevel([]);
          setFeedback(`✨ SEVİYE ${nextIdx + 1}! +${pts} Puan`);
          loadWord(nextIdx, []);
        }
      } else {
        setLevelSolved(newSolved);
        setUsedInLevel(newUsed);
        setFeedback(`DOĞRU! +${pts} Puan, +5 Saniye`);
        loadWord(levelIndex, newUsed);
      }
    } else {
      setFeedback("YANLIŞ — Tekrar Dene");
      setInput("");
    }
  };

  // ─── PAS GEÇ ────────────────────────────────────────────────
  const passWord = () => {
    const newScore = Math.max(0, scoreRef.current - 5);
    scoreRef.current = newScore;
    setScore(newScore);
    const newUsed = [...usedInLevel, targetWord];
    setUsedInLevel(newUsed);
    setFeedback(`Pas: ${targetWord.toUpperCase()} (-5 Puan)`);
    loadWord(levelIndex, newUsed);
  };

  // ─── OYUN SONU EKRANI ───────────────────────────────────────
  if (phase === "gameOver") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#0a0a0c" }]}>
        <View style={styles.resultBox}>
          {/* İkon */}
          <Text style={styles.resultEmoji}>{isVictory ? "🏆" : "⏱"}</Text>

          {/* Başlık */}
          <Text style={styles.resultTitle}>
            {isVictory ? "MÜKEMMEL!" : "SÜRE BİTTİ!"}
          </Text>
          <Text style={styles.resultSub}>
            {isVictory ? "Tüm seviyeleri tamamladın!" : "Son Saniye Oyunu"}
          </Text>

          {/* Skor kutusu */}
          <View style={styles.scoreBox}>
            <Text style={styles.scoreBoxLabel}>TOPLAM SKOR</Text>
            <Text style={styles.scoreBoxValue}>{score}</Text>
          </View>

          {/* XP kazanıldı */}
          <View style={styles.xpBox}>
            <Text style={styles.xpText}>+{earnedXP} XP kazandın!</Text>
          </View>

          {/* Seviye bilgisi */}
          <Text style={styles.levelReached}>
            Ulaşılan Seviye: {levelIndex + 1} / {LEVELS.length}
          </Text>

          {/* Butonlar */}
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

  // ─── OYUN EKRANI ────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#0a0a0c" }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.dot} />
          <Text style={styles.brandText}>SON SANİYE</Text>
        </View>
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreLabel}>SKOR</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={[styles.timer, timeLeft <= 5 && styles.timerDanger]}>
          {Math.max(0, timeLeft)}
        </Text>
      </View>

      {/* Seviye Barı */}
      <View style={styles.levelBar}>
        <View>
          <Text style={styles.levelName}>
            Seviye {LEVELS[levelIndex].id} — {LEVELS[levelIndex].name}
          </Text>
          <Text style={styles.levelProgress}>
            <Text style={styles.levelProgressBold}>{levelSolved}</Text> /{" "}
            {WORDS_PER_LEVEL}
          </Text>
        </View>
        <View style={styles.levelDots}>
          {Array.from({ length: WORDS_PER_LEVEL }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.ldot,
                i < levelSolved && styles.ldotFilled,
                i === levelSolved && styles.ldotCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Harfler */}
      <View style={styles.scramble}>
        {scrambled.map((ch, i) => (
          <View key={i} style={styles.letterBox}>
            <Text style={styles.letterText}>{toUpperTR(ch)}</Text>
          </View>
        ))}
      </View>

      {/* Input */}
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Kelimeyi yaz..."
        placeholderTextColor="#7a7a85"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={submitWord}
      />

      {/* Butonlar */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPass} onPress={passWord}>
          <Text style={styles.btnPassText}>PAS (-5)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSubmit} onPress={submitWord}>
          <Text style={styles.btnSubmitText}>ONAYLA</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback */}
      <Text
        style={[
          styles.feedback,
          feedback.includes("YANLIŞ")
            ? styles.feedbackWrong
            : styles.feedbackCorrect,
        ]}
      >
        {feedback}
      </Text>

      {/* Geri */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#c8ff3e" },
  brandText: {
    fontWeight: "800",
    fontSize: 13,
    color: "#7a7a85",
    letterSpacing: 0.5,
  },
  scoreWrap: { alignItems: "flex-end" },
  scoreLabel: {
    fontSize: 10,
    color: "#7a7a85",
    letterSpacing: 1.5,
    fontWeight: "800",
  },
  scoreValue: { fontSize: 24, fontWeight: "800", color: "#e7e7ea" },

  // Timer
  timerSection: { alignItems: "center", marginBottom: 20 },
  timer: {
    fontSize: 80,
    fontWeight: "800",
    color: "#c8ff3e",
    textShadowColor: "#c8ff3e",
    textShadowRadius: 20,
  },
  timerDanger: { color: "#ff3b5c", textShadowColor: "#ff3b5c" },

  // Level bar
  levelBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0a0a0c",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26262d",
    marginBottom: 20,
  },
  levelName: {
    fontSize: 11,
    color: "#7a7a85",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 4,
  },
  levelProgress: { fontSize: 14, fontWeight: "700", color: "#e7e7ea" },
  levelProgressBold: { color: "#c8ff3e" },
  levelDots: { flexDirection: "row", gap: 6 },
  ldot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#18181d",
    borderWidth: 1,
    borderColor: "#26262d",
  },
  ldotFilled: { backgroundColor: "#c8ff3e", borderColor: "#c8ff3e" },
  ldotCurrent: { borderColor: "#c8ff3e" },

  // Scramble
  scramble: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    minHeight: 60,
  },
  letterBox: {
    width: 44,
    height: 52,
    backgroundColor: "#0a0a0c",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  letterText: { fontSize: 22, fontWeight: "700", color: "#e7e7ea" },

  // Input & Actions
  input: {
    backgroundColor: "#0a0a0c",
    borderWidth: 1,
    borderColor: "#26262d",
    color: "#e7e7ea",
    fontSize: 18,
    padding: 16,
    borderRadius: 12,
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 2,
    fontWeight: "700",
  },
  actions: { flexDirection: "row", gap: 10 },
  btnPass: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#26262d",
    alignItems: "center",
  },
  btnPassText: {
    color: "#7a7a85",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1,
  },
  btnSubmit: {
    flex: 1,
    backgroundColor: "#c8ff3e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnSubmitText: {
    color: "#0a0a0c",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
  },

  // Feedback
  feedback: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 14,
    fontWeight: "700",
    height: 20,
  },
  feedbackCorrect: { color: "#5cffa8" },
  feedbackWrong: { color: "#ff3b5c" },

  // Back
  backButton: {
    marginTop: "auto",
    backgroundColor: "#18181d",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26262d",
  },
  backText: { color: "#7a7a85", fontWeight: "700" },

  // ─── OYUN SONU ───────────────────────────────────────────────
  resultBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  resultEmoji: { fontSize: 72, marginBottom: 16 },
  resultTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#c8ff3e",
    marginBottom: 8,
    textAlign: "center",
  },
  resultSub: { fontSize: 14, color: "#7a7a85", marginBottom: 28 },
  scoreBox: {
    backgroundColor: "#111114",
    borderWidth: 1,
    borderColor: "#26262d",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  scoreBoxLabel: {
    fontSize: 11,
    color: "#7a7a85",
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 8,
  },
  scoreBoxValue: { fontSize: 56, fontWeight: "900", color: "#c8ff3e" },
  xpBox: {
    backgroundColor: "#1a2a0a",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
  },
  xpText: { color: "#5cffa8", fontSize: 16, fontWeight: "800" },
  levelReached: { color: "#7a7a85", fontSize: 13, marginBottom: 28 },
  btnPrimary: {
    backgroundColor: "#c8ff3e",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: "#0a0a0c",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 2,
  },
  btnSecondary: {
    backgroundColor: "#18181d",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#26262d",
  },
  btnSecondaryText: { color: "#7a7a85", fontWeight: "700", fontSize: 14 },
});
