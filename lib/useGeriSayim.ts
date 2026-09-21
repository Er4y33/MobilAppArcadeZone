import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Oyun öncesi 3-2-1 geri sayımı.
 * - baslat(): her çağrıldığında sayımı SIFIRDAN başlatır (sayım sürerken bile)
 * - iptal(): bekleyen sayımı durdurur (Zorluk/Mod Değiştir için)
 * - onBitti: sayım bitince bir kez çalışır
 * - onTik: her sayıda çalışır (ses/titreşim için, isteğe bağlı)
 */
export function useGeriSayim(
  onBitti: () => void,
  onTik?: (kalan: number) => void,
  sure = 3,
) {
  const [kalan, setKalan] = useState<number | null>(null);
  const [tur, setTur] = useState(0); // aynı değerle yeniden başlatmayı garanti eder
  const onBittiRef = useRef(onBitti);
  const onTikRef = useRef(onTik);

  // Her render'da en güncel fonksiyonları sakla (eski state'e takılmasın)
  useEffect(() => {
    onBittiRef.current = onBitti;
    onTikRef.current = onTik;
  });

  useEffect(() => {
    if (kalan === null) return;

    if (kalan === 0) {
      setKalan(null);
      onBittiRef.current();
      return;
    }

    onTikRef.current?.(kalan);
    const t = setTimeout(
      () => setKalan((k) => (k === null ? null : k - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [kalan, tur]);

  const baslat = useCallback(() => {
    setKalan(sure);
    setTur((t) => t + 1);
  }, [sure]);

  const iptal = useCallback(() => setKalan(null), []);

  return { kalan, aktif: kalan !== null, baslat, iptal };
}
