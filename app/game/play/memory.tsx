import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Difficulty, useScores } from "../../../context/ScoreContext";
import { useSound } from "../../../context/SoundContext";
import { hapticError, hapticLight, hapticSuccess } from "../../../lib/haptics";
type CardType = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

export type Tema = "meyve" | "hayvan" | "nesne" | "renk";

// Tema adları locales/*.json'da: tema.<id>
type TemaAyari = {
  ikon: string;
  ogeler: string[]; // renk temasında hex kodları, diğerlerinde emoji
};

const TEMALAR: Record<Tema, TemaAyari> = {
  meyve: {
    ikon: "🍎",
    ogeler: [
      "🍎",
      "🍌",
      "🍇",
      "🍉",
      "🍓",
      "🍒",
      "🍑",
      "🍍",
      "🥝",
      "🥥",
      "🍊",
      "🍋",
    ],
  },
  hayvan: {
    ikon: "🦊",
    ogeler: [
      "🦊",
      "🐼",
      "🦁",
      "🐸",
      "🐧",
      "🦉",
      "🐢",
      "🦋",
      "🐙",
      "🦄",
      "🐝",
      "🐬",
    ],
  },
  nesne: {
    ikon: "⚽",
    ogeler: [
      "⚽",
      "🎸",
      "📷",
      "🚀",
      "⏰",
      "🔑",
      "💡",
      "🎈",
      "🎁",
      "🧩",
      "🔔",
      "☂️",
    ],
  },
  renk: {
    ikon: "🎨",
    ogeler: [
      "#EF4444", // kırmızı
      "#F97316", // turuncu
      "#FBBF24", // sarı
      "#84CC16", // fıstık yeşili
      "#15803D", // koyu yeşil
      "#06B6D4", // camgöbeği
      "#1D4ED8", // koyu mavi
      "#7C3AED", // mor
      "#EC4899", // pembe
      "#78350F", // kahve
      "#F5F5F5", // beyaz
      "#64748B", // gri
    ],
  },
};

// Her zorluğun ızgara yapısı
type ZorlukAyari = {
  ciftSayisi: number;
  sutun: number;
  satir: number;
};

const AYARLAR: Record<Difficulty, ZorlukAyari> = {
  kolay: { ciftSayisi: 6, sutun: 3, satir: 4 },
  orta: { ciftSayisi: 8, sutun: 4, satir: 4 },
  zor: { ciftSayisi: 12, sutun: 4, satir: 6 },
};

const BOSLUK = 10;
const MAX_KART = 120; // kolayda kartlar devasa olmasın
const { width: EKRAN_G, height: EKRAN_Y } = Dimensions.get("window");

// Kart boyutunu hem genişliğe hem yüksekliğe göre hesapla
function kartBoyutu(sutun: number, satir: number): number {
  // Genişlik: container padding (32) + sütunlar arası boşluklar
  const genislikten = (EKRAN_G - 32 - BOSLUK * (sutun - 1)) / sutun;

  // Yükseklik: ekranın ~%58'i ızgaraya ayrılıyor
  const gridAlani = EKRAN_Y * 0.54;
  const yukseklikten = (gridAlani - BOSLUK * (satir - 1)) / satir;

  return Math.floor(Math.min(genislikten, yukseklikten, MAX_KART));
}

