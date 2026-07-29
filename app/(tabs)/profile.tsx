import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { GameKey, useScores } from "../../context/ScoreContext";
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

// Grafiklerde kullanılacak oyun listesi
const GAME_META: { key: GameKey; label: string; emoji: string }[] = [
  { key: "reaction", label: "Reaction", emoji: "⚡" },
  { key: "memory", label: "Memory", emoji: "🧠" },
  { key: "sonsaniye", label: "Son Saniye", emoji: "⏱" },
  { key: "mathrush", label: "Sayı Avı", emoji: "🔢" },
  { key: "pattern", label: "Sırayı Takip", emoji: "🎨" },
];

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

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
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  const [stats, setStats] = useState<PlayerStats>({
    username: "",
    level: 1,
    coins: 0,
    xp: 0,
    total_plays: 0,
    total_score: 0,
  });
  const [equippedFrameColor, setEquippedFrameColor] = useState<string | null>(
    null,
  );
  const [equippedBadgeText, setEquippedBadgeText] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user) return;

    supabase
      .from("players")
      .select("level, coins, xp, username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;

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

  // Kuşanılan çerçeve ve unvan bilgisini store_items'dan çek
  useEffect(() => {
    const ids = [profile?.equipped_frame, profile?.equipped_badge].filter(
      Boolean,
    ) as string[];

    if (ids.length === 0) {
      setEquippedFrameColor(null);
      setEquippedBadgeText(null);
      return;
    }

    supabase
      .from("store_items")
      .select("id, category, value")
      .in("id", ids)
      .then(({ data }) => {
        const frame = data?.find((i: any) => i.category === "frame");
        const badge = data?.find((i: any) => i.category === "badge");
        setEquippedFrameColor(frame?.value ?? null);
        setEquippedBadgeText(badge?.value ?? null);
      });
  }, [profile?.equipped_frame, profile?.equipped_badge]);

  // ── GRAFİK 1: Oyun bazlı oynama dağılımı ──────────────────────
  const gameDistribution = useMemo(() => {
    const counts = GAME_META.map((g) => ({
      ...g,
      count: scores.filter((s) => s.game === g.key).length,
    }));
    const max = Math.max(...counts.map((c) => c.count), 1);
    return counts.map((c) => ({ ...c, ratio: c.count / max }));
  }, [scores]);

  const favoriteGame = useMemo(() => {
    const sorted = [...gameDistribution].sort((a, b) => b.count - a.count);
    return sorted[0]?.count > 0 ? sorted[0] : null;
  }, [gameDistribution]);

  // ── GRAFİK 2: Son 7 günlük aktivite ───────────────────────────
  const weeklyActivity = useMemo(() => {
    const days: { label: string; count: number; isToday: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const dayEnd = new Date(day);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = scores.filter((s) => {
        const played = new Date(s.playedAt);
        return played >= day && played < dayEnd;
      }).length;

      // getDay: 0=Pazar → DAY_LABELS Pazartesi'den başlıyor
      const dayIndex = day.getDay() === 0 ? 6 : day.getDay() - 1;

      days.push({
        label: DAY_LABELS[dayIndex],
        count,
        isToday: i === 0,
      });
    }
    return days;
  }, [scores]);

  const maxDayCount = Math.max(...weeklyActivity.map((d) => d.count), 1);
  const weekTotal = weeklyActivity.reduce((sum, d) => sum + d.count, 0);

  const reactionBest = getBestScore("reaction");
  const memoryBest = getBestScore("memory");
  const sonsaniyeBest = getBestScore("sonsaniye");
  const mathrushBest = getBestScore("mathrush");
  const patternBest = getBestScore("pattern");

  const xpProgress = getXpProgress(stats.xp);
  const xpInLevel = stats.xp % 100;
  const badge = getBadgeLabel(stats.level);
  const initial = stats.username ? stats.username.charAt(0).toUpperCase() : "?";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Üst: Avatar + İsim + Seviye */}
        <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary },
              equippedFrameColor
                ? { borderWidth: 4, borderColor: equippedFrameColor }
                : null,
            ]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <Text style={[styles.username, { color: colors.text }]}>
            {stats.username || "Oyuncu"}
          </Text>
          <Text style={[styles.levelText, { color: colors.primary }]}>
            SEVİYE {stats.level}
          </Text>

          {equippedBadgeText && (
            <View
              style={[styles.equippedBadge, { borderColor: colors.accent }]}
            >
              <Text
                style={[styles.equippedBadgeText, { color: colors.accent }]}
              >
                {equippedBadgeText}
              </Text>
            </View>
          )}

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

        {/* ── GRAFİK 1: Oyun Dağılımı ──────────────────────────── */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Oyun Dağılımı
          </Text>
          {favoriteGame && (
            <Text style={[styles.chartSub, { color: colors.textMuted }]}>
              En çok oynadığın: {favoriteGame.emoji} {favoriteGame.label}
            </Text>
          )}

          {stats.total_plays === 0 ? (
            <Text style={[styles.emptyChart, { color: colors.textMuted }]}>
              Henüz oyun oynamadın
            </Text>
          ) : (
            gameDistribution.map((g) => (
              <View key={g.key} style={styles.hBarRow}>
                <Text style={[styles.hBarLabel, { color: colors.textMuted }]}>
                  {g.emoji} {g.label}
                </Text>
                <View
                  style={[styles.hBarTrack, { backgroundColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.hBarFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.max(g.ratio * 100, g.count > 0 ? 4 : 0)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.hBarValue, { color: colors.text }]}>
                  {g.count}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* ── GRAFİK 2: Son 7 Gün ──────────────────────────────── */}
        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Son 7 Günlük Aktivite
          </Text>
          <Text style={[styles.chartSub, { color: colors.textMuted }]}>
            Bu hafta toplam {weekTotal} oyun
          </Text>

          <View style={styles.vBarWrap}>
            {weeklyActivity.map((d, i) => (
              <View key={i} style={styles.vBarColumn}>
                <Text style={[styles.vBarValue, { color: colors.textMuted }]}>
                  {d.count > 0 ? d.count : ""}
                </Text>
                <View
                  style={[styles.vBarTrack, { backgroundColor: colors.border }]}
                >
                  <View
                    style={[
                      styles.vBarFill,
                      {
                        backgroundColor: d.isToday
                          ? colors.accent
                          : colors.success,
                        height: `${Math.max(
                          (d.count / maxDayCount) * 100,
                          d.count > 0 ? 6 : 0,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.vBarLabel,
                    { color: d.isToday ? colors.accent : colors.textMuted },
                    d.isToday && { fontWeight: "900" },
                  ]}
                >
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
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

          <View style={styles.scoreRow}>
            <Text style={[styles.scoreGame, { color: colors.textMuted }]}>
              🔢 Sayı Avı
            </Text>
            <Text style={[styles.scoreVal, { color: colors.success }]}>
              {mathrushBest ? `${mathrushBest.score} pts` : "-"}
            </Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={[styles.scoreGame, { color: colors.textMuted }]}>
              🎨 Sırayı Takip Et
            </Text>
            <Text style={[styles.scoreVal, { color: colors.success }]}>
              {patternBest ? `${patternBest.score} lvl` : "-"}
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

        <View style={{ height: 20 }} />
      </ScrollView>
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
  avatarText: { color: "#FFFFFF", fontSize: 32, fontWeight: "900" },
  username: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  levelText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  equippedBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  equippedBadgeText: { fontSize: 12, fontWeight: "900" },
  progressBg: { width: "100%", height: 8, borderRadius: 4, marginBottom: 6 },
  progressFill: { height: 8, borderRadius: 4 },
  xpText: { fontSize: 12, fontWeight: "600" },

  statsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  statBox: { flex: 1, borderRadius: 16, padding: 16, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "900", marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: "600" },

  badgeBox: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
  },
  badgeLabel: { fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  badgeValue: { fontSize: 15, fontWeight: "900" },

  // ── Grafik kartları ─────────────────────────────────────
  chartCard: { borderRadius: 16, padding: 16, marginBottom: 14 },
  chartSub: { fontSize: 12, fontWeight: "600", marginBottom: 14 },
  emptyChart: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },

  // Yatay bar (oyun dağılımı)
  hBarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  hBarLabel: { width: 110, fontSize: 12, fontWeight: "600" },
  hBarTrack: { flex: 1, height: 14, borderRadius: 7, overflow: "hidden" },
  hBarFill: { height: 14, borderRadius: 7 },
  hBarValue: {
    width: 34,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },

  // Dikey bar (haftalık aktivite)
  vBarWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  vBarColumn: { flex: 1, alignItems: "center" },
  vBarValue: { fontSize: 11, fontWeight: "800", marginBottom: 4, height: 14 },
  vBarTrack: {
    width: 22,
    height: 90,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  vBarFill: { width: 22, borderRadius: 6 },
  vBarLabel: { fontSize: 11, fontWeight: "600", marginTop: 6 },

  bestScoresCard: { borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  scoreGame: { fontSize: 14, fontWeight: "600" },
  scoreVal: { fontSize: 14, fontWeight: "800" },

  menuBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  menuBtnText: { fontSize: 15, fontWeight: "800", letterSpacing: 1 },
});
