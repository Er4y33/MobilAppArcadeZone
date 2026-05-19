import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function GamesScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Oyunlar</Text>

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderLeftColor: colors.primary },
        ]}
        onPress={() =>
          router.push({
            pathname: "/game/[id]",
            params: { id: "reaction", title: "Reaction Tap" },
          })
        }
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Reaction Tap
        </Text>
        <Text style={[styles.cardText, { color: colors.textMuted }]}>
          Hızlı tepki verme oyunu
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderLeftColor: colors.info },
        ]}
        onPress={() =>
          router.push({
            pathname: "/game/[id]",
            params: { id: "memory", title: "Memory Match" },
          })
        }
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Memory Match
        </Text>
        <Text style={[styles.cardText, { color: colors.textMuted }]}>
          Kart eşleştirme oyunu
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderLeftColor: colors.accent },
        ]}
        onPress={() =>
          router.push({
            pathname: "/game/[id]",
            params: { id: "sonsaniye", title: "Son Saniye" },
          })
        }
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Son Saniye
        </Text>
        <Text style={[styles.cardText, { color: colors.textMuted }]}>
          Karışık harfli kelime çözme oyunu
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
  },
});
