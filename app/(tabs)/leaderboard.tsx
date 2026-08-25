import React, { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

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

const GAMES: { key: GameKey; label: string }[] = [
  { key: "reaction", label: "TEPKİ" },
  { key: "memory", label: "HAFIZA" },
  { key: "sonsaniye", label: "SON SANİYE" },
  { key: "mathrush", label: "SAYI AVI" },
  { key: "pattern", label: "SIRAYI TAKİP ET" },
];

const LOWER_IS_BETTER: Record<GameKey, boolean> = {
  reaction: true,
  memory: true,
  sonsaniye: false,
  mathrush: false,
  pattern: false,
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

type ZorlukSecenek = { key: Difficulty; label: string };

const VARSAYILAN_SECENEKLER: ZorlukSecenek[] = [
  { key: "kolay", label: "KOLAY" },
  { key: "orta", label: "ORTA" },
  { key: "zor", label: "ZOR" },
];

// Son Saniye'de zorluk yerine mod var — etiketler farklı, "zor" seçeneği yok
const ZORLUK_SECENEKLERI: Partial<Record<GameKey, ZorlukSecenek[]>> = {
  sonsaniye: [
    { key: "kolay", label: "DOKUNMALI" },
    { key: "orta", label: "YAZMALI" },
  ],
};
export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
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
    const i = GAMES.findIndex((g) => g.key === selectedGame);
    const yeni = i + yon;
    if (yeni < 0 || yeni >= GAMES.length) return;
    oyunSec(GAMES[yeni].key);
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
              key={game.key}
              style={[
                styles.tab,
                selectedGame === game.key && { backgroundColor: colors.accent },
              ]}
              onPress={() => oyunSec(game.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textMuted },
                  selectedGame === game.key && {
                    color: colors.background,
                    fontWeight: "900",
                  },
                ]}
              >
                {game.label}
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
                  {z.label}
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
                  Henüz skor yok
                </Text>
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                  {zorlukGoster
                    ? "Bu zorlukta ilk oynayan sen ol!"
                    : "İlk oynayan sen ol!"}
                </Text>
              </View>
            ) : (
              entries.map((entry, index) => {
                const rank = index + 1;
                const isMe = entry.player_id === user?.id;
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
                        {entry.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.infoBox}>
                      <Text
                        style={[
                          styles.name,
                          { color: colors.text },
                          isMe && { color: colors.primary },
                        ]}
                      >
                        {entry.username} {isMe && "(Sen)"}
                      </Text>
                      <Text style={[styles.sub, { color: colors.textMuted }]}>
                        {entry.total_plays} kez oynadı
                      </Text>
                    </View>

                    <View style={styles.scoreBox}>
                      <Text style={[styles.score, { color: colors.success }]}>
                        {entry.best_score}
                      </Text>
                      <Text
                        style={[styles.scoreLabel, { color: colors.textMuted }]}
                      >
                        {entry.score_label}
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
            Senin Sıran:{" "}
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
