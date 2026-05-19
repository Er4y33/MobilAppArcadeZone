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

export type GameKey = "reaction" | "memory" | "sonsaniye";

export type ScoreItem = {
  id: string;
  game: GameKey;
  score: number;
  label: "ms" | "moves" | "points";
  playedAt: string;
};

type ScoreContextType = {
  scores: ScoreItem[];
  loading: boolean;
  addScore: (item: Omit<ScoreItem, "id" | "playedAt">) => Promise<void>;
  getBestScore: (game: GameKey) => ScoreItem | null;
  refreshScores: () => Promise<void>;
};

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

// Veritabanı satırını uygulama formatına çeviren yardımcı fonksiyon
function mapDbRowToScoreItem(row: any): ScoreItem {
  const labelMap: Record<GameKey, "ms" | "moves" | "points"> = {
    reaction: "ms",
    memory: "moves",
    sonsaniye: "points",
  };

  return {
    id: String(row.id),
    game: row.game_id as GameKey,
    score: row.score,
    label: labelMap[row.game_id as GameKey] ?? "points",
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
      .select("id, game_id, score, played_at")
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
  const addScore = async (item: Omit<ScoreItem, "id" | "playedAt">) => {
    if (!user) {
      console.warn("Skor kaydedilemedi: kullanıcı oturum açmamış");
      return;
    }

    // record_game_session RPC: hem skoru ekler, hem XP/coin verir, hem seviyeyi hesaplar
    const { data, error } = await supabase.rpc("record_game_session", {
      p_game_id: item.game,
      p_score: item.score,
      p_time_left: 0,
    });

    if (error) {
      console.error("Skor kaydedilemedi:", error.message);
      return;
    }

    // RPC sonucundan session_id geliyor, satırı çekip local state'e ekle
    if (data?.session_id) {
      const { data: row } = await supabase
        .from("game_sessions")
        .select("id, game_id, score, played_at")
        .eq("id", data.session_id)
        .single();

      if (row) {
        setScores((prev) => [mapDbRowToScoreItem(row), ...prev]);
      }
    }

    // Ana menüde XP/coin/seviye güncel görünsün diye profili yenile
    await refreshProfile();
  };

  // En iyi skoru bul (oyuna göre düşük veya yüksek)
  const getBestScore = (game: GameKey): ScoreItem | null => {
    const filtered = scores.filter((s) => s.game === game);
    if (filtered.length === 0) return null;

    // Reaction ve Memory: düşük skor daha iyi
    if (game === "reaction" || game === "memory") {
      return filtered.reduce((best, current) =>
        current.score < best.score ? current : best,
      );
    }

    // Son Saniye: yüksek skor daha iyi
    return filtered.reduce((best, current) =>
      current.score > best.score ? current : best,
    );
  };

  const value = useMemo(
    () => ({
      scores,
      loading,
      addScore,
      getBestScore,
      refreshScores,
    }),
    [scores, loading, refreshScores],
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
