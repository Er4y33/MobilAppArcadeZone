import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScoreItem, useScores } from "../../context/ScoreContext";

function compareScores(a: ScoreItem, b: ScoreItem) {
  // Aynı oyun için kıyas
  if (a.game === b.game) {
    if (a.game === "swipe") {
      return b.score - a.score; // büyük daha iyi
    }

    // reaction + memory
    return a.score - b.score; // küçük daha iyi
  }

  // Farklı oyunlarda sıralama için normalize edilmiş mantık
  const normalize = (item: ScoreItem) => {
    if (item.game === "swipe") return item.score;
    return -item.score; // reaction ve memory'de küçük skor daha iyi
  };

  return normalize(b) - normalize(a);
}

export default function LeaderboardScreen() {
  const { scores } = useScores();

  const sortedScores = [...scores].sort(compareScores).slice(0, 10);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Liderlik Tablosu</Text>

      {sortedScores.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Henüz skor yok</Text>
        </View>
      ) : (
        sortedScores.map((item, index) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.rank}>#{index + 1}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.name}>{item.game.toUpperCase()}</Text>
              <Text style={styles.sub}>
                {item.score} {item.label}
              </Text>
            </View>

            <Text style={styles.score}>{item.score}</Text>
          </View>
        ))
      )}
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
  row: {
    flexDirection: "row",
    backgroundColor: "#151B2E",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  rank: {
    width: 50,
    color: "#FBBF24",
    fontWeight: "800",
  },
  infoBox: {
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 4,
  },
  score: {
    color: "#22C55E",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyBox: {
    backgroundColor: "#151B2E",
    padding: 20,
    borderRadius: 14,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
  },
});
