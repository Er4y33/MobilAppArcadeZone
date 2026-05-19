import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export default function GameDetail() {
  const { id, title } = useLocalSearchParams<{
    id?: string;
    title?: string;
  }>();
  const { colors } = useTheme();

  const handleStartGame = () => {
    if (id === "reaction") {
      router.push("/game/play/reaction");
      return;
    }
    if (id === "memory") {
      router.push("/game/play/memory");
      return;
    }
    if (id === "sonsaniye") {
      router.push("/game/play/sonsaniye");
      return;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.primary }]}>
        {title || "Oyun Detayı"}
      </Text>

      <View style={[styles.box, { backgroundColor: colors.surface }]}>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Seçilen oyun kimliği: {id}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Bu oyun oynanabilir durumda.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: colors.success }]}
        onPress={handleStartGame}
      >
        <Text style={styles.startText}>OYUNU BAŞLAT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backText, { color: colors.text }]}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  box: {
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
  },
  desc: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 8,
  },
  startButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  startText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  backButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  backText: {
    fontWeight: "600",
  },
});
