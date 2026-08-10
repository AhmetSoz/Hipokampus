import { randomUUID } from "node:crypto";

/**
 * Kayıt kimliği üretir.
 *
 * NEDEN: Projede kimlikler `\`m${Date.now()}\`` deseniyle üretiliyordu.
 * Aynı milisaniyede gelen iki istek aynı kimliği üretir ve birincil
 * anahtar çakışır. Randevu slotu rezervasyonu tam olarak eşzamanlı istek
 * senaryosu olduğu için bu artık teorik bir risk değil.
 *
 * Biçim: `<önek><zaman36><rastgele8>` — örn. `r1a2b3c4d5e6f7g8`.
 * Zaman parçası korunuyor çünkü kimlikler kabaca sıralı kalınca hem
 * indeks yerelliği hem de kayıtlara elle bakarken okunabilirlik iyi
 * oluyor; çakışmayı önleyen kısım sondaki rastgele ektir.
 *
 * SINIR: yalnızca SUNUCU EYLEMLERİNDE çağrılır, render sırasında ASLA.
 * Render'da rastgelelik üretmek sunucu ve istemci çıktısını ayırır
 * (hidrasyon uyuşmazlığı) — projenin `Math.random` yasağının dayandığı
 * gerekçenin aynısı.
 */
export function yeniId(onEk: string): string {
  return `${onEk}${Date.now().toString(36)}${randomUUID().replace(/-/g, "").slice(0, 8)}`;
}
