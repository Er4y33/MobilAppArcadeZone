import * as Haptics from "expo-haptics";

/**
 * Titreşim sarmalayıcısı.
 *
 * Oyun dosyaları doğrudan expo-haptics çağırmak yerine buradaki
 * fonksiyonları kullanır. Kullanıcı ayarlardan titreşimi kapattığında
 * tek bir yerden hepsi susar.
 *
 * enabled değeri HapticsContext tarafından güncellenir.
 */

let enabled = true;

export function setHapticsEnabled(value: boolean) {
  enabled = value;
}

export function getHapticsEnabled() {
  return enabled;
}

/** Doğru cevap, eşleşme, tur tamamlandı */
export function hapticSuccess() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/** Yanlış cevap, erken dokunma, hata */
export function hapticError() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/** Süre doldu, zaman aşımı */
export function hapticWarning() {
  if (!enabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/** Buton, kart çevirme, seçim */
export function hapticLight() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/** Daha belirgin uyarı (tepki oyununda yeşile dönüş) */
export function hapticMedium() {
  if (!enabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
