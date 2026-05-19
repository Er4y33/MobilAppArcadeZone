import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useScores } from "../../context/ScoreContext";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const { scores, getBestScore } = useScores();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [playerData, setPlayerData] = useState({
    level: 1,
    coins: 0,
    xp: 0,
    username: "",
  });

  useEffect(() => {
    if (user) {
      supabase
        .from("players")
        .select("level, coins, xp, username")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setPlayerData(data);
        });
    }
  }, [user, scores]);

  const reactionBest = getBestScore("reaction");
  const memoryBest = getBestScore("memory");
  const sonsaniyeBest = getBestScore("sonsaniye");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Profil</Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.name, { color: colors.primary }]}>
          {playerData.username || "Oyuncu"}
        </Text>
        <Text style={[styles.level, { color: colors.accent }]}>
          Seviye: {playerData.level} | XP: {playerData.xp} | Coin:{" "}
          {playerData.coins} 🪙
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.info, { color: colors.textSecondary }]}>
          Toplam Oyun: {scores.length}
        </Text>
        <Text style={[styles.info, { color: colors.textSecondary }]}>
          En iyi Reaction: {reactionBest ? `${reactionBest.score} ms` : "-"}
        </Text>
        <Text style={[styles.info, { color: colors.textSecondary }]}>
          En iyi Memory: {memoryBest ? `${memoryBest.score} moves` : "-"}
        </Text>
        <Text style={[styles.info, { color: colors.textSecondary }]}>
          En iyi Son Saniye:{" "}
          {sonsaniyeBest ? `${sonsaniyeBest.score} points` : "-"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  card: { borderRadius: 18, padding: 20 },
  name: { fontSize: 24, fontWeight: "800", marginBottom: 6 },
  level: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  info: { fontSize: 16, marginBottom: 8 },
});
