import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GamesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Oyunlar</Text>

      <TouchableOpacity
        style={[styles.card, { borderLeftColor: "#7C3AED" }]}
        onPress={() =>
          router.push({
            pathname: "/game/[id]",
            params: { id: "reaction", title: "Reaction Tap" },
          })
        }
      >
        <Text style={styles.cardTitle}>Reaction Tap</Text>
        <Text style={styles.cardText}>Hızlı tepki verme oyunu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { borderLeftColor: "#06B6D4" }]}
        onPress={() =>
          router.push({
            pathname: "/game/[id]",
            params: { id: "memory", title: "Memory Match" },
          })
        }
      >
        <Text style={styles.cardTitle}>Memory Match</Text>
        <Text style={styles.cardText}>Kart eşleştirme oyunu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { borderLeftColor: "#F59E0B" }]}
        onPress={() =>
          router.push({
            pathname: "/game/[id]",
            params: { id: "swipe", title: "Swipe Dodge" },
          })
        }
      >
        <Text style={styles.cardTitle}>Swipe Dodge</Text>
        <Text style={styles.cardText}>Engellerden kaçma oyunu</Text>
      </TouchableOpacity>
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 6,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});
