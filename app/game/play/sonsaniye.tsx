import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

// ===== KELİME HAVUZLARI (Orijinal HTML'den birebir alındı) =====
const SEVIYE_1 = [
  "aslan",
  "bulut",
  "çilek",
  "demir",
  "elmas",
  "fener",
  "güneş",
  "hamur",
  "ırmak",
  "kavun",
  "limon",
  "makas",
  "nehir",
  "orman",
  "pamuk",
  "roman",
  "sakal",
  "tabak",
  "vapur",
  "yılan",
];
const SEVIYE_2 = [
  "bayrak",
  "ceylan",
  "çardak",
  "defter",
  "fincan",
  "gömlek",
  "harita",
  "kaplan",
  "leylek",
  "mantar",
  "peynir",
  "rüzgar",
  "sandık",
  "şelale",
  "tavşan",
  "yaprak",
  "zeytin",
  "bakkal",
  "dükkan",
  "fındık",
];
const SEVIYE_3 = [
  "tencere",
  "pencere",
  "karınca",
  "kelebek",
  "kestane",
  "papatya",
  "şeftali",
  "fasulye",
  "bezelye",
  "çimento",
  "ıspanak",
  "palyaço",
  "şemsiye",
  "fabrika",
  "kanarya",
  "testere",
  "domates",
  "kereviz",
  "enginar",
  "makarna",
];
const SEVIYE_4 = [
  "portakal",
  "sandalye",
  "çikolata",
  "pırlanta",
  "pantolon",
  "merdiven",
  "sardunya",
  "mercimek",
  "barbunya",
  "şempanze",
  "flamingo",
  "porselen",
  "karanfil",
  "sarımsak",
  "gergedan",
  "akvaryum",
  "orkestra",
  "gramofon",
  "teleskop",
  "bisiklet",
];
const SEVIYE_5 = [
  "mandalina",
  "kertenkele",
  "helikopter",
  "televizyon",
  "üniversite",
  "tarantula",
  "orangutan",
  "mikroskop",
  "vantilatör",
  "kalorifer",
  "enstrüman",
  "hamburger",
  "matematik",
  "olimpiyat",
  "ansiklopedi",
  "viyolonsel",
  "kafeterya",
  "jeneratör",
  "laboratuvar",
  "astronomi",
];

const LEVELS = [
  { id: 1, name: "5 Harfli Kelimeler", pool: SEVIYE_1, points: 5 },
  { id: 2, name: "6 Harfli Kelimeler", pool: SEVIYE_2, points: 10 },
  { id: 3, name: "7 Harfli Kelimeler", pool: SEVIYE_3, points: 15 },
  { id: 4, name: "8 Harfli Kelimeler", pool: SEVIYE_4, points: 20 },
  { id: 5, name: "8+ Harfli Kelimeler", pool: SEVIYE_5, points: 25 },
];

const MAX_TIME = 30;
const WORDS_PER_LEVEL = 5;

// YARDIMCI FONKSİYONLAR (Orijinal yapı)
const toLowerTR = (s: string) => {
  return s.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase();
};

const toUpperTR = (ch: string) => {
  if (ch === "i") return "İ";
  if (ch === "ı") return "I";
  return ch.toUpperCase();
};

const shuffleLetters = (word: string) => {
  const chars = Array.from(word);
  if (chars.length < 2) return chars;
  let attempt = 0;
  let shuffled;
  do {
    shuffled = chars.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    attempt++;
  } while (shuffled.join("") === chars.join("") && attempt < 12);
  return shuffled;
};

