import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import GeriSayim from "../../../components/GeriSayim";
import { Difficulty, useScores } from "../../../context/ScoreContext";
import { useSound } from "../../../context/SoundContext";
import {
  LEVELS,
  MAX_TIME,
  WORDS_PER_LEVEL,
  shuffleLetters,
} from "../../../lib/data/sonsaniyeKelimeler";
import {
  hapticError,
  hapticLight,
  hapticSuccess,
  hapticWarning,
} from "../../../lib/haptics";
import { useGeriSayim } from "../../../lib/useGeriSayim";

// Türkçe büyük/küçük harf yardımcıları
const toLowerTR = (s: string) =>
  s.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase();

const toUpperTR = (ch: string) => {
  if (ch === "i") return "İ";
  if (ch === "ı") return "I";
  return ch.toUpperCase();
};

type GamePhase = "playing" | "gameOver";
type Mod = "yazmali" | "dokunmali";

// Mod → veritabanı zorluğu eşlemesi
const MOD_ZORLUK: Record<Mod, Difficulty> = {
  dokunmali: "kolay",
  yazmali: "orta",
};

const CEZA_SANIYE = 2;
const KILIT_SURESI = 500;

export default function SonSaniyeScreen() {
  const { addScore } = useScores();
  const { cal } = useSound();
  const [mod, setMod] = useState<Mod | null>(null);
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

  // Dokunmalı mod durumu
  const [kullanilan, setKullanilan] = useState<number[]>([]); // yerleşen harflerin scrambled index'leri
  const [dogruIndex, setDogruIndex] = useState<number | null>(null); // yeşil yanan
  const [yanlisIndex, setYanlisIndex] = useState<number | null>(null); // kırmızı yanan
  const [, setKilitli] = useState(false);
  const kilitliRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);
  const scoreRef = useRef(0);
  const modRef = useRef<Mod>("yazmali"); // async endGame için
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bekleyenlerRef = useRef<ReturnType<typeof setTimeout>[]>([]); // diğer gecikmeli işler

  // 3-2-1 bitince süre akmaya başlar
  const geriSayim = useGeriSayim(
    () => zamanlayiciBaslat(),
    () => cal("tick"),
  );

  // Takip edilen gecikmeli iş: Mod Değiştir / çıkışta iptal edilebilir
  const sonra = (fn: () => void, ms: number) => {
    bekleyenlerRef.current.push(setTimeout(fn, ms));
  };

  const hepsiniTemizle = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (flashRef.current) clearTimeout(flashRef.current);
    bekleyenlerRef.current.forEach(clearTimeout);
    timerRef.current = null;
    flashRef.current = null;
    bekleyenlerRef.current = [];
  };

  // Ekrandan çıkılırsa oyun arkada devam edip skor kaydetmesin
   
  useEffect(() => hepsiniTemizle, []);

  // Son 3 saniye uyarısı
  useEffect(() => {
    if (phase !== "playing" || !mod || geriSayim.aktif) return;
    if (timeLeft <= 3 && timeLeft > 0) cal("tick");
  }, [timeLeft, phase, mod, geriSayim.aktif, cal]);

  // Süre dolunca — state güncelleyicisinin DIŞINDA tetiklenir
  useEffect(() => {
    if (timeLeft !== 0 || phase !== "playing" || !mod) return;
    endGame(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const zamanlayiciBaslat = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);
  };

  // ─── OYUN BAŞLAT ────────────────────────────────────────────
  const startGame = (m: Mod) => {
    hepsiniTemizle();
    submittedRef.current = false;
    scoreRef.current = 0;
    modRef.current = m;

    setMod(m);
    setPhase("playing");
    setTimeLeft(MAX_TIME);
    setScore(0);
    setLevelIndex(0);
    setLevelSolved(0);
    setUsedInLevel([]);
    setFeedback("");
    setEarnedXP(0);
    loadWord(0, []);
    geriSayim.baslat();
  };

  // ─── KELİME YÜKLE ───────────────────────────────────────────
  const loadWord = (lvlIdx: number, used: string[]) => {
    const pool = LEVELS[lvlIdx].pool;
    const available = pool.filter((w) => !used.includes(w));
    const candidates = available.length > 0 ? available : pool;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    setTargetWord(next);
    setScrambled(shuffleLetters(next));
    setInput("");
    setKullanilan([]);
    setDogruIndex(null);
    setYanlisIndex(null);
    kilitliRef.current = false;
    setKilitli(false);
  };

  // ─── OYUNU BİTİR ────────────────────────────────────────────
  const endGame = (victory: boolean) => {
    hepsiniTemizle();

    if (victory) {
      hapticSuccess();
      cal("win");
    } else {
      hapticWarning();
    }

    setIsVictory(victory);
    setPhase("gameOver");

    if (!submittedRef.current) {
      submittedRef.current = true;
      const finalScore = scoreRef.current;
      addScore({
        game: "sonsaniye",
        score: finalScore,
        label: "points",
        difficulty: MOD_ZORLUK[modRef.current],
      });

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

  // ─── KELİME ÇÖZÜLDÜ (ortak akış) ────────────────────────────
  const kelimeCozuldu = () => {
    hapticSuccess();
    cal("correct");
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
        if (timerRef.current) clearInterval(timerRef.current); // bitiş beklerken süre akmasın
        sonra(() => endGame(true), 800);
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
  };

  // ─── YAZMALI MOD: CEVAP GÖNDER ──────────────────────────────
  const submitWord = () => {
    if (!input.trim() || phase !== "playing") return;
    const guess = toLowerTR(input.trim());
    const target = toLowerTR(targetWord);

    if (guess === target) {
      kelimeCozuldu();
    } else {
      hapticError();
      cal("wrong");
      setFeedback("YANLIŞ — Tekrar Dene");
      setInput("");
    }
  };

  // ─── DOKUNMALI MOD: HARFE BAS ───────────────────────────────
  const harfeBas = (index: number) => {
    if (phase !== "playing") return;
    if (kilitliRef.current) return;
    if (kullanilan.includes(index)) return;

    const hedef = toLowerTR(targetWord);
    const siradaki = hedef[kullanilan.length];
    const basilan = toLowerTR(scrambled[index]);

    if (flashRef.current) clearTimeout(flashRef.current);

    if (basilan === siradaki) {
      // Doğru harf → yeşil yan, boşluğa yerleş
      hapticLight();
      cal("click");
      setDogruIndex(index);
      setYanlisIndex(null);

      const yeni = [...kullanilan, index];
      setKullanilan(yeni);

      flashRef.current = setTimeout(() => setDogruIndex(null), 250);

      if (yeni.length === hedef.length) {
        // Son harften sonra kelime geçişi sırasında başka harfe basılmasın
        kilitliRef.current = true;
        sonra(kelimeCozuldu, 300);
      }
    } else {
      // Yanlış harf → kırmızı titret, süre cezası, kısa kilit
      hapticError();
      cal("wrong");
      setYanlisIndex(index);
      setDogruIndex(null);

      kilitliRef.current = true;
      setKilitli(true);

      setTimeLeft((t) => Math.max(1, t - CEZA_SANIYE));
      setFeedback(`YANLIŞ — ${CEZA_SANIYE} saniye`);

      flashRef.current = setTimeout(() => {
        setYanlisIndex(null);
        kilitliRef.current = false;
        setKilitli(false);
      }, KILIT_SURESI);
    }
  };

  // ─── PAS GEÇ ────────────────────────────────────────────────
  const passWord = () => {
    hapticLight();
    cal("click");
    const newScore = Math.max(0, scoreRef.current - 5);
    scoreRef.current = newScore;
    setScore(newScore);
    const newUsed = [...usedInLevel, targetWord];
    setUsedInLevel(newUsed);
    setFeedback(`Pas: ${targetWord.toUpperCase()} (-5 Puan)`);
    loadWord(levelIndex, newUsed);
  };

  const modDegistir = () => {
    geriSayim.iptal();
    hepsiniTemizle();
    setMod(null);
    setPhase("playing");
  };

  // ─── MOD SEÇİM EKRANI ───────────────────────────────────────
  if (!mod) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#0a0a0c" }]}>
        <View style={styles.secimBox}>
          <Text style={styles.secimEmoji}>⏱</Text>
          <Text style={styles.secimBaslik}>SON SANİYE</Text>
          <Text style={styles.secimAlt}>Mod seç</Text>

          <Animated.View
            style={{ width: "100%" }}
            entering={FadeInDown.duration(350)}
          >
            <TouchableOpacity
              style={[styles.modBtn, styles.modDokunmali]}
              onPress={() => startGame("dokunmali")}
              activeOpacity={0.85}
            >
              <Text style={styles.modBtnText}>DOKUNMALI</Text>
              <Text style={styles.modBtnSub}>
                Harflere sırayla bas · Klavye yok
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{ width: "100%" }}
            entering={FadeInDown.delay(80).duration(350)}
          >
            <TouchableOpacity
              style={[styles.modBtn, styles.modYazmali]}
              onPress={() => startGame("yazmali")}
              activeOpacity={0.85}
            >
              <Text style={styles.modBtnText}>YAZMALI</Text>
              <Text style={styles.modBtnSub}>
                Kelimeyi klavyeyle yaz · Klasik
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── OYUN SONU EKRANI ───────────────────────────────────────
  if (phase === "gameOver") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#0a0a0c" }]}>
        <View style={styles.resultBox}>
          <Animated.Text
            style={styles.resultEmoji}
            entering={ZoomIn.duration(400)}
          >
            {isVictory ? "🏆" : "⏱"}
          </Animated.Text>

          <Text style={styles.resultTitle}>
            {isVictory ? "MÜKEMMEL!" : "SÜRE BİTTİ!"}
          </Text>
          <Text style={styles.resultSub}>
            {mod === "dokunmali" ? "Dokunmalı Mod" : "Yazmalı Mod"}
          </Text>

          <Animated.View
            style={styles.scoreBox}
            entering={FadeInDown.delay(150).duration(400)}
          >
            <Text style={styles.scoreBoxLabel}>TOPLAM SKOR</Text>
            <Text style={styles.scoreBoxValue}>{score}</Text>
          </Animated.View>

          <Animated.View
            style={styles.xpBox}
            entering={FadeInDown.delay(300).duration(400)}
          >
            <Text style={styles.xpText}>+{earnedXP} XP kazandın!</Text>
          </Animated.View>

          <Text style={styles.levelReached}>
            Ulaşılan Seviye: {levelIndex + 1} / {LEVELS.length}
          </Text>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => startGame(mod)}
          >
            <Text style={styles.btnPrimaryText}>YENİDEN OYNA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={modDegistir}>
            <Text style={styles.btnSecondaryText}>MOD DEĞİŞTİR</Text>
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

  // ─── GERİ SAYIM EKRANI (harfler gizli, kimse önden başlamasın) ──
  if (geriSayim.aktif) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#0a0a0c" }]}>
        <GeriSayim
          kalan={geriSayim.kalan!}
          renk="#c8ff3e"
          baslik={`SON SANİYE · ${mod === "dokunmali" ? "DOKUNMALI" : "YAZMALI"}`}
        />
        <TouchableOpacity style={styles.backButton} onPress={modDegistir}>
          <Text style={styles.backText}>Mod Değiştir</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const dokunmaliMod = mod === "dokunmali";
  const hedefUzunluk = targetWord.length;

  // ─── OYUN EKRANI ────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#0a0a0c" }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.dot} />
          <Text style={styles.brandText}>
            SON SANİYE · {dokunmaliMod ? "DOKUNMALI" : "YAZMALI"}
          </Text>
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

      {/* Karışık harfler */}
      <View style={styles.scramble}>
        {scrambled.map((ch, i) => {
          const yerlesti = dokunmaliMod && kullanilan.includes(i);
          const yesil = dogruIndex === i;
          const kirmizi = yanlisIndex === i;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.letterBox,
                yesil && styles.letterCorrect,
                kirmizi && styles.letterWrong,
                yerlesti && styles.letterUsed,
              ]}
              onPress={() => dokunmaliMod && harfeBas(i)}
              disabled={!dokunmaliMod || yerlesti}
              activeOpacity={dokunmaliMod ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.letterText,
                  yesil && styles.letterTextCorrect,
                  yerlesti && styles.letterTextUsed,
                ]}
              >
                {toUpperTR(ch)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {dokunmaliMod ? (
        /* Boşluklar — dolan harfler buraya yerleşir */
        <View style={styles.slotRow}>
          {Array.from({ length: hedefUzunluk }).map((_, i) => {
            const dolu = i < kullanilan.length;
            const harf = dolu ? scrambled[kullanilan[i]] : "";
            const siradaki = i === kullanilan.length;

            return (
              <View
                key={i}
                style={[
                  styles.slot,
                  dolu && styles.slotDolu,
                  siradaki && styles.slotSiradaki,
                ]}
              >
                <Text style={styles.slotText}>
                  {dolu ? toUpperTR(harf) : ""}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
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
      )}

      {/* Butonlar */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPass} onPress={passWord}>
          <Text style={styles.btnPassText}>PAS (-5)</Text>
        </TouchableOpacity>
        {!dokunmaliMod && (
          <TouchableOpacity style={styles.btnSubmit} onPress={submitWord}>
            <Text style={styles.btnSubmitText}>ONAYLA</Text>
          </TouchableOpacity>
        )}
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
      <TouchableOpacity style={styles.backButton} onPress={modDegistir}>
        <Text style={styles.backText}>Mod Değiştir</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },

  // Mod seçimi
  secimBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secimEmoji: { fontSize: 56, marginBottom: 12 },
  secimBaslik: {
    fontSize: 24,
    fontWeight: "900",
    color: "#c8ff3e",
    letterSpacing: 2,
    marginBottom: 4,
  },
  secimAlt: { fontSize: 14, color: "#7a7a85", marginBottom: 28 },
  modBtn: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
  },
  modDokunmali: { backgroundColor: "#1a2a0a", borderColor: "#c8ff3e" },
  modYazmali: { backgroundColor: "#111114", borderColor: "#26262d" },
  modBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#e7e7ea",
    letterSpacing: 2,
  },
  modBtnSub: { fontSize: 12, color: "#7a7a85", marginTop: 6 },

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
    fontSize: 11,
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

  // Karışık harfler
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
  letterCorrect: { backgroundColor: "#1a2a0a", borderColor: "#c8ff3e" },
  letterWrong: { backgroundColor: "#2a0a0f", borderColor: "#ff3b5c" },
  letterUsed: { backgroundColor: "#0a0a0c", borderColor: "#18181d" },
  letterText: { fontSize: 22, fontWeight: "700", color: "#e7e7ea" },
  letterTextCorrect: { color: "#c8ff3e" },
  letterTextUsed: { color: "#26262d" },

  // Boşluklar (dokunmalı mod)
  slotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
    minHeight: 56,
  },
  slot: {
    width: 44,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#26262d",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  slotDolu: {
    backgroundColor: "#1a2a0a",
    borderColor: "#c8ff3e",
    borderStyle: "solid",
  },
  slotSiradaki: { borderColor: "#7a7a85" },
  slotText: { fontSize: 22, fontWeight: "800", color: "#c8ff3e" },

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

  // Oyun sonu
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
  levelReached: { color: "#7a7a85", fontSize: 13, marginBottom: 20 },
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
    marginBottom: 10,
  },
  btnSecondaryText: { color: "#7a7a85", fontWeight: "700", fontSize: 14 },
});
