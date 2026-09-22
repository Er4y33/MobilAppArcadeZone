import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import GeriSayim from "../../../components/GeriSayim";
import { Difficulty, useScores } from "../../../context/ScoreContext";
import { useSound } from "../../../context/SoundContext";
import { hapticError, hapticLight, hapticSuccess } from "../../../lib/haptics";
import { useGeriSayim } from "../../../lib/useGeriSayim";

const { width: EKRAN_G, height: EKRAN_Y } = Dimensions.get("window");
const BOSLUK = 14;
const MAX_BUTON = 150;

// 9 renklik havuz — zorluk kaç tanesini kullanacağını belirler
const RENKLER = [
  { id: 0, base: "#450A0A", active: "#ff0000" }, // kırmızı
  { id: 1, base: "#052E1B", active: "#22C55E" }, // yeşil
  { id: 2, base: "#172554", active: "#3B82F6" }, // mavi
  { id: 3, base: "#afa715", active: "#fff200" }, // sarı
  { id: 4, base: "#3B0764", active: "#A855F7" }, // mor
  { id: 5, base: "#842910", active: "#F97316" }, // turuncu
  { id: 6, base: "#083344", active: "#06B6D4" }, // camgöbeği
  { id: 7, base: "#500724", active: "#EC4899" }, // pembe
  { id: 8, base: "#477b11", active: "#84CC16" }, // fıstık yeşili
];

type ZorlukAyari = {
  renkSayisi: number;
  sutun: number;
  satir: number;
  gosterSure: number;
  etiket: string;
  aciklama: string;
};

const AYARLAR: Record<Difficulty, ZorlukAyari> = {
  kolay: {
    renkSayisi: 4,
    sutun: 2,
    satir: 2,
    gosterSure: 600,
    etiket: "KOLAY",
    aciklama: "4 renk · 2x2",
  },
  orta: {
    renkSayisi: 6,
    sutun: 2,
    satir: 3,
    gosterSure: 550,
    etiket: "ORTA",
    aciklama: "6 renk · 2x3",
  },
  zor: {
    renkSayisi: 9,
    sutun: 3,
    satir: 3,
    gosterSure: 480,
    etiket: "ZOR",
    aciklama: "9 renk · 3x3",
  },
};

const ARA_SURE = 250;
const BASLANGIC_BEKLEME = 500; // 3-2-1'den sonra ilk renk hemen yanmasın

function butonBoyutu(sutun: number, satir: number): number {
  const genislikten = (EKRAN_G - 32 - BOSLUK * (sutun - 1)) / sutun;
  const gridAlani = EKRAN_Y * 0.5;
  const yukseklikten = (gridAlani - BOSLUK * (satir - 1)) / satir;
  return Math.floor(Math.min(genislikten, yukseklikten, MAX_BUTON));
}

