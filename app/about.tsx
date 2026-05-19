import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Logo */}
      <View style={styles.logoWrap}>
        <Text style={styles.logoEmoji}>⭐</Text>
        <Text style={[styles.logoText, { color: colors.primary }]}>
          ARCADE ZONE
        </Text>
        <Text style={[styles.logoSub, { color: colors.textMuted }]}>
          v1.0.0 Alpha
        </Text>
      </View>

      {/* Gelistiriciler */}
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
        GELISTIRICILER
      </Text>

      <View
        style={[
          styles.devCard,
          { backgroundColor: colors.surface, borderColor: colors.primary },
        ]}
      >
        <Text style={[styles.devName, { color: colors.text }]}>Atahan</Text>
        <Text style={[styles.devRole, { color: colors.primary }]}>
          UI/UX & Game Design
        </Text>
      </View>

      <View
        style={[
          styles.devCard,
          { backgroundColor: colors.surface, borderColor: colors.accent },
        ]}
      >
        <Text style={[styles.devName, { color: colors.text }]}>Eray</Text>
        <Text style={[styles.devRole, { color: colors.accent }]}>
          Game Development
        </Text>
      </View>

      {/* Tesekkurler */}
      <View style={[styles.thanksBox, { backgroundColor: colors.surface }]}>
        <Text style={[styles.thanksLabel, { color: colors.textMuted }]}>
          OZEL TESEKKURLER
        </Text>
        <Text style={[styles.thanksText, { color: colors.textSecondary }]}>
          Tum ArcadeZone Oyuncularina!
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.menuBtn, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.menuBtnText, { color: colors.text }]}>
          ANA MENU
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  logoWrap: { alignItems: "center", marginBottom: 36, marginTop: 16 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: "900", letterSpacing: 3 },
  logoSub: { fontSize: 13, marginTop: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  devCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  devName: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  devRole: { fontSize: 13, fontWeight: "600" },
  thanksBox: {
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  thanksLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 8,
  },
  thanksText: { fontSize: 15, fontWeight: "600" },
  menuBtn: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  menuBtnText: { fontSize: 15, fontWeight: "800", letterSpacing: 1 },
});
