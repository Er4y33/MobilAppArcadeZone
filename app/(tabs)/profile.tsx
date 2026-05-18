import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useScores } from "../../context/ScoreContext";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const { scores, getBestScore } = useScores();
  const { user } = useAuth();
  const [playerData, setPlayerData] = useState({
    level: 1,
    coins: 0,
    username: "",
  });

  useEffect(() => {
    if (user) {
      supabase
        .from("players")
        .select("level, coins, username")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setPlayerData(data);
        });
    }
  }, [user, scores]); // Skorlar güncellendikçe profil de yenilenir

  const reactionBest = getBestScore("reaction");
  const memoryBest = getBestScore("memory");
  const sonsaniyeBest = getBestScore("sonsaniye");

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{playerData.username || "Oyuncu"}</Text>
        <Text style={styles.level}>
          Seviye: {playerData.level} | Coin: {playerData.coins} 🪙
        </Text>
        <Text style={styles.info}>Toplam Oyun: {scores.length}</Text>

        <Text style={styles.info}>
          En iyi Reaction: {reactionBest ? `${reactionBest.score} ms` : "-"}
        </Text>
        <Text style={styles.info}>
          En iyi Memory: {memoryBest ? `${memoryBest.score} moves` : "-"}
        </Text>
        <Text style={styles.info}>
          En iyi Son Saniye:{" "}
          {sonsaniyeBest ? `${sonsaniyeBest.score} points` : "-"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1020", padding: 20 },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  card: { backgroundColor: "#151B2E", borderRadius: 18, padding: 20 },
  name: { color: "#A855F7", fontSize: 24, fontWeight: "800", marginBottom: 6 },
  level: {
    color: "#F59E0B",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  info: { color: "#E5E7EB", fontSize: 16, marginBottom: 8 },
});
