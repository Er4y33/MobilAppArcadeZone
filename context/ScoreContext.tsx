import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";

export type GameKey = "reaction" | "memory" | "swipe";

export type ScoreItem = {
  id: string;
  game: GameKey;
  score: number;
  label: "ms" | "moves" | "points";
  playedAt: string;
};

type ScoreContextType = {
  scores: ScoreItem[];
  addScore: (item: Omit<ScoreItem, "id" | "playedAt">) => void;
  getBestScore: (game: GameKey) => ScoreItem | null;
};

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
  const [scores, setScores] = useState<ScoreItem[]>([]);

  const addScore = (item: Omit<ScoreItem, "id" | "playedAt">) => {
    const newItem: ScoreItem = {
      ...item,
      id: `${Date.now()}-${Math.random()}`,
      playedAt: new Date().toISOString(),
    };

    setScores((prev) => [newItem, ...prev]);
  };

  const getBestScore = (game: GameKey) => {
    const filtered = scores.filter((s) => s.game === game);
    if (filtered.length === 0) return null;

    // Reaction ve Memory: düşük skor daha iyi
    if (game === "reaction" || game === "memory") {
      return filtered.reduce((best, current) =>
        current.score < best.score ? current : best,
      );
    }

    // Swipe: yüksek skor daha iyi
    return filtered.reduce((best, current) =>
      current.score > best.score ? current : best,
    );
  };

  const value = useMemo(
    () => ({
      scores,
      addScore,
      getBestScore,
    }),
    [scores],
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
