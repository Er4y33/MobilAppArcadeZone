import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameDetail() {
  const { id, title } = useLocalSearchParams<{
    id?: string;
    title?: string;
  }>();

  const handleStartGame = () => {
    if (id === "reaction") {
      router.push("/game/play/reaction");
      return;
    }

    if (id === "memory") {
      router.push("/game/play/memory");
      return;
    }

    if (id === "swipe") {
      router.push("/game/play/swipe");
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title || "Oyun Detayı"}</Text>

      <View style={styles.box}>
        <Text style={styles.desc}>Seçilen oyun kimliği: {id}</Text>
        <Text style={styles.desc}>Bu oyun oynanabilir durumda.</Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
        <Text style={styles.startText}>OYUNU BAŞLAT</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1020",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "#A855F7",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },
  box: {
    backgroundColor: "#151B2E",
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
  },
  desc: {
    color: "#E5E7EB",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: "#22C55E",
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
    backgroundColor: "#374151",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  backText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
