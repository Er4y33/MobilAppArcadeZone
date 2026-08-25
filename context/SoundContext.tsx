import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

export type SesTuru = "click" | "correct" | "wrong" | "win" | "tick";

const SES_DOSYALARI: Record<SesTuru, any> = {
  click: require("../assets/sounds/click.mp3"),
  correct: require("../assets/sounds/correct.mp3"),
  wrong: require("../assets/sounds/wrong.mp3"),
  win: require("../assets/sounds/win.mp3"),
  tick: require("../assets/sounds/tick.mp3"),
};

const MUZIK_DOSYASI = require("../assets/sounds/music.mp3");

const SES_ANAHTARI = "ses_acik";
const MUZIK_ANAHTARI = "muzik_acik";

const EFEKT_SES_SEVIYESI = 0.7;
const MUZIK_SES_SEVIYESI = 0.25; // fon müziği efektlerin altında kalmalı

type SoundContextType = {
  sesAcik: boolean;
  muzikAcik: boolean;
  sesAyarla: (acik: boolean) => void;
  muzikAyarla: (acik: boolean) => void;
  cal: (tur: SesTuru) => void;
};

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [sesAcik, setSesAcik] = useState(true);
  const [muzikAcik, setMuzikAcik] = useState(true);

  // cal() ve AppState içinde güncel değeri okumak için
  const sesAcikRef = useRef(true);
  const muzikAcikRef = useRef(true);

  const seslerRef = useRef<Partial<Record<SesTuru, Audio.Sound>>>({});
  const muzikRef = useRef<Audio.Sound | null>(null);
  const muzikHazirRef = useRef(false);

  // Kayıtlı tercihleri oku
  useEffect(() => {
    AsyncStorage.multiGet([SES_ANAHTARI, MUZIK_ANAHTARI]).then((ciftler) => {
      ciftler.forEach(([anahtar, deger]) => {
        if (deger === null) return;
        const acik = deger === "1";
        if (anahtar === SES_ANAHTARI) {
          setSesAcik(acik);
          sesAcikRef.current = acik;
        } else {
          setMuzikAcik(acik);
          muzikAcikRef.current = acik;
        }
      });
    });
  }, []);

  // Ses dosyalarını belleğe yükle
  useEffect(() => {
    let iptal = false;

    const yukle = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        // Efektler
        for (const tur of Object.keys(SES_DOSYALARI) as SesTuru[]) {
          const { sound } = await Audio.Sound.createAsync(SES_DOSYALARI[tur], {
            volume: EFEKT_SES_SEVIYESI,
          });
          if (iptal) {
            await sound.unloadAsync();
            return;
          }
          seslerRef.current[tur] = sound;
        }

        // Fon müziği — döngüde
        const { sound: muzik } = await Audio.Sound.createAsync(MUZIK_DOSYASI, {
          volume: MUZIK_SES_SEVIYESI,
          isLooping: true,
        });
        if (iptal) {
          await muzik.unloadAsync();
          return;
        }
        muzikRef.current = muzik;
        muzikHazirRef.current = true;

        if (muzikAcikRef.current) {
          await muzik.playAsync();
        }
      } catch (e) {
        console.warn("Sesler yüklenemedi:", e);
      }
    };

    yukle();

    return () => {
      iptal = true;
      Object.values(seslerRef.current).forEach((s) => s?.unloadAsync());
      seslerRef.current = {};
      muzikRef.current?.unloadAsync();
      muzikRef.current = null;
      muzikHazirRef.current = false;
    };
  }, []);

  // Uygulama arka plana alınınca müziği durdur, dönünce devam ettir
  useEffect(() => {
    const dinleyici = (durum: AppStateStatus) => {
      if (!muzikRef.current || !muzikHazirRef.current) return;

      if (durum === "active") {
        if (muzikAcikRef.current) {
          muzikRef.current.playAsync().catch(() => {});
        }
      } else {
        muzikRef.current.pauseAsync().catch(() => {});
      }
    };

    const abone = AppState.addEventListener("change", dinleyici);
    return () => abone.remove();
  }, []);

  const cal = useCallback((tur: SesTuru) => {
    if (!sesAcikRef.current) return;
    const ses = seslerRef.current[tur];
    if (!ses) return;

    // Baştan çal — üst üste basmalarda kesip yeniden başlatır
    ses.replayAsync().catch(() => {
      // ses hazır değilse sessizce geç, oyunu bozma
    });
  }, []);

  const sesAyarla = useCallback((acik: boolean) => {
    setSesAcik(acik);
    sesAcikRef.current = acik;
    AsyncStorage.setItem(SES_ANAHTARI, acik ? "1" : "0");
  }, []);

  const muzikAyarla = useCallback((acik: boolean) => {
    setMuzikAcik(acik);
    muzikAcikRef.current = acik;
    AsyncStorage.setItem(MUZIK_ANAHTARI, acik ? "1" : "0");

    if (!muzikRef.current || !muzikHazirRef.current) return;
    if (acik) {
      muzikRef.current.playAsync().catch(() => {});
    } else {
      muzikRef.current.pauseAsync().catch(() => {});
    }
  }, []);

  const value = useMemo(
    () => ({ sesAcik, muzikAcik, sesAyarla, muzikAyarla, cal }),
    [sesAcik, muzikAcik, sesAyarla, muzikAyarla, cal],
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within SoundProvider");
  }
  return context;
}