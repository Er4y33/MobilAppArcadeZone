import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  const username = profile?.username || user?.email?.split("@")[0] || "Oyuncu";
  const level = profile?.level || 1;
  const coins = profile?.coins || 0;
  const xp = profile?.xp || 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.logo, { color: colors.primary }]}>ARCADEZONE</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Ana Menü
      </Text>

      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.player, { color: colors.text }]}>{username}</Text>
        <Text style={[styles.info, { color: colors.textMuted }]}>
          Seviye {level} (XP: {xp})
        </Text>
        <Text style={[styles.info, { color: colors.textMuted }]}>
          Coin: {coins}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)/games")}
      >
        <Text style={styles.buttonText}>OYUNLAR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.accent }]}
        onPress={() => router.push("/(tabs)/leaderboard")}
      >
        <Text style={styles.buttonText}>LİDERLİK TABLOSU</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.info }]}
        onPress={() => router.push("/(tabs)/profile")}
      >
        <Text style={styles.buttonText}>PROFİL</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => router.push("/(tabs)/settings")}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>AYARLAR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  player: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  info: { fontSize: 15, marginBottom: 4 },
  button: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
});
