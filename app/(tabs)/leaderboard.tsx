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
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

type GameKey = "reaction" | "memory" | "sonsaniye";

type LeaderboardEntry = {
  game_id: string;
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
];

const LOWER_IS_BETTER: Record<GameKey, boolean> = {
  reaction: true,
  memory: true,
  sonsaniye: false,
};

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [selectedGame, setSelectedGame] = useState<GameKey>("reaction");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const ascending = LOWER_IS_BETTER[selectedGame];

    const { data, error } = await supabase
      .from("leaderboard_view")
      .select("*")
      .eq("game_id", selectedGame)
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
  }, [selectedGame]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const myRank = user
    ? entries.findIndex((e) => e.player_id === user.id) + 1
    : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.accent }]}>EN İYİLER</Text>

      <View style={[styles.tabBar, { backgroundColor: colors.surface }]}>
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.key}
            style={[
              styles.tab,
              selectedGame === game.key && { backgroundColor: colors.accent },
            ]}
            onPress={() => setSelectedGame(game.key)}
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
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
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
                İlk oynayan sen ol!
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
                    style={[styles.avatar, { backgroundColor: colors.primary }]}
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
  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 2,
    marginVertical: 16,
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
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
