import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

type GameState = "waiting" | "ready" | "tapped" | "tooSoon";

export default function ReactionTapScreen() {
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [message, setMessage] = useState("Hazır ol...");
  const [result, setResult] = useState<number | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const { addScore } = useScores();

  useEffect(() => {
    startGame();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameState("waiting");
    setMessage("Hazır ol...");
    setResult(null);
    startTimeRef.current = null;

    const randomDelay = Math.floor(Math.random() * 3000) + 1000;

    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      setMessage("ŞİMDİ DOKUN!");
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleTap = () => {
    if (gameState === "waiting") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setGameState("tooSoon");
      setMessage("Çok erken bastın!");
      setResult(null);
      return;
    }

    if (gameState === "ready") {
      const endTime = Date.now();
      const reactionTime = startTimeRef.current
        ? endTime - startTimeRef.current
        : 0;

      setGameState("tapped");
      setMessage("Tepki süren:");
      setResult(reactionTime);

      addScore({
        game: "reaction",
        score: reactionTime,
        label: "ms",
      });

      return;
    }

    if (gameState === "tooSoon" || gameState === "tapped") {
      startGame();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reaction Tap</Text>

      <TouchableOpacity
        style={[
          styles.tapArea,
          gameState === "ready" && styles.readyArea,
          gameState === "tooSoon" && styles.failArea,
        ]}
        onPress={handleTap}
        activeOpacity={0.9}
      >
        <Text style={styles.message}>{message}</Text>

        {result !== null ? (
          <Text style={styles.result}>{result} ms</Text>
        ) : null}

        {gameState === "tapped" || gameState === "tooSoon" ? (
          <Text style={styles.retry}>Tekrar denemek için dokun</Text>
        ) : null}
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
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },
  tapArea: {
    backgroundColor: "#151B2E",
    borderRadius: 24,
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  readyArea: {
    backgroundColor: "#22C55E",
  },
  failArea: {
    backgroundColor: "#DC2626",
  },
  message: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  result: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 14,
  },
  retry: {
    color: "#E5E7EB",
    fontSize: 15,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#374151",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
