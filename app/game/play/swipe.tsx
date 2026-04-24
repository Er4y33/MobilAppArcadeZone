import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useScores } from "../../../context/ScoreContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GAME_WIDTH = SCREEN_WIDTH - 40;
const LANE_WIDTH = GAME_WIDTH / 3;
const PLAYER_SIZE = 46;
const ENEMY_SIZE = 40;
const GAME_HEIGHT = 420;
const PLAYER_Y = GAME_HEIGHT - 70;

type Lane = 0 | 1 | 2;

export default function SwipeDodgeScreen() {
  const [playerLane, setPlayerLane] = useState<Lane>(1);
  const [enemyLane, setEnemyLane] = useState<Lane>(1);
  const [enemyY, setEnemyY] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerLaneRef = useRef<Lane>(1);
  const enemyLaneRef = useRef<Lane>(1);
  const scoreRef = useRef(0);
  const submittedScoreRef = useRef(false);

  const { addScore } = useScores();

  useEffect(() => {
    startGame();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameOver && !submittedScoreRef.current) {
      submittedScoreRef.current = true;

      addScore({
        game: "swipe",
        score: scoreRef.current,
        label: "points",
      });
    }
  }, [gameOver, addScore]);

  const randomLane = (): Lane => Math.floor(Math.random() * 3) as Lane;

  const stopLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startGame = () => {
    stopLoop();

    const firstLane = randomLane();

    setPlayerLane(1);
    playerLaneRef.current = 1;

    setEnemyLane(firstLane);
    enemyLaneRef.current = firstLane;

    setEnemyY(0);
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    submittedScoreRef.current = false;

    intervalRef.current = setInterval(() => {
      setEnemyY((prevY) => {
        const nextY = prevY + 16;

        const collided =
          nextY + ENEMY_SIZE >= PLAYER_Y &&
          nextY <= PLAYER_Y + PLAYER_SIZE &&
          enemyLaneRef.current === playerLaneRef.current;

        if (collided) {
          stopLoop();
          setGameOver(true);
          return prevY;
        }

        if (nextY > GAME_HEIGHT) {
          const newLane = randomLane();
          enemyLaneRef.current = newLane;
          setEnemyLane(newLane);

          setScore((prev) => {
            const next = prev + 1;
            scoreRef.current = next;
            return next;
          });

          return 0;
        }

        return nextY;
      });
    }, 60);
  };

  const moveLeft = () => {
    if (gameOver) return;

    setPlayerLane((prev) => {
      const next = prev > 0 ? ((prev - 1) as Lane) : prev;
      playerLaneRef.current = next;
      return next;
    });
  };

  const moveRight = () => {
    if (gameOver) return;

    setPlayerLane((prev) => {
      const next = prev < 2 ? ((prev + 1) as Lane) : prev;
      playerLaneRef.current = next;
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Swipe Dodge</Text>
      <Text style={styles.score}>Skor: {score}</Text>

      <View style={styles.gameArea}>
        <View style={[styles.laneLine, { left: LANE_WIDTH }]} />
        <View style={[styles.laneLine, { left: LANE_WIDTH * 2 }]} />

        <View
          style={[
            styles.enemy,
            {
              left: enemyLane * LANE_WIDTH + (LANE_WIDTH - ENEMY_SIZE) / 2,
              top: enemyY,
            },
          ]}
        />

        <View
          style={[
            styles.player,
            {
              left: playerLane * LANE_WIDTH + (LANE_WIDTH - PLAYER_SIZE) / 2,
              top: PLAYER_Y,
            },
          ]}
        />
      </View>

      {gameOver ? (
        <View style={styles.gameOverBox}>
          <Text style={styles.gameOverTitle}>Oyun Bitti!</Text>
          <Text style={styles.gameOverSub}>Skorun: {score}</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
          <Text style={styles.controlText}>SOL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={gameOver ? startGame : moveRight}
        >
          <Text style={styles.controlText}>{gameOver ? "TEKRAR" : "SAĞ"}</Text>
        </TouchableOpacity>
      </View>

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
    justifyContent: "center",
  },
  title: {
    color: "#F59E0B",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  score: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 14,
  },
  gameArea: {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#151B2E",
    borderRadius: 20,
    position: "relative",
    overflow: "hidden",
    marginBottom: 18,
  },
  laneLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#334155",
  },
  enemy: {
    position: "absolute",
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    borderRadius: 8,
    backgroundColor: "#EF4444",
  },
  player: {
    position: "absolute",
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: 10,
    backgroundColor: "#22C55E",
  },
  gameOverBox: {
    width: GAME_WIDTH,
    backgroundColor: "#151B2E",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  gameOverTitle: {
    color: "#EF4444",
    fontSize: 22,
    fontWeight: "800",
  },
  gameOverSub: {
    color: "#E5E7EB",
    fontSize: 16,
    marginTop: 4,
  },
  controls: {
    width: GAME_WIDTH,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  controlButton: {
    backgroundColor: "#F59E0B",
    flex: 1,
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  controlText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
  },
  backButton: {
    width: GAME_WIDTH,
    backgroundColor: "#374151",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
