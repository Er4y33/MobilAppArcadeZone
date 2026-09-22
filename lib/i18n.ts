import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18next, { changeLanguage } from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

// Yeni dil eklemek için: locales/xx.json oluştur, buraya iki satır ekle
export const DILLER = [
  { kod: "tr", ad: "Türkçe", bayrak: "🇹🇷" },
  { kod: "en", ad: "English", bayrak: "🇬🇧" },
] as const;

export type DilKodu = (typeof DILLER)[number]["kod"];

const KAYNAKLAR = {
  tr: { translation: tr },
  en: { translation: en },
};

const DEPO_ANAHTARI = "app_language";
const YEDEK_DIL: DilKodu = "en";

function desteklenenMi(kod: string | null | undefined): kod is DilKodu {
  return !!kod && DILLER.some((d) => d.kod === kod);
}

/**
 * Uygulama açılışında bir kez çağrılır.
 * Sıra: kayıtlı tercih → cihaz dili → yedek dil
 */
export async function dilBaslat(): Promise<DilKodu> {
  let kod: string | null = null;

  try {
    kod = await AsyncStorage.getItem(DEPO_ANAHTARI);
  } catch {
    // depolama okunamadı, cihaz diline düşeceğiz
  }

  if (!desteklenenMi(kod)) {
    const cihaz = Localization.getLocales()[0]?.languageCode;
    kod = desteklenenMi(cihaz) ? cihaz : YEDEK_DIL;
  }

  if (!i18next.isInitialized) {
    // i18next.use(...) — düz `use` olarak çağrılamaz, eslint onu React hook'u sanıyor.
    // eslint-disable-next-line import/no-named-as-default-member
    await i18next.use(initReactI18next).init({
      resources: KAYNAKLAR,
      lng: kod,
      fallbackLng: YEDEK_DIL,
      interpolation: { escapeValue: false },
      returnNull: false,
    });
  } else {
    await changeLanguage(kod);
  }

  return kod as DilKodu;
}

/** Ayarlar ekranından dil değiştirir ve tercihi kaydeder */
export async function dilDegistir(kod: DilKodu) {
  await changeLanguage(kod);
  try {
    await AsyncStorage.setItem(DEPO_ANAHTARI, kod);
  } catch {
    // kaydedilemedi; bu oturumda dil yine de değişti
  }
}

export function aktifDil(): DilKodu {
  const k = i18next.language?.split("-")[0];
  return desteklenenMi(k) ? k : YEDEK_DIL;
}

export default i18next;
