import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  formatShortDate,
  getDaysUntilReset,
  getNextResetDate,
  getWeeklyTasks,
  getWeekStart,
  REWARD_BY_DIFFICULTY,
  TaskDefinition,
} from "../../constants/tasks";
import { useAuth } from "../../context/AuthContext";
import { useScores } from "../../context/ScoreContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

type TaskProgress = {
  task: TaskDefinition;
  completed: boolean;
  progressRatio: number;
  displayText: string;
  reward: number;
};

export default function TasksScreen() {
  const { scores, loading, refreshScores } = useScores();
  const { colors } = useTheme();
  const { user, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const [claimedIds, setClaimedIds] = React.useState<string[]>([]);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);

  const weekStart = useMemo(() => getWeekStart(), []);
  const nextReset = useMemo(() => getNextResetDate(), []);
  const daysLeft = useMemo(() => getDaysUntilReset(), []);
  const weeklyTasks = useMemo(() => getWeeklyTasks(), []);

  const taskProgressList = useMemo<TaskProgress[]>(() => {
    // Sadece bu haftaki oturumları dikkate al
    const weeklyScores = scores.filter(
      (s) => new Date(s.playedAt).getTime() >= weekStart.getTime(),
    );

    const list = weeklyTasks.map((task) => {
      const gameScores = weeklyScores.filter((s) => s.game === task.gameId);
      const reward = REWARD_BY_DIFFICULTY[task.difficulty];

      if (task.type === "play_count") {
        const current = gameScores.length;
        return {
          task,
          completed: current >= task.target,
          progressRatio: Math.min(current / task.target, 1),
          displayText: `${Math.min(current, task.target)} / ${task.target}`,
          reward,
        };
      }

      if (gameScores.length === 0) {
        return {
          task,
          completed: false,
          progressRatio: 0,
          displayText: `- / ${task.target}`,
          reward,
        };
      }

      if (task.type === "best_score_below") {
        const best = Math.min(...gameScores.map((s) => s.score));
        const completed = best < task.target;
        return {
          task,
          completed,
          progressRatio: completed ? 1 : Math.min(task.target / best, 0.95),
          displayText: `En iyi: ${best}`,
          reward,
        };
      }

      const best = Math.max(...gameScores.map((s) => s.score));
      const completed = best >= task.target;
      return {
        task,
        completed,
        progressRatio: Math.min(best / task.target, 1),
        displayText: `${best} / ${task.target}`,
        reward,
      };
    });

    // Tamamlanmamışlar üstte, tamamlananlar altta
    return list.sort((a, b) => Number(a.completed) - Number(b.completed));
  }, [scores, weeklyTasks, weekStart]);

  const completedCount = taskProgressList.filter((t) => t.completed).length;
  const totalCount = taskProgressList.length;
  const earnedCoins = taskProgressList
    .filter((t) => claimedIds.includes(t.task.id))
    .reduce((sum, t) => sum + t.reward, 0);
  const totalCoins = taskProgressList.reduce((sum, t) => sum + t.reward, 0);

  const fetchClaimed = React.useCallback(async () => {
    if (!user) return;
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const { data } = await supabase
      .from("player_tasks")
      .select("task_id")
      .eq("player_id", user.id)
      .eq("week_start", weekStartStr);
    setClaimedIds((data ?? []).map((r: any) => r.task_id));
  }, [user, weekStart]);

  React.useEffect(() => {
    fetchClaimed();
  }, [fetchClaimed]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshScores();
    await fetchClaimed();
    setRefreshing(false);
  };

  const handleClaim = async (taskId: string, reward: number) => {
    setClaimingId(taskId);
    const { error } = await supabase.rpc("claim_task_reward", {
      p_task_id: taskId,
    });
    setClaimingId(null);

    if (error) {
      Alert.alert("Ödül alınamadı", error.message);
      return;
    }
    await fetchClaimed();
    await refreshProfile();
    Alert.alert("Ödül alındı!", `🪙 ${reward} coin hesabına eklendi.`);
  };

  const difficultyColor = (d: TaskDefinition["difficulty"]) =>
    d === "kolay" ? colors.success : d === "orta" ? colors.info : colors.danger;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.accent }]}>
        HAFTALIK GÖREVLER
      </Text>

      {/* Yenilenme bilgisi */}
      <View style={[styles.resetCard, { backgroundColor: colors.surfaceAlt }]}>
        <Text style={[styles.resetText, { color: colors.textSecondary }]}>
          🔄 Görevler {formatShortDate(weekStart)} tarihinde yenilendi
        </Text>
        <Text style={[styles.resetSub, { color: colors.textMuted }]}>
          Yeni görevlere {daysLeft} gün kaldı ({formatShortDate(nextReset)})
        </Text>
      </View>

      {/* Genel ilerleme özeti */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
            TAMAMLANAN
          </Text>
          <Text style={[styles.summaryValue, { color: colors.success }]}>
            {completedCount} / {totalCount}
          </Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.success,
                width: `${(completedCount / totalCount) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.coinSummary, { color: colors.accent }]}>
          🪙 {earnedCoins} / {totalCoins} coin alındı
        </Text>
      </View>

      {loading && scores.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          {taskProgressList.map((item) => (
            <View
              key={item.task.id}
              style={[
                styles.taskCard,
                {
                  backgroundColor: item.completed
                    ? colors.surfaceAlt
                    : colors.surface,
                  borderColor: item.completed ? colors.success : colors.border,
                  opacity: item.completed ? 0.72 : 1,
                },
              ]}
            >
              <View style={styles.taskHeader}>
                <Text style={styles.taskEmoji}>{item.task.emoji}</Text>
                <View style={styles.taskTitleBox}>
                  <Text style={[styles.taskTitle, { color: colors.text }]}>
                    {item.task.title}
                  </Text>
                  <Text style={[styles.taskGame, { color: colors.textMuted }]}>
                    {item.task.gameName}
                  </Text>
                </View>
                {item.completed && (
                  <View
                    style={[
                      styles.doneBadge,
                      { backgroundColor: colors.success },
                    ]}
                  >
                    <Text style={styles.doneBadgeText}>✓</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.taskDesc, { color: colors.textSecondary }]}>
                {item.task.description}
              </Text>

              {/* Zorluk + Ödül etiketleri */}
              <View style={styles.tagRow}>
                <View
                  style={[
                    styles.tag,
                    { borderColor: difficultyColor(item.task.difficulty) },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: difficultyColor(item.task.difficulty) },
                    ]}
                  >
                    {item.task.difficulty.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.tag, { borderColor: colors.accent }]}>
                  <Text style={[styles.tagText, { color: colors.accent }]}>
                    🪙 {item.reward}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.taskBarBg, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.taskBarFill,
                    {
                      backgroundColor: item.completed
                        ? colors.success
                        : colors.primary,
                      width: `${Math.round(item.progressRatio * 100)}%`,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.taskProgress, { color: colors.textMuted }]}>
                {item.completed ? "Tamamlandı!" : item.displayText}
              </Text>

              {item.completed && (
                <TouchableOpacity
                  style={[
                    styles.claimBtn,
                    {
                      backgroundColor: claimedIds.includes(item.task.id)
                        ? colors.surfaceAlt
                        : colors.accent,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleClaim(item.task.id, item.reward)}
                  disabled={
                    claimedIds.includes(item.task.id) ||
                    claimingId === item.task.id
                  }
                >
                  <Text
                    style={[
                      styles.claimText,
                      {
                        color: claimedIds.includes(item.task.id)
                          ? colors.textMuted
                          : colors.background,
                      },
                    ]}
                  >
                    {claimingId === item.task.id
                      ? "..."
                      : claimedIds.includes(item.task.id)
                        ? "✓ ÖDÜL ALINDI"
                        : `🪙 ${item.reward} ÖDÜLÜ AL`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 12,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  resetCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  resetText: { fontSize: 13, fontWeight: "700" },
  resetSub: { fontSize: 12, fontWeight: "600", marginTop: 4 },

  summaryCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  summaryValue: { fontSize: 18, fontWeight: "900" },
  progressBg: { height: 8, borderRadius: 4 },
  progressFill: { height: 8, borderRadius: 4 },
  coinSummary: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "right",
  },

  list: { flex: 1 },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  taskEmoji: { fontSize: 26, marginRight: 12 },
  taskTitleBox: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: "800" },
  taskGame: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  doneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  doneBadgeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  taskDesc: { fontSize: 14, marginBottom: 10 },

  tagRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },

  taskBarBg: { height: 6, borderRadius: 3, marginBottom: 6 },
  taskBarFill: { height: 6, borderRadius: 3 },
  taskProgress: { fontSize: 12, fontWeight: "700", textAlign: "right" },

  claimBtn: {
    marginTop: 12,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  claimText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
});
