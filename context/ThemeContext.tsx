import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

export type ThemeMode = "dark" | "light";

export type ThemeColors = {
  // Arka planlar
  background: string; // Ana ekran arka planı
  surface: string; // Kart, container arka planı
  surfaceAlt: string; // İkincil yüzey (input, secondary card)
  border: string; // Sınır rengi

  // Metin
  text: string; // Ana metin (başlık, vurgu)
  textSecondary: string; // İkincil metin (alt yazı, açıklama)
  textMuted: string; // Çok soluk metin (placeholder, label)

  // Marka & Aksiyon
  primary: string; // Ana marka (mor)
  primaryAlt: string; // İkincil marka (pembe)
  accent: string; // Vurgu (sarı/altın)
  success: string; // Yeşil (skor, başarı)
  danger: string; // Kırmızı (çıkış, hata)
  info: string; // Mavi (info)

  // Tab bar
  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Header
  headerBg: string;
  headerText: string;

  // Buton metinleri
  buttonText: string; // Genel buton metni
  onPrimary: string; // Primary renk üzerine gelen metin
};

const darkTheme: ThemeColors = {
  background: "#0B1020",
  surface: "#151B2E",
  surfaceAlt: "#1F2B47",
  border: "#1F2B47",

  text: "#FFFFFF",
  textSecondary: "#E5E7EB",
  textMuted: "#9CA3AF",

  primary: "#A855F7",
  primaryAlt: "#EC4899",
  accent: "#FBBF24",
  success: "#22C55E",
  danger: "#EF4444",
  info: "#06B6D4",

  tabBarBg: "#111827",
  tabBarActive: "#A855F7",
  tabBarInactive: "#9CA3AF",

  headerBg: "#111827",
  headerText: "#FFFFFF",

  buttonText: "#FFFFFF",
  onPrimary: "#FFFFFF",
};

const lightTheme: ThemeColors = {
  background: "#F3F4F6",
  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",
  border: "#E5E7EB",

  text: "#0F172A",
  textSecondary: "#1F2937",
  textMuted: "#6B7280",

  primary: "#7C3AED",
  primaryAlt: "#DB2777",
  accent: "#F59E0B",
  success: "#16A34A",
  danger: "#DC2626",
  info: "#0891B2",

  tabBarBg: "#FFFFFF",
  tabBarActive: "#7C3AED",
  tabBarInactive: "#9CA3AF",

  headerBg: "#FFFFFF",
  headerText: "#0F172A",

  buttonText: "#FFFFFF",
  onPrimary: "#FFFFFF",
};

type ThemeContextType = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "arcadezone:theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  // Uygulama açılınca kayıtlı temayı yükle
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "dark" || saved === "light") {
        setMode(saved);
      }
    });
  }, []);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode);
  };

  const toggleTheme = () => {
    setTheme(mode === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({
      mode,
      colors: mode === "dark" ? darkTheme : lightTheme,
      toggleTheme,
      setTheme,
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
