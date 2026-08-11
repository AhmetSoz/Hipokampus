import { expect, test } from "@playwright/test";
import {
  dakikaToSaat,
  gunEkle,
  gunGecerliMi,
  saatToDakika,
  trGun,
  trHaftaBasi,
  trHaftaGunu,
  trYerelToUTC,
} from "../src/lib/zaman";
import { etiketAnahtari } from "../src/lib/olcum";

/**
 * Saf mantık testleri — tarayıcı gerektirmez.
 *
 * Bunlar sürekli bozulan iki yerin bekçisi: saat dilimi çevrimi ve
 * ölçüm etiketi normalizasyonu. İkisi de sessizce yanlış çalışabilecek
 * türden kod (yanlış sonuç da "makul" görünüyor), bu yüzden testleri
 * ekran testlerinden daha değerli.
 */

test.describe("saat dilimi", () => {
  test("Türkiye duvar saati doğru UTC anına çevrilir", () => {
    /* Bu, canlıda yakalanan gerçek hatanın bekçisi: uzmanın yazdığı
       14:00, sunucu UTC olduğu için 14:00Z olarak kaydediliyor ve
       danışana 17:00 görünüyordu. */
    expect(trYerelToUTC("2026-08-12", 840).toISOString()).toBe(
      "2026-08-12T11:00:00.000Z",
    );
  });

  test("gece yarısı bir önceki güne taşar", () => {
    expect(trYerelToUTC("2026-01-01", 0).toISOString()).toBe(
      "2025-12-31T21:00:00.000Z",
    );
  });

  test("gidiş-dönüş kayıpsız", () => {
    for (const gun of ["2026-01-01", "2026-06-15", "2026-12-31"]) {
      expect(trGun(trYerelToUTC(gun, 600))).toBe(gun);
    }
  });

  test("UTC'de geç saat, Türkiye'de ertesi gün sayılır", () => {
    expect(trGun("2026-08-12T22:30:00.000Z")).toBe("2026-08-13");
  });

  test("hafta pazartesiden başlar", () => {
    expect(trHaftaGunu("2026-08-17")).toBe(1);
    expect(trHaftaGunu("2026-08-16")).toBe(7);
    /* Pazar günü, BİR ÖNCEKİ pazartesiye ait olmalı — 0=Pazar düzeni
       kullanılsaydı burada bir hafta ileri kayardı. */
    expect(trHaftaBasi("2026-08-16")).toBe("2026-08-10");
  });

  test("gün aritmetiği ay ve yıl sınırlarını geçer", () => {
    expect(gunEkle("2026-08-31", 1)).toBe("2026-09-01");
    expect(gunEkle("2026-01-01", -1)).toBe("2025-12-31");
    expect(gunEkle("2028-02-28", 1)).toBe("2028-02-29");
  });

  test("saat ayrıştırma geçersiz girdiyi reddeder", () => {
    expect(saatToDakika("14:00")).toBe(840);
    expect(dakikaToSaat(840)).toBe("14:00");
    expect(saatToDakika("25:00")).toBeNull();
    expect(saatToDakika("abc")).toBeNull();
    expect(gunGecerliMi("2026-02-31")).toBe(false);
  });
});

test.describe("ölçüm etiketi normalizasyonu", () => {
  const ayni = (a: string, b: string) =>
    expect(etiketAnahtari(a)).toBe(etiketAnahtari(b));
  const farkli = (a: string, b: string) =>
    expect(etiketAnahtari(a)).not.toBe(etiketAnahtari(b));

  test("ölçüm gürültüsü kelimeleri düşer", () => {
    ayni("Tek ayak durma süresi", "tek ayak durma");
    ayni("Yürüme mesafesi", "yürüme");
    ayni("Adım sayısı", "adım");
  });

  test("kelime sırası ve fazladan boşluk önemsiz", () => {
    ayni("Tek ayak durma süresi", "durma tek ayak");
    ayni("Yürüme mesafesi", "  Yürüme   Mesafesi ");
  });

  test("Türkçe küçültme kuralı uygulanır", () => {
    /* Varsayılan toLowerCase() "IŞIK"ı "işik" yapar ve aynı kelimeyi
       iki farklı anahtara düşürür. */
    ayni("IŞIK", "ışık");
    ayni("İLK", "ilk");
  });

  test("noktalı/noktasız harfler KATLANMAZ", () => {
    /* Türkçe'de ı/i anlam ayırır; NFKD ile katlamak gerçekten farklı
       iki ölçümü yanlışlıkla birleştirirdi. */
    farkli("Sıcaklık", "Sicaklik");
    farkli("Sol el kavrama", "Sağ el kavrama");
  });
});
