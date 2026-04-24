import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../context/ScoreContext";

export default function ProfileScreen() {
  const { scores, getBestScore } = useScores();

  const reactionBest = getBestScore("reaction");
  const memoryBest = getBestScore("memory");
  const swipeBest = getBestScore("swipe");

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil</Text>

      <View style={styles.card}>
        <Text style={styles.name}>Player123</Text>
        <Text style={styles.info}>Toplam Oyun: {scores.length}</Text>
        <Text style={styles.info}>
          En İyi Reaction: {reactionBest ? `${reactionBest.score} ms` : "-"}
        </Text>
        <Text style={styles.info}>
          En İyi Memory: {memoryBest ? `${memoryBest.score} moves` : "-"}
        </Text>
        <Text style={styles.info}>
          En İyi Swipe: {swipeBest ? `${swipeBest.score} points` : "-"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    padding: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#151B2E",
    borderRadius: 18,
    padding: 20,
  },
  name: {
    color: "#A855F7",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 14,
  },
  info: {
    color: "#E5E7EB",
    fontSize: 16,
    marginBottom: 8,
  },
});