export default function SonSaniyeScreen() {
  // STATE YÖNETİMİ
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [levelSolved, setLevelSolved] = useState(0);
  const [usedInLevel, setUsedInLevel] = useState<string[]>([]);

  const [targetWord, setTargetWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [feedback, setFeedback] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addScore } = useScores();
  const submittedScoreRef = useRef(false);

  useEffect(() => {
    startGame();
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !gameOver) {
      handleEndGame(false);
    }
  }, [timeLeft]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startGame = () => {
    stopTimer();
    setTimeLeft(MAX_TIME);
    setScore(0);
    setLevelIndex(0);
    setLevelSolved(0);
    setUsedInLevel([]);
    setGameOver(false);
    setVictory(false);
    setFeedback("");
    submittedScoreRef.current = false;

    // İlk kelimeyi yükle
    loadNextWord(0, []);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  };

  const loadNextWord = (
    currentLevelIdx: number,
    currentUsedWords: string[],
  ) => {
    const pool = LEVELS[currentLevelIdx].pool;
    const available = pool.filter((w) => !currentUsedWords.includes(w));
    const candidates = available.length > 0 ? available : pool;

    let next;
    do {
      next = candidates[Math.floor(Math.random() * candidates.length)];
    } while (next === targetWord && candidates.length > 1);

    setTargetWord(next);
    setScrambledWord(shuffleLetters(next));
    setInput("");
  };

  const handleEndGame = (isVictory: boolean) => {
    setGameOver(true);
    setVictory(isVictory);
    stopTimer();

    if (!submittedScoreRef.current) {
      submittedScoreRef.current = true;
      addScore({
        game: "sonsaniye",
        score: score, // Skor AuthContext üzerinden veritabanına gidip XP kazandıracak
        label: "points",
      });
    }
  };

  const submitWord = () => {
    if (!input.trim()) return;

    const guess = toLowerTR(input.trim());
    const target = toLowerTR(targetWord);

    if (guess === target) {
      const currentLevel = LEVELS[levelIndex];
      const pts = currentLevel.points;

      const newScore = score + pts;
      setScore(newScore);
      setTimeLeft((prev) => Math.min(prev + 5, 99)); // +5 Saniye

      const newLevelSolved = levelSolved + 1;
      const newUsedInLevel = [...usedInLevel, targetWord];

      setFeedback(`DOĞRU! +${pts} Puan, +5 Saniye`);

      if (newLevelSolved >= WORDS_PER_LEVEL) {
        // Seviye Atladı
        if (levelIndex >= LEVELS.length - 1) {
          // Oyunu Bitirdi (Zafer)
          handleEndGame(true);
        } else {
          // Sonraki Seviyeye Geç
          const nextIdx = levelIndex + 1;
          setLevelIndex(nextIdx);
          setLevelSolved(0);
          setUsedInLevel([]);
          loadNextWord(nextIdx, []);
          setFeedback(`✨ SEVİYE ATLANDI: ${LEVELS[nextIdx].name} ✨`);
        }
      } else {
        // Aynı seviyede devam
        setLevelSolved(newLevelSolved);
        setUsedInLevel(newUsedInLevel);
        loadNextWord(levelIndex, newUsedInLevel);
      }
    } else {
      setFeedback("YANLIŞ — Tekrar Dene");
      setInput("");
    }
  };

  const passWord = () => {
    setScore((prev) => Math.max(0, prev - 5)); // -5 Puan cezası
    setFeedback(`Pas Geçildi: ${toUpperTR(targetWord)} (-5 Puan)`);
    setUsedInLevel((prev) => [...prev, targetWord]);
    loadNextWord(levelIndex, [...usedInLevel, targetWord]);
  };

  return (
    <SafeAreaView style={styles.container}>
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

      {!gameOver ? (
        <>
          <View style={styles.timerSection}>
            <Text style={[styles.timer, timeLeft <= 5 && styles.timerDanger]}>
              {Math.max(0, timeLeft)}
            </Text>
          </View>

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

          <View style={styles.scramble}>
            {scrambledWord.map((ch, i) => (
              <View key={i} style={styles.letterBox}>
                <Text style={styles.letterText}>{toUpperTR(ch)}</Text>
              </View>
            ))}
          </View>

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

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnPass} onPress={passWord}>
              <Text style={styles.btnPassText}>PAS (-5)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSubmit} onPress={submitWord}>
              <Text style={styles.btnSubmitText}>ONAYLA</Text>
            </TouchableOpacity>
          </View>

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
        </>
      ) : (
        <View style={styles.gameOverBox}>
          <Text style={styles.gameOverTitle}>
            {victory ? "TÜM SEVİYELER TAMAM! 🎉" : "SÜRE BİTTİ!"}
          </Text>
          <Text style={styles.gameOverSub}>Toplam Skorun</Text>
          <Text style={styles.finalScore}>{score}</Text>
          <TouchableOpacity style={styles.btnSubmit} onPress={startGame}>
            <Text style={styles.btnSubmitText}>YENİDEN OYNA</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0c", padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c8ff3e",
    shadowColor: "#c8ff3e",
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
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
  timerSection: { alignItems: "center", marginBottom: 20 },
  timer: {
    fontSize: 80,
    fontWeight: "800",
    color: "#c8ff3e",
    textShadowColor: "#c8ff3e",
    textShadowRadius: 20,
  },
  timerDanger: { color: "#ff3b5c", textShadowColor: "#ff3b5c" },
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
  ldotFilled: {
    backgroundColor: "#c8ff3e",
    borderColor: "#c8ff3e",
    shadowColor: "#c8ff3e",
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  ldotCurrent: {
    borderColor: "#c8ff3e",
    shadowColor: "#c8ff3e",
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
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
    shadowColor: "#c8ff3e",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnSubmitText: {
    color: "#0a0a0c",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1,
  },
  feedback: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 14,
    fontWeight: "700",
    height: 20,
  },
  feedbackCorrect: { color: "#5cffa8" },
  feedbackWrong: { color: "#ff3b5c" },
  gameOverBox: {
    backgroundColor: "#111114",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26262d",
  },
  gameOverTitle: {
    color: "#c8ff3e",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  gameOverSub: { color: "#7a7a85", fontSize: 14, marginBottom: 20 },
  finalScore: {
    fontSize: 64,
    fontWeight: "900",
    color: "#c8ff3e",
    marginBottom: 30,
  },
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
});
