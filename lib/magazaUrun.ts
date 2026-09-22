// lib/magazaUrun.ts
// Mağaza ürünlerinin adı/açıklaması veritabanında Türkçe duruyor.
// Çeviri varsa onu, yoksa veritabanından geleni gösteriyoruz.
import i18n from "./i18n";

function ceviriVeyaYedek(anahtar: string, yedek: string | null): string {
  if (i18n.exists(anahtar)) {
    const deger = i18n.t(anahtar);
    if (typeof deger === "string" && deger.length > 0) return deger;
  }
  return yedek ?? "";
}

/** Ürün adı: magaza.urun.<id>.ad */
export function urunAdi(id: string, yedek: string | null): string {
  return ceviriVeyaYedek(`magaza.urun.${id}.ad`, yedek);
}

/** Ürün açıklaması: magaza.urun.<id>.aciklama */
export function urunAciklama(id: string, yedek: string | null): string {
  return ceviriVeyaYedek(`magaza.urun.${id}.aciklama`, yedek);
}

/**
 * Unvan (badge) metni: magaza.unvan.<id>
 * DİKKAT: Çerçevelerde `value` bir renk kodudur (#FFD700), asla çevrilmez.
 * Bu fonksiyon yalnızca category === "badge" için kullanılmalıdır.
 */
export function unvanMetni(id: string, yedek: string | null): string {
  return ceviriVeyaYedek(`magaza.unvan.${id}`, yedek);
}
