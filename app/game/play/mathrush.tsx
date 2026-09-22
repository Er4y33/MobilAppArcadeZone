import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import GeriSayim from "../../../components/GeriSayim";
import { Difficulty, useScores } from "../../../context/ScoreContext";
import { useSound } from "../../../context/SoundContext";
import {
  hapticError,
  hapticLight,
  hapticSuccess,
  hapticWarning,
} from "../../../lib/haptics";
import { useGeriSayim } from "../../../lib/useGeriSayim";

const TOPLAM_TUR = 10;

type Question = {
  metin: string;
  answer: number;
};

type Feedback = "none" | "correct" | "wrong" | "timeout";

// Etiketler locales/*.json'da: zorluk.<z> ve oyunAyar.mathrush.<z>
type ZorlukAyari = { sure: number };

const AYARLAR: Record<Difficulty, ZorlukAyari> = {
  kolay: { sure: 9 },
  orta: { sure: 7 },
  zor: { sure: 6 },
};

const rnd = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Fisher–Yates: şıkların yeri eşit olasılıklı
function karistir<T>(dizi: T[]): T[] {
  const a = [...dizi];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── SORU ÜRETİMİ ────────────────────────────────────────────────
function soruUret(zorluk: Difficulty, tur: number): Question {
  if (zorluk === "kolay") return kolaySoru(tur);
  if (zorluk === "orta") return ortaSoru(tur);
  return zorSoru(tur);
}

function kolaySoru(tur: number): Question {
  const max = tur >= 5 ? 30 : 15;
  const op = Math.random() < 0.5 ? "+" : "−";

  let a = rnd(1, max);
  let b = rnd(1, max);
  if (op === "−" && b > a) [a, b] = [b, a];

  return {
    metin: `${a} ${op} ${b} = ?`,
    answer: op === "+" ? a + b : a - b,
  };
}

function ortaSoru(tur: number): Question {
  // İlk 3 tur toplama/çıkarma, sonrası çarpma/bölme ağırlıklı
  const havuz = tur <= 3 ? ["+", "−"] : ["+", "−", "×", "÷", "×", "÷"];
  const op = havuz[Math.floor(Math.random() * havuz.length)];

  if (op === "×") {
    const a = rnd(2, 12);
    const b = rnd(2, 12);
    return { metin: `${a} × ${b} = ?`, answer: a * b };
  }

  if (op === "÷") {
    // Tam bölünme garantisi: önce bölen ve sonuç, sonra bölünen
    const bolen = rnd(2, 12);
    const sonuc = rnd(2, 12);
    return { metin: `${bolen * sonuc} ÷ ${bolen} = ?`, answer: sonuc };
  }

  let a = rnd(1, 50);
  let b = rnd(1, 50);
  if (op === "−" && b > a) [a, b] = [b, a];

  return {
    metin: `${a} ${op} ${b} = ?`,
    answer: op === "+" ? a + b : a - b,
  };
}

function zorSoru(tur: number): Question {
  const havuz =
    tur <= 2 ? ["×", "÷"] : ["+", "−", "×", "÷", "√", "²", "√", "²", "×", "÷"];
  const op = havuz[Math.floor(Math.random() * havuz.length)];

  if (op === "√") {
    // Sadece tam kare — 4'ten 400'e
    const kok = rnd(2, 20);
    return { metin: `√${kok * kok} = ?`, answer: kok };
  }

  if (op === "²") {
    const taban = rnd(4, 20);
    return { metin: `${taban}² = ?`, answer: taban * taban };
  }

  if (op === "×") {
    const a = rnd(3, 15);
    const b = rnd(3, 15);
    return { metin: `${a} × ${b} = ?`, answer: a * b };
  }

  if (op === "÷") {
    const bolen = rnd(3, 15);
    const sonuc = rnd(3, 15);
    return { metin: `${bolen * sonuc} ÷ ${bolen} = ?`, answer: sonuc };
  }

  let a = rnd(20, 99);
  let b = rnd(20, 99);
  if (op === "−" && b > a) [a, b] = [b, a];

  return {
    metin: `${a} ${op} ${b} = ?`,
    answer: op === "+" ? a + b : a - b,
  };
}

// Şıkları üret — cevabın büyüklüğüne göre yayılım ayarlanır
function siklarUret(answer: number): number[] {
  const secenekler = new Set<number>([answer]);
  const yayilim = answer > 100 ? 25 : answer > 30 ? 12 : 4;
  let guard = 0;

  while (secenekler.size < 4 && guard < 120) {
    guard++;
    const fark = rnd(-yayilim, yayilim);
    const aday = answer + fark;
    if (aday >= 0 && aday !== answer) secenekler.add(aday);
  }

  // Yayılım yetmezse (küçük cevaplarda olur) doldur
  let ek = 1;
  while (secenekler.size < 4) {
    secenekler.add(answer + yayilim + ek);
    ek++;
  }

  return karistir(Array.from(secenekler));
}

export default function MathRushScreen() {
  const [zorluk, setZorluk] = useState<Difficulty | null>(null);
  const [round, setRound] = useState(1);
  const [question, setQuestion] = useState<Question>({ metin: "", answer: 0 });
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(9);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [gameOver, setGameOver] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);

  // Async timer'ların gecikmeli çalışması yüzünden state yerine ref'ten okuyoruz
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const zorlukRef = useRef<Difficulty>("orta");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addScore } = useScores();
  const { cal } = useSound();
  const { t } = useTranslation();
  const ayar = zorluk ? AYARLAR[zorluk] : null;
  const zorlukAdi = zorluk ? t(`zorluk.${zorluk}`) : "";

  // 3-2-1 bitince ilk soru gelir ve süre akmaya başlar
  const geriSayim = useGeriSayim(
    () => turBaslat(soruUret(zorlukRef.current, 1), zorlukRef.current),
    () => cal("tick"),
  );

  const zamanlayicilariTemizle = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    intervalRef.current = null;
    advanceTimeoutRef.current = null;
  };

  // Ekrandan çıkılırsa (geri tuşu vb.) oyun arkada devam edip skor kaydetmesin

  useEffect(() => zamanlayicilariTemizle, []);

  // Son 3 saniye uyarısı
  useEffect(() => {
    if (gameOver || !zorluk || feedback !== "none" || geriSayim.aktif) return;
    if (timeLeft <= 3 && timeLeft > 0) cal("tick");
  }, [timeLeft, gameOver, zorluk, feedback, geriSayim.aktif, cal]);

  // Süre dolunca — state güncelleyicisinin DIŞINDA tetiklenir
  useEffect(() => {
    if (timeLeft !== 0 || feedback !== "none" || gameOver || !zorluk) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    sureDoldu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const turBaslat = (q: Question, z: Difficulty) => {
    setQuestion(q);
    setOptions(siklarUret(q.answer));
    setFeedback("none");
    setTimeLeft(AYARLAR[z].sure);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);
  };

  const oyunBaslat = (z: Difficulty) => {
    zamanlayicilariTemizle();

    zorlukRef.current = z;
    roundRef.current = 1;
    scoreRef.current = 0;
    correctRef.current = 0;

    setZorluk(z);
    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setGameOver(false);
    setEarnedXP(0);
    setFeedback("none");
    setQuestion({ metin: "", answer: 0 });
    setOptions([]);
    setTimeLeft(AYARLAR[z].sure);
    geriSayim.baslat();
  };

  const sonrakiTur = () => {
    if (roundRef.current >= TOPLAM_TUR) {
      oyunuBitir();
      return;
    }
    roundRef.current += 1;
    setRound(roundRef.current);
    turBaslat(soruUret(zorlukRef.current, roundRef.current), zorlukRef.current);
  };

  const sureDoldu = () => {
    hapticWarning();
    cal("wrong");
    setFeedback("timeout");
    advanceTimeoutRef.current = setTimeout(sonrakiTur, 900);
  };

  const cevapla = (value: number, q: Question, kalanSure: number) => {
    if (feedback !== "none") return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (value === q.answer) {
      hapticSuccess();
      cal("correct");
      setFeedback("correct");
      scoreRef.current += 10 + kalanSure; // hız bonusu
      correctRef.current += 1;
      setScore(scoreRef.current);
      setCorrectCount(correctRef.current);
    } else {
      hapticError();
      cal("wrong");
      setFeedback("wrong");
    }
    advanceTimeoutRef.current = setTimeout(sonrakiTur, 900);
  };

  const oyunuBitir = async () => {
    setGameOver(true);
    cal("win");
    const reward = await addScore({
      game: "mathrush",
      score: scoreRef.current,
      label: "points",
      difficulty: zorlukRef.current,
    });
    setEarnedXP(reward?.xpEarned ?? 0);
  };

  const yenidenOyna = () => {
    hapticLight();
    if (zorluk) oyunBaslat(zorluk);
  };

  const zorluguDegistir = () => {
    geriSayim.iptal();
    zamanlayicilariTemizle();
    setZorluk(null);
    setGameOver(false);
  };

  // ── ZORLUK SEÇİM EKRANI ────────────────────────────────────────
  if (!zorluk) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.secimBox}>
          <Text style={styles.secimEmoji}>🔢</Text>
          <Text style={styles.secimBaslik}>
            {t("skorTablosu.sekme.mathrush")}
          </Text>
          <Text style={styles.secimAlt}>{t("zorluk.sec")}</Text>

          {(["kolay", "orta", "zor"] as Difficulty[]).map((z, i) => (
            <Animated.View
              key={z}
              style={{ width: "100%" }}
              entering={FadeInDown.delay(i * 80).duration(350)}
            >
              <TouchableOpacity
                style={[styles.zorlukBtn, styles[`zorluk_${z}`]]}
                onPress={() => oyunBaslat(z)}
                activeOpacity={0.85}
              >
                <Text style={styles.zorlukBtnText}>{t(`zorluk.${z}`)}</Text>
                <Text style={styles.zorlukBtnSub}>
                  {t(`oyunAyar.mathrush.${z}`)} · {AYARLAR[z].sure}{" "}
                  {t("ortak.saniyeKisa")}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>{t("ortak.geriDon")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── OYUN SONU EKRANI ──────────────────────────────────────────
  if (gameOver) {
    const stars = correctCount >= 9 ? 3 : correctCount >= 6 ? 2 : 1;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBox}>
          <Animated.Text
            style={styles.resultEmoji}
            entering={ZoomIn.duration(400)}
          >
            {stars === 3 ? "🏆" : stars === 2 ? "⭐" : "✅"}
          </Animated.Text>

          <Text style={styles.resultTitle}>
            {stars === 3 ? t("oyun.mukemmel") : t("oyun.bolumTamam")}
          </Text>
          <Text style={styles.resultSub}>
            {t("oyunlar.mathrush.ad")} · {zorlukAdi}
          </Text>

          <Animated.View
            style={styles.starsRow}
            entering={ZoomIn.delay(150).duration(400)}
          >
            {[1, 2, 3].map((s) => (
              <Text
                key={s}
                style={[styles.star, s <= stars && styles.starActive]}
              >
                ★
              </Text>
            ))}
          </Animated.View>

          <View style={styles.statsBox}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t("oyun.toplamPuan")}</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t("oyun.dogruCevap")}</Text>
              <Text style={styles.statValue}>
                {correctCount} / {TOPLAM_TUR}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t("ortak.zorluk")}</Text>
              <Text style={styles.statValue}>{zorlukAdi}</Text>
            </View>
          </View>

          <Animated.View
            style={styles.xpBox}
            entering={FadeInDown.delay(300).duration(400)}
          >
            <Text style={styles.xpText}>
              {t("oyun.xpKazandin", { xp: earnedXP })}
            </Text>
          </Animated.View>

          <TouchableOpacity style={styles.btnPrimary} onPress={yenidenOyna}>
            <Text style={styles.btnPrimaryText}>
              {t("ortak.yenidenOynaBuyuk")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={zorluguDegistir}
          >
            <Text style={styles.btnSecondaryText}>
              {t("ortak.zorlukDegistirBuyuk")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.btnSecondaryText}>
              {t("ortak.anaMenuBuyuk")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── GERİ SAYIM EKRANI ─────────────────────────────────────────
  if (geriSayim.aktif) {
    return (
      <SafeAreaView style={styles.container}>
        <GeriSayim
          kalan={geriSayim.kalan!}
          renk="#06B6D4"
          baslik={`${t("skorTablosu.sekme.mathrush")} · ${zorlukAdi}`}
        />
        <TouchableOpacity style={styles.backButton} onPress={zorluguDegistir}>
          <Text style={styles.backText}>{t("ortak.zorlukDegistir")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── OYUN EKRANI ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>{t("oyun.puan")}</Text>
          <Text style={styles.headerValue}>{score}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.gameTitle}>
            {t("skorTablosu.sekme.mathrush")}
          </Text>
          <Text style={styles.gameSub}>{zorlukAdi}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>{t("oyun.tur")}</Text>
          <Text style={[styles.headerValue, { color: "#06B6D4" }]}>
            {round}/{TOPLAM_TUR}
          </Text>
        </View>
      </View>

      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${(timeLeft / ayar!.sure) * 100}%` },
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
        <Text style={styles.questionText}>{question.metin}</Text>
        {feedback === "timeout" && (
          <Text style={styles.feedbackText}>{t("oyun.sureDoldu")}</Text>
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
            onPress={() => cevapla(opt, question, timeLeft)}
            disabled={feedback !== "none"}
            activeOpacity={0.85}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={zorluguDegistir}>
        <Text style={styles.backText}>{t("ortak.zorlukDegistir")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020", padding: 16 },

  // Zorluk seçimi
  secimBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  secimEmoji: { fontSize: 56, marginBottom: 12 },
  secimBaslik: {
    fontSize: 22,
    fontWeight: "900",
    color: "#06B6D4",
    letterSpacing: 1,
    marginBottom: 4,
  },
  secimAlt: { fontSize: 14, color: "#9CA3AF", marginBottom: 28 },
  zorlukBtn: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
  },
  zorluk_kolay: { backgroundColor: "#064E3B", borderColor: "#22C55E" },
  zorluk_orta: { backgroundColor: "#172554", borderColor: "#3B82F6" },
  zorluk_zor: { backgroundColor: "#450A0A", borderColor: "#EF4444" },
  zorlukBtnText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  zorlukBtnSub: { fontSize: 12, color: "#D1D5DB", marginTop: 4 },

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
    color: "#06B6D4",
    letterSpacing: 1,
  },
  gameSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginTop: 2,
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
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#1F2B47",
  },
  questionCorrect: { backgroundColor: "#064E3B", borderColor: "#22C55E" },
  questionWrong: { backgroundColor: "#450A0A", borderColor: "#EF4444" },
  questionTimeout: { backgroundColor: "#451A03", borderColor: "#F59E0B" },
  questionText: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
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

  // Oyun sonu
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
    marginBottom: 10,
  },
  btnSecondaryText: { color: "#9CA3AF", fontWeight: "700" },
});
