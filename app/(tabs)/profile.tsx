import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useScores } from "../../context/ScoreContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

type PlayerStats = {
  username: string;
  level: number;
  coins: number;
  xp: number;
  total_plays: number;
  total_score: number;
};

// Seviyeye göre en iyi rozet belirle
function getBadgeLabel(level: number): string {
  if (level >= 15) return "🏆 EFSANEVİ";
  if (level >= 10) return "💎 ELMAS";
  if (level >= 7) return "⚡ TEPKI USTASI";
  if (level >= 5) return "🧠 HAFİZA UZMANI";
  if (level >= 3) return "🌟 YÜKSELİYOR";
  return "🎮 YENİ OYUNCU";
}

// XP progress barı için: mevcut seviyede ne kadar ilerlendi?
function getXpProgress(xp: number): number {
  const xpInCurrentLevel = xp % 100;
  return xpInCurrentLevel / 100;
}

export default function ProfileScreen() {
  const { scores, getBestScore } = useScores();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState<PlayerStats>({
    username: "",
    level: 1,
    coins: 0,
    xp: 0,
    total_plays: 0,
    total_score: 0,
  });

  useEffect(() => {
    if (!user) return;

    supabase
      .from("players")
      .select("level, coins, xp, username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;

        // Toplam skor ve oynanan oyun sayısını game_sessions'dan çek
        supabase
          .from("game_sessions")
          .select("score")
          .eq("player_id", user.id)
          .then(({ data: sessions }) => {
            const totalScore = sessions?.reduce((s, r) => s + r.score, 0) ?? 0;
            setStats({
              username: data.username,
              level: data.level,
              coins: data.coins,
              xp: data.xp,
              total_plays: sessions?.length ?? 0,
              total_score: totalScore,
            });
          });
      });
  }, [user, scores]);

  const reactionBest = getBestScore("reaction");
  const memoryBest = getBestScore("memory");
  const sonsaniyeBest = getBestScore("sonsaniye");

  const xpProgress = getXpProgress(stats.xp);
  const xpInLevel = stats.xp % 100;
  const badge = getBadgeLabel(stats.level);
  const initial = stats.username ? stats.username.charAt(0).toUpperCase() : "?";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Üst: Avatar + İsim + Seviye */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
        {/* Avatar Dairesi */}
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <Text style={[styles.username, { color: colors.text }]}>
          {stats.username || "Oyuncu"}
        </Text>
        <Text style={[styles.levelText, { color: colors.primary }]}>
          SEVİYE {stats.level}
        </Text>

        {/* XP Progress Bar */}
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${Math.round(xpProgress * 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.xpText, { color: colors.textMuted }]}>
          {xpInLevel} / 100 XP
        </Text>
      </View>

      {/* İstatistik Kutuları */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {stats.total_score.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Toplam Skor
          </Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statValue, { color: colors.primaryAlt }]}>
            {stats.total_plays}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Oynanan Oyun
          </Text>
        </View>
      </View>

      {/* En İyi Rozet */}
      <View
        style={[
          styles.badgeBox,
          { backgroundColor: colors.surface, borderColor: colors.primary },
        ]}
      >
        <Text style={[styles.badgeLabel, { color: colors.textMuted }]}>
          EN İYİ ROZET
        </Text>
        <Text style={[styles.badgeValue, { color: colors.primary }]}>
          {badge}
        </Text>
      </View>

      {/* En İyi Skorlar */}
      <View
        style={[styles.bestScoresCard, { backgroundColor: colors.surface }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          En İyi Skorlar
        </Text>

        <View style={styles.scoreRow}>
          <Text style={[styles.scoreGame, { color: colors.textMuted }]}>
            ⚡ Reaction
          </Text>
          <Text style={[styles.scoreVal, { color: colors.success }]}>
            {reactionBest ? `${reactionBest.score} ms` : "-"}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={[styles.scoreGame, { color: colors.textMuted }]}>
            🧠 Memory
          </Text>
          <Text style={[styles.scoreVal, { color: colors.success }]}>
            {memoryBest ? `${memoryBest.score} moves` : "-"}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={[styles.scoreGame, { color: colors.textMuted }]}>
            ⏱ Son Saniye
          </Text>
          <Text style={[styles.scoreVal, { color: colors.success }]}>
            {sonsaniyeBest ? `${sonsaniyeBest.score} pts` : "-"}
          </Text>
        </View>
      </View>

      {/* Ana Menü */}
      <TouchableOpacity
        style={[
          styles.menuBtn,
          { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
        ]}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={[styles.menuBtnText, { color: colors.text }]}>
          ANA MENÜ
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  headerCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
  },
  username: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  levelText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  progressBg: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  badgeBox: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  badgeValue: {
    fontSize: 15,
    fontWeight: "900",
  },

  bestScoresCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreGame: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreVal: {
    fontSize: 14,
    fontWeight: "800",
  },

  menuBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  menuBtnText: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
