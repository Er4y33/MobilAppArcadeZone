// lib/useCeviri.ts
// Veritabanından gelen (çevirisi locale dosyalarında duran) metinler için hook'lar.
//
// NEDEN HOOK? Projede React Compiler açık (app.json → experiments.reactCompiler).
// Compiler, bir JSX parçasını yalnızca render sırasında OKUNAN değerler değişince
// yeniden hesaplar. `i18n.t(...)` doğrudan çağrılırsa dil bir bağımlılık sayılmaz,
// ekran dil değişince eski metinde donup kalır. Bu hook'lar `i18n.language`'i
// render sırasında okuyup bağımlılık hâline getirir.
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TaskDefinition } from "../constants/tasks_const";

/** Mağaza ürünleri: ad, açıklama ve unvan metni. */
export function useMagazaMetni() {
  const { t, i18n } = useTranslation();
  const dil = i18n.language;

  return useMemo(() => {
    const al = (anahtar: string, yedek: string | null) =>
      i18n.exists(anahtar) ? t(anahtar) : (yedek ?? "");

    return {
      /** magaza.urun.<id>.ad */
      ad: (id: string, yedek: string | null) =>
        al(`magaza.urun.${id}.ad`, yedek),
      /** magaza.urun.<id>.aciklama */
      aciklama: (id: string, yedek: string | null) =>
        al(`magaza.urun.${id}.aciklama`, yedek),
      /**
       * magaza.unvan.<id> — SADECE category === "badge" için.
       * Çerçevelerde `value` bir renk kodudur (#FFD700), asla çevrilmez.
       */
      unvan: (id: string, yedek: string | null) =>
        al(`magaza.unvan.${id}`, yedek),
    };
    // dil bilerek bağımlılıkta: dil değişince fonksiyonlar yenilenmeli
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n, dil]);
}

/** Haftalık görevler: başlık, açıklama ve kısa tarih. */
export function useGorevMetni() {
  const { t, i18n } = useTranslation();
  const dil = i18n.language;

  return useMemo(() => {
    return {
      baslik: (gorev: TaskDefinition) => t(`gorevler.liste.${gorev.id}.baslik`),
      aciklama: (gorev: TaskDefinition) =>
        t(`gorevler.liste.${gorev.id}.aciklama`),
      kisaTarih: (tarih: Date) =>
        `${tarih.getDate()} ${t(`aylar.${tarih.getMonth() + 1}`)}`,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n, dil]);
}