export default function PatternSequenceScreen() {
  const [zorluk, setZorluk] = useState<Difficulty | null>(null);
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
  const { cal } = useSound();
  const ayar = zorluk ? AYARLAR[zorluk] : null;

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clearAllTimeouts, [clearAllTimeouts]);

  const rastgeleRenk = useCallback((renkSayisi: number) => {
    return Math.floor(Math.random() * renkSayisi);
  }, []);

  const playSequence = useCallback(
    (a: ZorlukAyari, ilkTur: boolean) => {
      setIsShowingSequence(true);
      playerStepRef.current = 0;
      const seq = sequenceRef.current;
      const basla = ilkTur ? BASLANGIC_BEKLEME : 0;

      seq.forEach((renkIndex, i) => {
        const showAt = basla + i * (a.gosterSure + ARA_SURE);
        const hideAt = showAt + a.gosterSure;

        timeoutsRef.current.push(
          setTimeout(() => {
            setActiveIndex(renkIndex);
            cal("tick");
          }, showAt),
        );
        timeoutsRef.current.push(
          setTimeout(() => setActiveIndex(null), hideAt),
        );
      });

      const toplam = basla + seq.length * (a.gosterSure + ARA_SURE);
      timeoutsRef.current.push(
        setTimeout(() => setIsShowingSequence(false), toplam),
      );
    },
    [cal],
  );

  // 3-2-1 bitince dizi oynatılmaya başlar
  const geriSayim = useGeriSayim(
    () => {
      if (ayar) playSequence(ayar, true);
    },
    () => cal("tick"),
  );
  const baslatGeriSayim = geriSayim.baslat;

  const oyunBaslat = useCallback(
    (z: Difficulty) => {
      clearAllTimeouts();
      const a = AYARLAR[z];
      setZorluk(z);
      sequenceRef.current = [rastgeleRenk(a.renkSayisi)];
      playerStepRef.current = 0;
      setLevel(1);
      setActiveIndex(null);
      setIsShowingSequence(true);
      setGameOver(false);
      setEarnedXP(0);
      setFinalScore(0);
      baslatGeriSayim();
    },
    [clearAllTimeouts, rastgeleRenk, baslatGeriSayim],
  );

  const yenidenOyna = () => {
    if (zorluk) oyunBaslat(zorluk);
  };

  const zorluguDegistir = () => {
    geriSayim.iptal();
    clearAllTimeouts();
    setZorluk(null);
    setGameOver(false);
    setActiveIndex(null);
  };

  const handlePress = (renkIndex: number) => {
    if (isShowingSequence || gameOver || !ayar || !zorluk) return;

    hapticLight();
    cal("click");
    const beklenen = sequenceRef.current[playerStepRef.current];

    if (renkIndex !== beklenen) {
      hapticError();
      cal("wrong");
      const score = sequenceRef.current.length - 1;
      setFinalScore(score);
      setGameOver(true);
      addScore({
        game: "pattern",
        score,
        label: "points",
        difficulty: zorluk,
      }).then((reward) => setEarnedXP(reward?.xpEarned ?? 0));
      return;
    }

    playerStepRef.current += 1;

    if (playerStepRef.current === sequenceRef.current.length) {
      hapticSuccess();
      cal("correct");
      // Yeni dizi başlayana kadar (700 ms) dokunuşları hemen kilitle
      setIsShowingSequence(true);
      sequenceRef.current = [
        ...sequenceRef.current,
        rastgeleRenk(ayar.renkSayisi),
      ];
      setLevel(sequenceRef.current.length);
      timeoutsRef.current.push(
        setTimeout(() => playSequence(ayar, false), 700),
      );
    }
  };

  // ── ZORLUK SEÇİM EKRANI ────────────────────────────────────────
  if (!zorluk) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.secimBox}>
          <Text style={styles.secimEmoji}>🎯</Text>
          <Text style={styles.secimBaslik}>SIRAYI TAKİP ET</Text>
          <Text style={styles.secimAlt}>Zorluk seç</Text>

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
                <Text style={styles.zorlukBtnText}>{AYARLAR[z].etiket}</Text>
                <Text style={styles.zorlukBtnSub}>{AYARLAR[z].aciklama}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}

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

  const boyut = butonBoyutu(ayar!.sutun, ayar!.satir);
  const aktifRenkler = RENKLER.slice(0, ayar!.renkSayisi);

  // ── OYUN SONU EKRANI ──────────────────────────────────────────
  if (gameOver) {
    // Eşikler zorluğa göre: 9 renkte 5 tur, 4 renkte 5 turdan zordur
    const esik3 = zorluk === "kolay" ? 9 : zorluk === "orta" ? 7 : 5;
    const esik2 = zorluk === "kolay" ? 5 : zorluk === "orta" ? 4 : 3;
    const stars = finalScore >= esik3 ? 3 : finalScore >= esik2 ? 2 : 1;

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
            {stars === 3 ? "MÜKEMMEL!" : "BÖLÜM TAMAM!"}
          </Text>
          <Text style={styles.resultSub}>Sırayı Takip Et · {ayar!.etiket}</Text>

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
              <Text style={styles.statLabel}>Ulaşılan Seviye</Text>
              <Text style={styles.statValue}>{finalScore + 1}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Tamamlanan Tur</Text>
              <Text style={styles.statValue}>{finalScore}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Zorluk</Text>
              <Text style={styles.statValue}>{ayar!.etiket}</Text>
            </View>
          </View>

          <Animated.View
            style={styles.xpBox}
            entering={FadeInDown.delay(300).duration(400)}
          >
            <Text style={styles.xpText}>+{earnedXP} XP kazandın!</Text>
          </Animated.View>

          <TouchableOpacity style={styles.btnPrimary} onPress={yenidenOyna}>
            <Text style={styles.btnPrimaryText}>YENİDEN OYNA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={zorluguDegistir}
          >
            <Text style={styles.btnSecondaryText}>ZORLUK DEĞİŞTİR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.replace("/(drawer)/(tabs)")}
          >
            <Text style={styles.btnSecondaryText}>ANA MENÜ</Text>
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
          renk="#FBBF24"
          baslik={`SIRAYI TAKİP ET · ${ayar!.etiket}`}
        />
        <TouchableOpacity style={styles.backButton} onPress={zorluguDegistir}>
          <Text style={styles.backText}>Zorluk Değiştir</Text>
        </TouchableOpacity>
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
          <Text style={styles.gameSub}>{ayar!.etiket}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.statusBox}>
        <Text
          style={[styles.statusText, !isShowingSequence && styles.statusSira]}
        >
          {isShowingSequence ? "İzle..." : "Şimdi sen tekrarla!"}
        </Text>
      </View>

      <View
        style={[
          styles.grid,
          {
            width: ayar!.sutun * boyut + (ayar!.sutun - 1) * BOSLUK,
            gap: BOSLUK,
          },
        ]}
      >
        {aktifRenkler.map((c) => (
          <ColorButton
            key={c.id}
            color={c}
            boyut={boyut}
            isActive={activeIndex === c.id}
            onPress={() => handlePress(c.id)}
            disabled={isShowingSequence}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.backButton} onPress={zorluguDegistir}>
        <Text style={styles.backText}>Zorluk Değiştir</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function ColorButton({
  color,
  boyut,
  isActive,
  onPress,
  disabled,
}: {
  color: { id: number; base: string; active: string };
  boyut: number;
  isActive: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[
          styles.colorBtn,
          {
            width: boyut,
            height: boyut,
            borderRadius: boyut / 2,
            backgroundColor: isActive ? color.active : color.base,
            borderColor: isActive ? "#FFFFFF" : color.active,
          },
        ]}
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
        onPress={onPress}
        activeOpacity={0.85}
        disabled={disabled}
      />
    </Animated.View>
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
    color: "#FBBF24",
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
  gameSub: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginTop: 2,
  },

  statusBox: { alignItems: "center", marginBottom: 20, height: 24 },
  statusText: { fontSize: 16, fontWeight: "700", color: "#9CA3AF" },
  statusSira: { color: "#22C55E" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignSelf: "center",
  },
  colorBtn: { borderWidth: 3 },

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
    marginBottom: 10,
  },
  btnSecondaryText: { color: "#9CA3AF", fontWeight: "700" },
});
