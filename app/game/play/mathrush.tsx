import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

const TOTAL_ROUNDS = 10;
const ROUND_SECONDS = 8;

type Question = {
  a: number;
  b: number;
  op: "+" | "-";
  answer: number;
};

type Feedback = "none" | "correct" | "wrong" | "timeout";

function generateQuestion(): Question {
  const op: "+" | "-" = Math.random() < 0.5 ? "+" : "-";
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 20) + 1;
  if (op === "-" && b > a) {
    [a, b] = [b, a];
  }
  const answer = op === "+" ? a + b : a - b;
  return { a, b, op, answer };
}

function generateOptions(answer: number): number[] {
  const options = new Set<number>([answer]);
  let guard = 0;
  while (options.size < 4 && guard < 50) {
    guard++;
    const offset = Math.floor(Math.random() * 9) - 4; // -4..+4
    const candidate = answer + offset;
    if (candidate >= 0 && candidate !== answer) {
      options.add(candidate);
    }
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

export default function MathRushScreen() {
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState<Question>(() => generateQuestion());
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [gameOver, setGameOver] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Async timer'ların gecikmeli çalışması yüzünden state yerine ref'ten okuyoruz
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addScore } = useScores();

  useEffect(() => {
    startRound(generateQuestion());
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  const startRound = (q: Question) => {
    setQuestion(q);
    setOptions(generateOptions(q.answer));
    setFeedback("none");
    setTimeLeft(ROUND_SECONDS);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const goToNextRound = () => {
    if (roundRef.current >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }
    roundRef.current += 1;
    setRound(roundRef.current);
    startRound(generateQuestion());
  };

  const handleTimeout = () => {
    setFeedback("timeout");
    advanceTimeoutRef.current = setTimeout(goToNextRound, 900);
  };

  const handleAnswer = (
    value: number,
    currentQuestion: Question,
    currentTimeLeft: number,
  ) => {
    if (feedback !== "none") return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (value === currentQuestion.answer) {
      setFeedback("correct");
      scoreRef.current += 10 + currentTimeLeft; // hız bonusu
      correctRef.current += 1;
      setScore(scoreRef.current);
      setCorrectCount(correctRef.current);
    } else {
      setFeedback("wrong");
    }
    advanceTimeoutRef.current = setTimeout(goToNextRound, 900);
  };

  const finishGame = () => {
    setGameOver(true);
    addScore({ game: "mathrush", score: scoreRef.current, label: "points" });
    const c = correctRef.current;
    const xp = c >= 9 ? 100 : c >= 7 ? 75 : c >= 5 ? 55 : c >= 3 ? 35 : 20;
    setEarnedXP(xp);
  };

  const resetGame = () => {
    roundRef.current = 1;
    scoreRef.current = 0;
    correctRef.current = 0;
    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setGameOver(false);
    setEarnedXP(0);
    startRound(generateQuestion());
  };

  // ── OYUN SONU EKRANI ──────────────────────────────────────────
  if (gameOver) {
    const stars = correctCount >= 9 ? 3 : correctCount >= 6 ? 2 : 1;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>
            {stars === 3 ? "🏆" : stars === 2 ? "⭐" : "✅"}
          </Text>
          <Text style={styles.resultTitle}>
            {stars === 3 ? "MÜKEMMEL!" : "BÖLÜM TAMAM!"}
          </Text>
          <Text style={styles.resultSub}>Sayı Avı</Text>

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
              <Text style={styles.statLabel}>Toplam Puan</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Doğru Cevap</Text>
              <Text style={styles.statValue}>
                {correctCount} / {TOTAL_ROUNDS}
              </Text>
            </View>
          </View>

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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>PUAN</Text>
          <Text style={styles.headerValue}>{score}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.gameTitle}>SAYI AVI</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>TUR</Text>
          <Text style={[styles.headerValue, { color: "#06B6D4" }]}>
            {round}/{TOTAL_ROUNDS}
          </Text>
        </View>
      </View>

      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${(timeLeft / ROUND_SECONDS) * 100}%` },
          ]}
        />
      </View>

      <View
        style={[
          styles.questionBox,
          feedback === "correct" && styles.questionCorrect,
          feedback === "wrong" && styles.questionWrong,
          feedback === "timeout" && styles.questionTimeout,
        ]}
      >
        <Text style={styles.questionText}>
          {question.a} {question.op} {question.b} = ?
        </Text>
        {feedback === "timeout" && (
          <Text style={styles.feedbackText}>Süre doldu!</Text>
        )}
      </View>

      <View style={styles.optionsGrid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optionBtn,
              feedback !== "none" &&
                opt === question.answer &&
                styles.optionCorrect,
            ]}
            onPress={() => handleAnswer(opt, question, timeLeft)}
            disabled={feedback !== "none"}
            activeOpacity={0.85}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
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
    color: "#06B6D4",
    letterSpacing: 1,
  },

  progressBg: {
    height: 6,
    backgroundColor: "#1F2B47",
    borderRadius: 3,
    marginBottom: 24,
  },
  progressFill: { height: 6, backgroundColor: "#06B6D4", borderRadius: 3 },

  questionBox: {
    backgroundColor: "#151B2E",
    borderRadius: 20,
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#1F2B47",
  },
  questionCorrect: { backgroundColor: "#064E3B", borderColor: "#22C55E" },
  questionWrong: { backgroundColor: "#450A0A", borderColor: "#EF4444" },
  questionTimeout: { backgroundColor: "#451A03", borderColor: "#F59E0B" },
  questionText: { fontSize: 40, fontWeight: "900", color: "#FFFFFF" },
  feedbackText: {
    fontSize: 14,
    color: "#FBBF24",
    marginTop: 8,
    fontWeight: "700",
  },

  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionBtn: {
    width: "48%",
    backgroundColor: "#151B2E",
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#1F2B47",
  },
  optionCorrect: { backgroundColor: "#064E3B", borderColor: "#22C55E" },
  optionText: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },

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
    color: "#06B6D4",
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
    backgroundColor: "#06B6D4",
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
