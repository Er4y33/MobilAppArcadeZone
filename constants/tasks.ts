// constants/tasks.ts
// Haftalık görev sistemi. İlerleme game_sessions verisinden hesaplanır.

export type TaskType = "play_count" | "best_score_below" | "best_score_above";
export type Difficulty = "kolay" | "orta" | "zor";

export type GameId =
  | "reaction"
  | "memory"
  | "sonsaniye"
  | "mathrush"
  | "pattern";

export type TaskDefinition = {
  id: string;
  gameId: GameId;
  gameName: string;
  emoji: string;
  title: string;
  description: string;
  type: TaskType;
  target: number;
  difficulty: Difficulty;
};

// Zorluğa göre coin ödülü
export const REWARD_BY_DIFFICULTY: Record<Difficulty, number> = {
  kolay: 25,
  orta: 60,
  zor: 120,
};

// Görev havuzu — her hafta buradan 6 tanesi seçilir
export const TASK_POOL: TaskDefinition[] = [
  // ── Reaction Tap ────────────────────────────────────────
  {
    id: "reaction_play_5",
    gameId: "reaction",
    gameName: "Reaction Tap",
    emoji: "⚡",
    title: "Isınma Turu",
    description: "Reaction Tap'i 5 kez oyna",
    type: "play_count",
    target: 5,
    difficulty: "kolay",
  },
  {
    id: "reaction_under_200",
    gameId: "reaction",
    gameName: "Reaction Tap",
    emoji: "⚡",
    title: "Şimşek Refleks",
    description: "Reaction Tap'te 200 ms altına in",
    type: "best_score_below",
    target: 200,
    difficulty: "orta",
  },
  {
    id: "reaction_under_120",
    gameId: "reaction",
    gameName: "Reaction Tap",
    emoji: "⚡",
    title: "Yıldırım Hızı",
    description: "Reaction Tap'te 120 ms altına in",
    type: "best_score_below",
    target: 120,
    difficulty: "zor",
  },

  // ── Memory Match ────────────────────────────────────────
  {
    id: "memory_play_5",
    gameId: "memory",
    gameName: "Memory Match",
    emoji: "🧠",
    title: "Kart Delisi",
    description: "Memory Match'i 5 kez oyna",
    type: "play_count",
    target: 5,
    difficulty: "kolay",
  },
  {
    id: "memory_under_14",
    gameId: "memory",
    gameName: "Memory Match",
    emoji: "🧠",
    title: "Keskin Hafıza",
    description: "Memory Match'i 14 hamleden az bitir",
    type: "best_score_below",
    target: 14,
    difficulty: "orta",
  },
  {
    id: "memory_under_12",
    gameId: "memory",
    gameName: "Memory Match",
    emoji: "🧠",
    title: "Fotoğrafik Hafıza",
    description: "Memory Match'i 12 hamleden az bitir",
    type: "best_score_below",
    target: 12,
    difficulty: "zor",
  },

  // ── Son Saniye ──────────────────────────────────────────
  {
    id: "sonsaniye_play_3",
    gameId: "sonsaniye",
    gameName: "Son Saniye",
    emoji: "⏱",
    title: "Kelime Avcısı",
    description: "Son Saniye'yi 3 kez oyna",
    type: "play_count",
    target: 3,
    difficulty: "kolay",
  },
  {
    id: "sonsaniye_over_200",
    gameId: "sonsaniye",
    gameName: "Son Saniye",
    emoji: "⏱",
    title: "Sözcük Dağarcığı",
    description: "Son Saniye'de 200 puanı geç",
    type: "best_score_above",
    target: 200,
    difficulty: "orta",
  },
  {
    id: "sonsaniye_over_400",
    gameId: "sonsaniye",
    gameName: "Son Saniye",
    emoji: "⏱",
    title: "Kelime Ustası",
    description: "Son Saniye'de 400 puanı geç",
    type: "best_score_above",
    target: 400,
    difficulty: "zor",
  },

  // ── Sayı Avı ────────────────────────────────────────────
  {
    id: "mathrush_play_3",
    gameId: "mathrush",
    gameName: "Sayı Avı",
    emoji: "🔢",
    title: "Matematik Sever",
    description: "Sayı Avı'nı 3 kez oyna",
    type: "play_count",
    target: 3,
    difficulty: "kolay",
  },
  {
    id: "mathrush_over_150",
    gameId: "mathrush",
    gameName: "Sayı Avı",
    emoji: "🔢",
    title: "Hesap Makinesi",
    description: "Sayı Avı'nda 150 puanı geç",
    type: "best_score_above",
    target: 150,
    difficulty: "orta",
  },
  {
    id: "mathrush_over_220",
    gameId: "mathrush",
    gameName: "Sayı Avı",
    emoji: "🔢",
    title: "Sayı Dehası",
    description: "Sayı Avı'nda 220 puanı geç",
    type: "best_score_above",
    target: 220,
    difficulty: "zor",
  },

  // ── Sırayı Takip Et ─────────────────────────────────────
  {
    id: "pattern_play_3",
    gameId: "pattern",
    gameName: "Sırayı Takip Et",
    emoji: "🎨",
    title: "Sıra Takipçisi",
    description: "Sırayı Takip Et'i 3 kez oyna",
    type: "play_count",
    target: 3,
    difficulty: "kolay",
  },
  {
    id: "pattern_reach_8",
    gameId: "pattern",
    gameName: "Sırayı Takip Et",
    emoji: "🎨",
    title: "Dizi Avcısı",
    description: "Sırayı Takip Et'te 8. seviyeye ulaş",
    type: "best_score_above",
    target: 8,
    difficulty: "orta",
  },
  {
    id: "pattern_reach_12",
    gameId: "pattern",
    gameName: "Sırayı Takip Et",
    emoji: "🎨",
    title: "Dizi Efsanesi",
    description: "Sırayı Takip Et'te 12. seviyeye ulaş",
    type: "best_score_above",
    target: 12,
    difficulty: "zor",
  },
];

