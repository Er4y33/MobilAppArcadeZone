import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.logo}>ARCADEZONE</Text>
      <Text style={styles.subtitle}>Ana Menü</Text>

      <View style={styles.profileCard}>
        <Text style={styles.player}>Player123</Text>
        <Text style={styles.info}>Seviye 7</Text>
        <Text style={styles.info}>Coin: 1250</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#7C3AED" }]}
        onPress={() => router.push("/(tabs)/games")}
      >
        <Text style={styles.buttonText}>OYUNLAR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#F59E0B" }]}
        onPress={() => router.push("/(tabs)/leaderboard")}
      >
        <Text style={styles.buttonText}>LİDERLİK TABLOSU</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#06B6D4" }]}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Text style={styles.buttonText}>PROFİL</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#374151" }]}
        onPress={() => router.push("/(tabs)/settings")}
      >
        <Text style={styles.buttonText}>AYARLAR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#A855F7",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#E5E7EB",
    textAlign: "center",
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: "#151B2E",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  player: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  info: {
    color: "#9CA3AF",
    fontSize: 15,
    marginBottom: 4,
  },
  button: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});
