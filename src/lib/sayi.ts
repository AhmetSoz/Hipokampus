/**
 * Ölçüm değerlerinin sayıya çevrilmesi ve gösterimi.
 *
 * NEDEN: `Number(value.replace(",", "."))` deseni `SessionLog` içinde üç
 * kez, `SessionChart` ve `Charts` içinde birer kez kopyalanmıştı. Ölçüm
 * serileri artık dosyalar arasında birleştirileceği için (birleşik trend)
 * bu mantığın tek yerden okunması şart: iki kopya biraz farklı davranırsa
 * aynı ölçüm iki farklı seriye düşer.
 *
 * Ölçüm değerleri serbest metindir — uzman "12,5" de yazabilir "12.5" de.
 * Değer alanı bilerek `text`; birim ve biçim uzmanın kendi kararı ve
 * DB'de hesaplanmış hiçbir sayı tutulmuyor (bkz. karar kaydı, seans notu).
 */

/**
 * Ölçüm değerini sayıya çevirir. Sayısal değilse `null`.
 *
 * `null` dönüyor, `NaN` değil: `NaN` sessizce yayılıp grafiklerde boş
 * eksene dönüşüyordu. `null` çağıranı kontrol etmeye zorluyor.
 */
export function sayiyaCevir(deger: string): number | null {
  const temiz = deger.trim().replace(/\s/g, "").replace(",", ".");
  if (!temiz) return null;
  /* `Number("")` 0 verir, `Number("1a")` NaN verir — ikisini de eliyoruz.
     Yalnızca düz ondalık sayı kabul: bilimsel gösterim ve altçizgi
     ayırıcı bu bağlamda yazım hatasıdır, sayı değil. */
  if (!/^-?\d+(\.\d+)?$/.test(temiz)) return null;
  const n = Number(temiz);
  return Number.isFinite(n) ? n : null;
}

/**
 * Sayıyı Türkçe biçimde gösterir: 12.5 -> "12,5".
 * Gereksiz sıfır basmaz (12 -> "12", 12.50 -> "12,5").
 */
export function formatSayi(n: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(n);
}

/**
 * İki ölçüm arasındaki farkı işaretiyle gösterir: "+2,5" / "−1" / "0".
 *
 * Eksi işareti U+2212 (gerçek matematik eksisi), tire değil — rakamla
 * aynı yükseklikte durur ve ekran okuyucu "eksi" diye okur.
 *
 * YORUM YOK: yalnızca yön ve miktar verilir; "iyileşme"/"gerileme" gibi
 * bir değerlendirme üretilmez (kilitli karar: puan/skor yok, yorumu
 * uzman yapar).
 */
export function formatFark(fark: number): string {
  if (fark === 0) return "0";
  return fark > 0 ? `+${formatSayi(fark)}` : `−${formatSayi(Math.abs(fark))}`;
}
