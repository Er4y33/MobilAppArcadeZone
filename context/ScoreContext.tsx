import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type GameKey = "reaction" | "memory" | "sonsaniye";

export type ScoreItem = {
  id: number;
  game: GameKey;
  score: number;
  label: "ms" | "moves" | "points";
  playedAt: string;
};

type ScoreContextType = {
  scores: ScoreItem[];
  addScore: (item: {
    game: GameKey;
    score: number;
    label: "ms" | "moves" | "points";
  }) => Promise<void>;
  getBestScore: (game: GameKey) => ScoreItem | null;
  loadingScores: boolean;
};

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserScores();
    } else {
      setScores([]);
      setLoadingScores(false);
    }
  }, [user]);

  const fetchUserScores = async () => {
    setLoadingScores(true);
    const { data, error } = await supabase
      .from("game_sessions")
      .select("id, game_id, score, played_at")
      .eq("player_id", user?.id)
      .order("played_at", { ascending: false });

    if (error) {
      console.error("Skorlar çekilirken hata:", error.message);
    } else if (data) {
      const formattedScores: ScoreItem[] = data.map((d: any) => {
        let label: "ms" | "moves" | "points" = "points";
        if (d.game_id === "reaction") label = "ms";
        if (d.game_id === "memory") label = "moves";
        return {
          id: d.id,
          game: d.game_id as GameKey,
          score: d.score,
          label,
          playedAt: d.played_at,
        };
      });
      setScores(formattedScores);
    }
    setLoadingScores(false);
  };

  const addScore = async (item: {
    game: GameKey;
    score: number;
    label: "ms" | "moves" | "points";
  }) => {
    if (!user) return;

    // 1. Skoru game_sessions'a kaydet
    const { data: sessionData, error: sessionError } = await supabase
      .from("game_sessions")
      .insert({ player_id: user.id, game_id: item.game, score: item.score })
      .select("id, played_at")
      .single();

    if (sessionError)
      return console.error("Skor kaydedilemedi:", sessionError.message);

    const newScore: ScoreItem = {
      id: sessionData.id,
      game: item.game,
      score: item.score,
      label: item.label,
      playedAt: sessionData.played_at,
    };
    setScores((prev) => [newScore, ...prev]);

    // 2. XP ve Coin Sistemi (players tablosunu güncelle)
    let earnedCoins = 10; // Klasik katılım ödülü
    if (item.game === "sonsaniye") earnedCoins += Math.floor(item.score / 10);
    if (item.game === "reaction" && item.score < 500) earnedCoins += 20;
    if (item.game === "memory" && item.score < 20) earnedCoins += 20;

    const { data: player } = await supabase
      .from("players")
      .select("level, coins")
      .eq("id", user.id)
      .single();

    if (player) {
      const newCoins = player.coins + earnedCoins;
      const newLevel = Math.floor(newCoins / 100) + 1; // Her 100 coinde seviye artar

      await supabase
        .from("players")
        .update({ coins: newCoins, level: newLevel })
        .eq("id", user.id);
    }
  };

  const getBestScore = (game: GameKey) => {
    const filtered = scores.filter((s) => s.game === game);
    if (filtered.length === 0) return null;

    if (game === "reaction" || game === "memory") {
      return filtered.reduce((best, current) =>
        current.score < best.score ? current : best,
      );
    }
    return filtered.reduce((best, current) =>
      current.score > best.score ? current : best,
    );
  };

  const value = useMemo(
    () => ({ scores, addScore, getBestScore, loadingScores }),
    [scores, loadingScores],
  );
  return (
    <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>
  );
}

export function useScores() {
  const context = useContext(ScoreContext);
  if (!context) throw new Error("useScores must be used within ScoreProvider");
  return context;
}
