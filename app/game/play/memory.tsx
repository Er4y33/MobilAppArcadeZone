import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

type CardType = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

const baseCards = ["A", "B", "C", "D"];

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function createGameCards(): CardType[] {
  const doubled = [...baseCards, ...baseCards];
  const shuffled = shuffleArray(doubled);

  return shuffled.map((value, index) => ({
    id: index,
    value,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryMatchScreen() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const { addScore } = useScores();

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (selected.length === 2) {
      const [firstId, secondId] = selected;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (!firstCard || !secondCard) return;

      setMoves((prev) => prev + 1);

      if (firstCard.value === secondCard.value) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId
              ? { ...card, matched: true }
              : card,
          ),
        );
        setSelected([]);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, flipped: false }
                : card,
            ),
          );
          setSelected([]);
        }, 700);
      }
    }
  }, [selected, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.matched) && !gameWon) {
      setGameWon(true);

      addScore({
        game: "memory",
        score: moves,
        label: "moves",
      });
    }
  }, [cards, gameWon, moves, addScore]);

  const resetGame = () => {
    setCards(createGameCards());
    setSelected([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardPress = (id: number) => {
    const card = cards.find((c) => c.id === id);

    if (!card) return;
    if (card.flipped || card.matched) return;
    if (selected.length === 2) return;

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
    );

    setSelected((prev) => [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Memory Match</Text>
      <Text style={styles.info}>Hamle: {moves}</Text>

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.flipped && styles.flippedCard,
              card.matched && styles.matchedCard,
            ]}
            onPress={() => handleCardPress(card.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardText}>
              {card.flipped || card.matched ? card.value : "?"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {gameWon ? (
        <View style={styles.winBox}>
          <Text style={styles.winText}>Tebrikler, kazandın!</Text>
          <Text style={styles.winSub}>Toplam hamle: {moves}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.actionButton} onPress={resetGame}>
        <Text style={styles.actionText}>Yeniden Başlat</Text>
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
    alignItems: "center",
  },
  title: {
    color: "#06B6D4",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 10,
  },
  info: {
    color: "#E5E7EB",
    fontSize: 18,
    marginBottom: 20,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "23%",
    aspectRatio: 1,
    backgroundColor: "#151B2E",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  flippedCard: {
    backgroundColor: "#0891B2",
  },
  matchedCard: {
    backgroundColor: "#22C55E",
  },
  cardText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  winBox: {
    marginTop: 20,
    backgroundColor: "#151B2E",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    width: "100%",
  },
  winText: {
    color: "#22C55E",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
  },
  winSub: {
    color: "#E5E7EB",
    fontSize: 16,
  },
  actionButton: {
    marginTop: 20,
    backgroundColor: "#06B6D4",
    padding: 16,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  backButton: {
    marginTop: 12,
    backgroundColor: "#374151",
    padding: 16,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
