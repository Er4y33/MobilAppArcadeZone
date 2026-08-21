import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { setHapticsEnabled } from "../lib/haptics";

type HapticsContextType = {
  hapticsEnabled: boolean;
  toggleHaptics: () => void;
  setHaptics: (value: boolean) => void;
};

const HapticsContext = createContext<HapticsContextType | undefined>(undefined);

const STORAGE_KEY = "arcadezone:haptics";

export function HapticsProvider({ children }: { children: ReactNode }) {
  const [hapticsEnabled, setEnabled] = useState(true);

  // Uygulama açılınca kayıtlı tercihi yükle
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "off") {
        setEnabled(false);
        setHapticsEnabled(false);
      } else {
        setEnabled(true);
        setHapticsEnabled(true);
      }
    });
  }, []);

  const setHaptics = (value: boolean) => {
    setEnabled(value);
    setHapticsEnabled(value); // lib/haptics içindeki modül bayrağını güncelle
    AsyncStorage.setItem(STORAGE_KEY, value ? "on" : "off");
  };

  const toggleHaptics = () => {
    setHaptics(!hapticsEnabled);
  };

  const value = useMemo(
    () => ({ hapticsEnabled, toggleHaptics, setHaptics }),
    [hapticsEnabled],
  );

  return (
    <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>
  );
}

export function useHaptics() {
  const context = useContext(HapticsContext);
  if (!context) {
    throw new Error("useHaptics must be used within HapticsProvider");
  }
  return context;
}