// Her hafta kaç görev gösterilecek
export const WEEKLY_TASK_COUNT = 6;

// ── Hafta Hesaplama Yardımcıları ──────────────────────────

/** İçinde bulunulan haftanın Pazartesi 00:00 tarihini döner */
export function getWeekStart(now: Date = new Date()): Date {
  const d = new Date(now);
  const day = d.getDay(); // 0=Pazar, 1=Pazartesi
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Bir sonraki yenilenme tarihi (gelecek Pazartesi 00:00) */
export function getNextResetDate(now: Date = new Date()): Date {
  const next = getWeekStart(now);
  next.setDate(next.getDate() + 7);
  return next;
}

/** Yenilenmeye kalan gün sayısı */
export function getDaysUntilReset(now: Date = new Date()): number {
  const next = getNextResetDate(now);
  const diffMs = next.getTime() - now.getTime();
  return Math.max(Math.ceil(diffMs / (1000 * 60 * 60 * 24)), 0);
}

/** Hafta numarası — deterministik görev seçimi için seed */
function getWeekIndex(now: Date = new Date()): number {
  const weekStart = getWeekStart(now);
  return Math.floor(weekStart.getTime() / (1000 * 60 * 60 * 24 * 7));
}

/** Basit deterministik sözde-rastgele üretici */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Bu haftanın görevlerini döner.
 * Aynı hafta içinde her çağrıda AYNI listeyi verir (deterministik),
 * hafta değişince liste otomatik yenilenir.
 */
export function getWeeklyTasks(now: Date = new Date()): TaskDefinition[] {
  const rand = seededRandom(getWeekIndex(now) + 1);
  const pool = [...TASK_POOL];

  // Fisher-Yates, seed'li
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, WEEKLY_TASK_COUNT);
}

/** Tarihi "3 Ağustos" formatında yazar */
export function formatShortDate(date: Date): string {
  const months = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}
