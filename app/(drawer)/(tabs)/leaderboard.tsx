import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";
import { supabase } from "../../../lib/supabase";

type GameKey = "reaction" | "memory" | "sonsaniye" | "mathrush" | "pattern";
type Difficulty = "kolay" | "orta" | "zor";

type LeaderboardEntry = {
  game_id: string;
  difficulty: Difficulty;
  game_name: string;
  score_label: string;
  player_id: string;
  username: string;
  avatar_url: string | null;
  best_score: number;
  total_plays: number;
};

// Etiketler locales/*.json'dan: skorTablosu.sekme.<id>
const GAMES: GameKey[] = [
  "reaction",
  "memory",
  "sonsaniye",
  "mathrush",
  "pattern",
];

const LOWER_IS_BETTER: Record<GameKey, boolean> = {
  reaction: true,
  memory: true,
  sonsaniye: false,
  mathrush: false,
  pattern: false,
};

// Skor birimi — veritabanındaki score_label yerine dil dosyasından
const BIRIM: Record<GameKey, string> = {
  reaction: "ms",
  memory: "hamle",
  sonsaniye: "puan",
  mathrush: "puan",
  pattern: "seviye",
};

// Zorluk seçimi olan oyunlar
const ZORLUKLU: Record<GameKey, boolean> = {
  reaction: false,
  memory: true,
  sonsaniye: true,
  mathrush: true,
  pattern: true,
};

// Oyun değişince açılacak varsayılan zorluk
const VARSAYILAN_ZORLUK: Record<GameKey, Difficulty> = {
  reaction: "orta",
  memory: "orta",
  sonsaniye: "orta",
  mathrush: "orta",
  pattern: "kolay",
};

type ZorlukSecenek = { key: Difficulty; anahtar: string };

const VARSAYILAN_SECENEKLER: ZorlukSecenek[] = [
  { key: "kolay", anahtar: "zorluk.kolay" },
  { key: "orta", anahtar: "zorluk.orta" },
  { key: "zor", anahtar: "zorluk.zor" },
];

// Son Saniye'de zorluk yerine mod var — etiketler farklı, "zor" seçeneği yok
const ZORLUK_SECENEKLERI: Partial<Record<GameKey, ZorlukSecenek[]>> = {
  sonsaniye: [
    { key: "kolay", anahtar: "zorluk.dokunmali" },
    { key: "orta", anahtar: "zorluk.yazmali" },
  ],
};

/**
 * Gizlilik: veritabanındaki username alanı boş kalmışsa e-postaya düşebiliyor.
 * Başka oyuncuların e-postası hiçbir koşulda ekrana gelmemeli.
 */
