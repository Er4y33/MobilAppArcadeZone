import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSound } from "../../context/SoundContext";
import { useTheme } from "../../context/ThemeContext";

export default function GamesScreen() {
  const { colors } = useTheme();
  const { cal } = useSound();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.icerik}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Oyunlar</Text>

        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderLeftColor: colors.gameReaction,
            },
          ]}
          onPress={() => {
            cal("click");
            router.push({
              pathname: "/game/[id]",
              params: { id: "reaction", title: "Tepki Testi" },
            });
          }}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Tepki Testi
          </Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            Hızlı tepki verme oyunu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderLeftColor: colors.gameMemory,
            },
          ]}
          onPress={() =>
            router.push({
              pathname: "/game/[id]",
              params: { id: "memory", title: "Hafıza Eşleştirme" },
            })
          }
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Hafıza Eşleştirme
          </Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            Kart eşleştirme oyunu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderLeftColor: colors.gameWord,
            },
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
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderLeftColor: colors.gameMath,
            },
          ]}
          onPress={() =>
            router.push({
              pathname: "/game/[id]",
              params: { id: "mathrush", title: "Sayı Avı" },
            })
          }
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Sayı Avı
          </Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            Hızlı matematik oyunu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderLeftColor: colors.gamePattern,
            },
          ]}
          onPress={() =>
            router.push({
              pathname: "/game/[id]",
              params: { id: "pattern", title: "Sırayı Takip Et" },
            })
          }
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Sırayı Takip Et
          </Text>
          <Text style={[styles.cardText, { color: colors.textMuted }]}>
            Renk sırası hafıza oyunu
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icerik: {
    padding: 20,
    paddingBottom: 32,
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