function karistir<T>(dizi: T[]): T[] {
  const a = [...dizi];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function kartlariOlustur(ciftSayisi: number, tema: Tema): CardType[] {
  const secilen = TEMALAR[tema].ogeler.slice(0, ciftSayisi);
  const karisik = karistir([...secilen, ...secilen]);
  return karisik.map((value, index) => ({
    id: index,
    value,
    flipped: true, // önizleme için açık başlar
    matched: false,
  }));
}

export default function MemoryMatchScreen() {
  const [zorluk, setZorluk] = useState<Difficulty | null>(null);
  const [tema, setTema] = useState<Tema>("meyve");
  const [cards, setCards] = useState<CardType[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [earnedXP, setEarnedXP] = useState(0);
  const [tur, setTur] = useState(0); // her yeni oyunda artar, effect'i zorla yeniler
  const eslesmemeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addScore } = useScores();
  const { cal } = useSound();
  const { t } = useTranslation();
  const ayar = zorluk ? AYARLAR[zorluk] : null;
  const zorlukAdi = zorluk ? t(`zorluk.${zorluk}`) : "";

  const zamanlayicilariTemizle = () => {
    if (eslesmemeTimer.current) {
      clearTimeout(eslesmemeTimer.current);
      eslesmemeTimer.current = null;
    }
  };

  const oyunBaslat = useCallback(
    (z: Difficulty) => {
      zamanlayicilariTemizle();
      setZorluk(z);
      setCards(kartlariOlustur(AYARLAR[z].ciftSayisi, tema));
      setSelected([]);
      setMoves(0);
      setGameWon(false);
      setEarnedXP(0);
      setCountdown(3);
      setPreviewing(true);
      setTur((t) => t + 1);
    },
    [tema],
  );

  const yenidenOyna = () => {
    if (zorluk) oyunBaslat(zorluk);
  };

  const zorlukDegistir = () => {
    zamanlayicilariTemizle();
    setPreviewing(false);
    setSelected([]);
    setCards([]);
    setZorluk(null);
  };

  // Önizleme geri sayımı — her saniye tek adım, tur değişince sıfırdan başlar
  useEffect(() => {
    if (!previewing) return;

    if (countdown === 0) {
      setCards((prev) => prev.map((c) => ({ ...c, flipped: false })));
      setPreviewing(false);
      return;
    }

    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [previewing, countdown, tur]);

  // Seçilen iki kartı karşılaştır
  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    const ca = cards.find((c) => c.id === a);
    const cb = cards.find((c) => c.id === b);
    if (!ca || !cb) return;

    setMoves((m) => m + 1);

    if (ca.value === cb.value) {
      hapticSuccess();
      cal("correct");
      setCards((prev) =>
        prev.map((c) =>
          c.id === a || c.id === b ? { ...c, matched: true } : c,
        ),
      );
      setSelected([]);
    } else {
      hapticError();
      cal("wrong");
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

  // Oyun bitti mi?
  useEffect(() => {
    if (!ayar || !zorluk) return;
    if (cards.length === 0 || gameWon) return;
    if (!cards.every((c) => c.matched)) return;

    setGameWon(true);
    cal("win");
    addScore({
      game: "memory",
      score: moves,
      label: "moves",
      difficulty: zorluk,
    });

    // Eşikler çift sayısına oranlı: mükemmel oyun = ciftSayisi hamle
    const oran = moves / ayar.ciftSayisi;
    const xp =
      oran <= 1.3
        ? 100
        : oran <= 1.6
          ? 75
          : oran <= 2.0
            ? 55
            : oran <= 2.6
              ? 35
              : 20;
    setEarnedXP(xp);
  }, [cards, gameWon, moves, ayar, zorluk]);

  const handleCardPress = (id: number) => {
    if (previewing) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched || selected.length === 2) return;
    hapticLight();
    cal("click");
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
    );
    setSelected((prev) => [...prev, id]);
  };

  // ── ZORLUK SEÇİM EKRANI ────────────────────────────────────────
  if (!zorluk) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.secimBox}>
          <Text style={styles.secimEmoji}>🧠</Text>
          <Text style={styles.secimBaslik}>
            {t("skorTablosu.sekme.memory")}
          </Text>
          <Text style={styles.secimAlt}>{t("tema.baslik")}</Text>

          <View style={styles.temaSatiri}>
            {(Object.keys(TEMALAR) as Tema[]).map((temaId) => (
              <TouchableOpacity
                key={temaId}
                style={[styles.temaCip, tema === temaId && styles.temaCipAktif]}
                onPress={() => setTema(temaId)}
                activeOpacity={0.85}
              >
                <Text style={styles.temaIkon}>{TEMALAR[temaId].ikon}</Text>
                <Text
                  style={[
                    styles.temaMetin,
                    tema === temaId && styles.temaMetinAktif,
                  ]}
                >
                  {t(`tema.${temaId}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
                  {t(`oyunAyar.memory.${z}`)}
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

  const toplamCift = ayar!.ciftSayisi;
  const matched = cards.filter((c) => c.matched).length / 2;
  const boyut = kartBoyutu(ayar!.sutun, ayar!.satir);

  // ── OYUN SONU EKRANI ──────────────────────────────────────────
  if (gameWon) {
    const oran = moves / toplamCift;
    const stars = oran <= 1.3 ? 3 : oran <= 1.8 ? 2 : 1;

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
            {t("oyunlar.memory.ad")} · {zorlukAdi}
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
              <Text style={styles.statLabel}>{t("oyun.kullanilanHamle")}</Text>
              <Text style={styles.statValue}>{moves}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t("oyun.eslestirilenCift")}</Text>
              <Text style={styles.statValue}>
                {toplamCift} / {toplamCift}
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
            onPress={zorlukDegistir}
          >
            <Text style={styles.btnSecondaryText}>
              {t("ortak.zorlukDegistirBuyuk")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace("/(drawer)/(tabs)")}
          >
            <Text style={styles.btnSecondaryText}>
              {t("ortak.anaMenuBuyuk")}
            </Text>
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
          <Text style={styles.headerLabel}>{t("oyun.hamle")}</Text>
          <Text style={styles.headerValue}>{moves}</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.gameTitle}>{t("skorTablosu.sekme.memory")}</Text>
          <Text style={styles.gameSub}>{zorlukAdi}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLabel}>{t("oyun.eslesme")}</Text>
          <Text style={[styles.headerValue, { color: "#EC4899" }]}>
            {matched}/{toplamCift}
          </Text>
        </View>
      </View>

      <View style={styles.progressBg}>
        <View
          style={[
            styles.progressFill,
            { width: `${(matched / toplamCift) * 100}%` },
          ]}
        />
      </View>

      {previewing && (
        <Text style={styles.previewText}>
          {previewing && countdown > 0
            ? t("oyun.kartlariEzberle", { sayi: countdown })
            : " "}
        </Text>
      )}

      {/* Izgara — sabit genişlik, sütun sayısı garanti */}
      <View
        style={[
          styles.grid,
          {
            width: ayar!.sutun * boyut + (ayar!.sutun - 1) * BOSLUK,
            gap: BOSLUK,
          },
        ]}
      >
        {cards.map((card) => {
          const acik = card.flipped || card.matched;
          const renkModu = tema === "renk";

          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                { width: boyut, height: boyut },
                acik && !card.matched && styles.cardFlipped,
                card.matched && styles.cardMatched,
                renkModu &&
                  acik && {
                    backgroundColor: card.value,
                    borderColor: card.matched ? "#22C55E" : "#FFFFFF",
                  },
              ]}
              onPress={() => handleCardPress(card.id)}
              activeOpacity={0.85}
            >
              {!renkModu && (
                <Text style={[styles.cardText, { fontSize: boyut * 0.5 }]}>
                  {acik ? card.value : ""}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={zorlukDegistir}>
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
    color: "#EC4899",
    letterSpacing: 1,
    marginBottom: 4,
  },
  secimAlt: { fontSize: 14, color: "#9CA3AF", marginBottom: 12 },
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
  temaSatiri: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  temaCip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#151B2E",
    borderWidth: 2,
    borderColor: "#1F2B47",
    alignItems: "center",
    minWidth: 72,
  },
  temaCipAktif: { borderColor: "#EC4899", backgroundColor: "#1E1B4B" },
  temaIkon: { fontSize: 22, marginBottom: 2 },
  temaMetin: { fontSize: 11, fontWeight: "700", color: "#9CA3AF" },
  temaMetinAktif: { color: "#FFFFFF" },
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
  gameSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  previewText: {
    textAlign: "center",
    color: "#FBBF24",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    height: 22,
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
    justifyContent: "center",
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#151B2E",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1F2B47",
  },
  cardFlipped: { backgroundColor: "#1E1B4B", borderColor: "#EC4899" },
  cardMatched: { backgroundColor: "#064E3B", borderColor: "#22C55E" },
  cardText: { fontWeight: "800" },

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
    marginBottom: 10,
  },
  btnSecondaryText: { color: "#9CA3AF", fontWeight: "700" },
});