function gosterilenAd(satir: LeaderboardEntry): string {
  const ad = satir.username?.trim();
  if (ad && !ad.includes("@")) return ad;
  return `Oyuncu${satir.player_id.slice(0, 4).toUpperCase()}`;
}

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState<GameKey>("reaction");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("orta");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Oyun değiştir + zorluğu o oyunun varsayılanına çek
  const oyunSec = useCallback((key: GameKey) => {
    setSelectedGame(key);
    setSelectedDifficulty(VARSAYILAN_ZORLUK[key]);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const ascending = LOWER_IS_BETTER[selectedGame];
    const zorluk = ZORLUKLU[selectedGame] ? selectedDifficulty : "orta";

    const { data, error } = await supabase
      .from("leaderboard_view")
      .select("*")
      .eq("game_id", selectedGame)
      .eq("difficulty", zorluk)
      .order("best_score", { ascending })
      .limit(20);

    if (error) {
      console.error("Liderlik tablosu çekilemedi:", error.message);
      setEntries([]);
    } else {
      setEntries((data as LeaderboardEntry[]) ?? []);
    }
    setLoading(false);
    setRefreshing(false);
  }, [selectedGame, selectedDifficulty]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const sekmeDegistir = (yon: 1 | -1) => {
    const i = GAMES.indexOf(selectedGame);
    const yeni = i + yon;
    if (yeni < 0 || yeni >= GAMES.length) return;
    oyunSec(GAMES[yeni]);
  };

  const solaKaydir = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(sekmeDegistir)(1);
    });

  const sagaKaydir = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(sekmeDegistir)(-1);
    });

  const kaydirma = Gesture.Race(solaKaydir, sagaKaydir);

  const myRank = user
    ? entries.findIndex((e) => e.player_id === user.id) + 1
    : 0;

  const zorlukGoster = ZORLUKLU[selectedGame];
  const birimMetni = t(`birim.${BIRIM[selectedGame]}`);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Oyun seçici */}
      <View style={[styles.tabBarWrap, { backgroundColor: colors.surface }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game}
              style={[
                styles.tab,
                selectedGame === game && { backgroundColor: colors.accent },
              ]}
              onPress={() => oyunSec(game)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textMuted },
                  selectedGame === game && {
                    color: colors.background,
                    fontWeight: "900",
                  },
                ]}
              >
                {t(`skorTablosu.sekme.${game}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Zorluk seçici — sadece zorluğu olan oyunlarda */}
      {zorlukGoster && (
        <View
          style={[styles.zorlukBarWrap, { backgroundColor: colors.surface }]}
        >
          {(ZORLUK_SECENEKLERI[selectedGame] ?? VARSAYILAN_SECENEKLER).map(
            (z) => (
              <TouchableOpacity
                key={z.key}
                style={[
                  styles.zorlukTab,
                  selectedDifficulty === z.key && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedDifficulty(z.key)}
              >
                <Text
                  style={[
                    styles.zorlukText,
                    { color: colors.textMuted },
                    selectedDifficulty === z.key && {
                      color: colors.background,
                      fontWeight: "900",
                    },
                  ]}
                >
                  {t(z.anahtar)}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <GestureDetector gesture={kaydirma}>
          <ScrollView
            style={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            }
          >
            {entries.length === 0 ? (
              <View
                style={[styles.emptyBox, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {t("skorTablosu.henuzYok")}
                </Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                  {zorlukGoster
                    ? t("skorTablosu.ilkSenOlZorluk")
                    : t("skorTablosu.ilkSenOl")}
                </Text>
              </View>
            ) : (
              entries.map((entry, index) => {
                const rank = index + 1;
                const isMe = entry.player_id === user?.id;
                const ad = gosterilenAd(entry);

                return (
                  <View
                    key={entry.player_id}
                    style={[
                      styles.row,
                      {
                        backgroundColor: colors.surface,
                        borderColor: "transparent",
                      },
                      isMe && { borderColor: colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.rank,
                        { color: colors.textMuted },
                        rank <= 3 && styles.rankTop,
                      ]}
                    >
                      {rank === 1
                        ? "🥇"
                        : rank === 2
                          ? "🥈"
                          : rank === 3
                            ? "🥉"
                            : `#${rank}`}
                    </Text>

                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text style={styles.avatarText}>
                        {ad.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.infoBox}>
                      <Text
                        style={[
                          styles.name,
                          { color: colors.text },
                          isMe && { color: colors.primary },
                        ]}
                        numberOfLines={1}
                      >
                        {ad} {isMe && `(${t("skorTablosu.sen")})`}
                      </Text>
                      <Text style={[styles.sub, { color: colors.textMuted }]}>
                        {t("skorTablosu.kezOynadi", {
                          sayi: entry.total_plays,
                        })}
                      </Text>
                    </View>

                    <View style={styles.scoreBox}>
                      <Text style={[styles.score, { color: colors.success }]}>
                        {entry.best_score}
                      </Text>
                      <Text
                        style={[styles.scoreLabel, { color: colors.textMuted }]}
                      >
                        {birimMetni}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </GestureDetector>
      )}

      {!loading && myRank > 0 && (
        <View
          style={[styles.myRankFooter, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.myRankText, { color: colors.textMuted }]}>
            {t("skorTablosu.seninSiran")}{" "}
            <Text style={[styles.myRankAccent, { color: colors.primary }]}>
              #{myRank}
            </Text>
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  tabBarWrap: {
    borderRadius: 14,
    padding: 4,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  zorlukBarWrap: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  zorlukTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 2,
  },
  zorlukText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  list: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  rank: {
    width: 50,
    fontWeight: "800",
    fontSize: 16,
  },
  rankTop: { fontSize: 22 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  infoBox: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  sub: { fontSize: 12, marginTop: 2 },
  scoreBox: { alignItems: "flex-end" },
  score: { fontSize: 18, fontWeight: "900" },
  scoreLabel: { fontSize: 11, fontWeight: "600" },
  emptyBox: {
    padding: 30,
    borderRadius: 14,
    alignItems: "center",
  },
  emptyText: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, marginTop: 6 },
  myRankFooter: {
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  myRankText: { fontSize: 14, fontWeight: "600" },
  myRankAccent: { fontWeight: "900" },
});
