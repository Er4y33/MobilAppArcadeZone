import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

export type GameKey =
  | "reaction"
  | "memory"
  | "sonsaniye"
  | "mathrush"
  | "pattern";

export type Difficulty = "kolay" | "orta" | "zor";

export type ScoreItem = {
  id: string;
  game: GameKey;
  score: number;
  label: "ms" | "moves" | "points";
  difficulty: Difficulty;
  playedAt: string;
};

// addScore'a gönderilen girdi: difficulty opsiyonel (verilmezse 'orta')
export type ScoreInput = Omit<ScoreItem, "id" | "playedAt" | "difficulty"> & {
  difficulty?: Difficulty;
};

export type RewardResult = {
  xpEarned: number;
  coinsEarned: number;
  level: number;
  difficulty: Difficulty;
} | null;

type ScoreContextType = {
  scores: ScoreItem[];
  loading: boolean;
  addScore: (item: ScoreInput) => Promise<RewardResult>;
  getBestScore: (game: GameKey, difficulty?: Difficulty) => ScoreItem | null;
  refreshScores: () => Promise<void>;
};

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

// Düşük skorun daha iyi olduğu oyunlar
const LOWER_IS_BETTER: Record<GameKey, boolean> = {
  reaction: true,
  memory: true,
  sonsaniye: false,
  mathrush: false,
  pattern: false,
};

// Veritabanından çekilecek sütunlar — tek yerde tut, iki sorguda da kullan
const SESSION_COLUMNS = "id, game_id, score, difficulty, played_at";

// Veritabanı satırını uygulama formatına çeviren yardımcı fonksiyon
function mapDbRowToScoreItem(row: any): ScoreItem {
  const labelMap: Record<GameKey, "ms" | "moves" | "points"> = {
    reaction: "ms",
    memory: "moves",
    sonsaniye: "points",
    mathrush: "points",
    pattern: "points",
  };

  return {
    id: String(row.id),
    game: row.game_id as GameKey,
    score: row.score,
    label: labelMap[row.game_id as GameKey] ?? "points",
    difficulty: (row.difficulty as Difficulty) ?? "orta",
    playedAt: row.played_at,
  };
}

export function ScoreProvider({ children }: { children: ReactNode }) {
  const { user, refreshProfile } = useAuth();
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Kullanıcının skorlarını Supabase'den çek
  const refreshScores = useCallback(async () => {
    if (!user) {
      setScores([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("game_sessions")
      .select(SESSION_COLUMNS)
      .eq("player_id", user.id)
      .order("played_at", { ascending: false });

    if (error) {
      console.error("Skorlar çekilemedi:", error.message);
      setScores([]);
    } else if (data) {
      setScores(data.map(mapDbRowToScoreItem));
    }
    setLoading(false);
  }, [user]);

  // Kullanıcı değişince (giriş/çıkış) skorları yeniden yükle
  useEffect(() => {
    refreshScores();
  }, [refreshScores]);

  // Skor ekle: Supabase RPC fonksiyonunu çağırır (atomik: skor + XP + coin)
  const addScore = useCallback(
    async (item: ScoreInput): Promise<RewardResult> => {
      if (!user) {
        console.warn("Skor kaydedilemedi: kullanıcı oturum açmamış");
        return null;
      }

      const zorluk: Difficulty = item.difficulty ?? "orta";

      const { data, error } = await supabase.rpc("record_game_session", {
        p_game_id: item.game,
        p_score: item.score,
        p_time_left: 0,
        p_difficulty: zorluk,
      });

      if (error) {
        console.error("Skor kaydedilemedi:", error.message);
        return null;
      }

      if (data?.session_id) {
        const { data: row } = await supabase
          .from("game_sessions")
          .select(SESSION_COLUMNS)
          .eq("id", data.session_id)
          .single();

        if (row) {
          setScores((prev) => [mapDbRowToScoreItem(row), ...prev]);
        }
      }

      await refreshProfile();

      return {
        xpEarned: data?.xp_earned ?? 0,
        coinsEarned: data?.coins_earned ?? 0,
        level: data?.level ?? 1,
        difficulty: (data?.difficulty as Difficulty) ?? zorluk,
      };
    },
    [user, refreshProfile],
  );

  // En iyi skoru bul. difficulty verilmezse tüm zorluklar birlikte değerlendirilir.
  const getBestScore = useCallback(
    (game: GameKey, difficulty?: Difficulty): ScoreItem | null => {
      const filtered = scores.filter(
        (s) => s.game === game && (!difficulty || s.difficulty === difficulty),
      );
      if (filtered.length === 0) return null;

      const dusukIyi = LOWER_IS_BETTER[game];

      return filtered.reduce((best, current) =>
        dusukIyi
          ? current.score < best.score
            ? current
            : best
          : current.score > best.score
            ? current
            : best,
      );
    },
    [scores],
  );

  const value = useMemo(
    () => ({
      scores,
      loading,
      addScore,
      getBestScore,
      refreshScores,
    }),
    [scores, loading, addScore, getBestScore, refreshScores],
  );

  return (
    <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>
  );
}

export function useScores() {
  const context = useContext(ScoreContext);
  if (!context) {
    throw new Error("useScores must be used within ScoreProvider");
  }
  return context;
}
