/**
 * Ölçüm etiketi normalizasyonu ve seri kurma — SAF MANTIK.
 *
 * `data/measurements.ts` `server-only` işaretli olduğu için bu dosyadan
 * ayrıldı: buradaki fonksiyonların hiçbiri veritabanına dokunmuyor ve
 * test edilebilir olmaları gerekiyor. Projede aynı ayrım `data/auth.ts`
 * ile `data/password.ts` arasında da var.
 */

import { sayiyaCevir } from "@/lib/sayi";
import type { SessionNote } from "@/data/types";

export type Alias = {
  id: string;
  rawLabel: string;
  canonicalLabel: string;
  canonicalUnit: string | null;
};

export type OlcumNoktasi = {
  tarih: string;
  deger: number;
  sessionId: string;
  conversationId: string;
  /** Bu noktanın seans notunda yazan gerçek etiketi. */
  hamEtiket: string;
};

export type OlcumSerisi = {
  anahtar: string;
  gosterilenEtiket: string;
  birim: string | null;
  noktalar: OlcumNoktasi[];
  /** Bu seride kaç farklı ham etiket birleşti. 1 ise birleşme yok. */
  hamEtiketSayisi: number;
};

export type BirlesmeOnerisi = {
  anahtar: string;
  hamEtiketler: string[];
  /** Öneri kabul edilirse kullanılacak etiket: en çok geçen yazım. */
  onerilenEtiket: string;
  onerilenBirim: string | null;
};

/* ------------------------------------------------------------------ */
/* Etiket anahtarı — saf fonksiyon, hiçbir şey yazılmaz                 */

/** Ölçüm etiketlerinde anlam taşımayan, yazımdan yazıma değişen ekler. */
const GURULTU = new Set([
  "süresi",
  "süre",
  "mesafesi",
  "mesafe",
  "sayısı",
  "sayisi",
  "sayı",
  "adedi",
  "adet",
  "değeri",
  "degeri",
  "değer",
  "ölçümü",
  "olcumu",
  "ölçüm",
  "testi",
  "test",
]);

/**
 * İki etiketin "aynı ölçüm" olup olmadığını sınamak için türetilen
 * anahtar. Geçmişe dönük çalışır; veritabanına hiçbir şey yazmaz.
 *
 * "Tek ayak durma süresi" ve "tek ayak durma" → ikisi de `ayak|durma|tek`
 *
 * `toLocaleLowerCase("tr")` ŞART: varsayılan `toLowerCase()` Türkçe'de
 * "I" → "i" yapar (doğrusu "ı") ve "İ" → "i̇" gibi bileşik üretir; bu da
 * aynı kelimeyi iki farklı anahtara düşürür.
 *
 * AKSAN SADELEŞTİRMESİ YAPILMAZ. Türkçe'de ı/i, o/ö, u/ü anlam ayırır;
 * NFKD ile katlamak gerçekten farklı iki ölçümü yanlışlıkla birleştirir.
 *
 * Kelimeler alfabetik sıralanıyor: sıra değişikliği de yakalanır
 * ("durma süresi tek ayak" aynı anahtara düşer) ve algoritma
 * açıklanabilir kalır — uzmana "neden bunları önerdik" denebilir.
 */
export function etiketAnahtari(label: string): string {
  return label
    .toLocaleLowerCase("tr")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((k) => k.length > 0 && !GURULTU.has(k))
    .sort((a, b) => a.localeCompare(b, "tr"))
    .join("|");
}

/* ------------------------------------------------------------------ */
/* Seri kurma — saf fonksiyonlar                                        */

/**
 * Seans notlarından birleşik ölçüm serileri çıkarır.
 *
 * Gruplama önce alias'a, alias yoksa ham etikete bakar. Türetilmiş
 * anahtar burada KULLANILMAZ — o yalnızca öneri üretmek için. Aksi
 * hâlde sistem onaysız birleştirme yapmış olurdu.
 */
export function birlesikSeriler(
  sessions: SessionNote[],
  aliases: Alias[],
): OlcumSerisi[] {
  const aliasHarita = new Map(aliases.map((a) => [a.rawLabel, a]));
  const seriler = new Map<string, OlcumSerisi & { hamEtiketler: Set<string> }>();

  /* Eskiden yeniye: grafikler zamanı soldan sağa okuyor. Seans listesi
     ekranda yeniden eskiye sıralı geldiği için ters çevriliyor. */
  for (const s of [...sessions].reverse()) {
    for (const m of s.measurements) {
      const deger = sayiyaCevir(m.value);
      if (deger === null) continue;

      const alias = aliasHarita.get(m.label);
      const anahtar = alias?.canonicalLabel ?? m.label;
      const gosterilen = alias?.canonicalLabel ?? m.label;
      const birim = alias?.canonicalUnit ?? m.unit;

      let seri = seriler.get(anahtar);
      if (!seri) {
        seri = {
          anahtar,
          gosterilenEtiket: gosterilen,
          birim,
          noktalar: [],
          hamEtiketSayisi: 0,
          hamEtiketler: new Set(),
        };
        seriler.set(anahtar, seri);
      }
      seri.hamEtiketler.add(m.label);
      seri.noktalar.push({
        tarih: s.occurredAt,
        deger,
        sessionId: s.id,
        conversationId: s.conversationId,
        hamEtiket: m.label,
      });
    }
  }

  return [...seriler.values()]
    .map(({ hamEtiketler, ...seri }) => ({
      ...seri,
      hamEtiketSayisi: hamEtiketler.size,
    }))
    /* Çok noktalı seriler önce: trend gösterebilenler yukarıda dursun. */
    .sort((a, b) => b.noktalar.length - a.noktalar.length);
}

/**
 * "Bu ikisi aynı ölçüm mü?" önerileri.
 *
 * Aynı türetilmiş anahtara düşen ama farklı yazılmış, henüz
 * birleştirilmemiş etiketleri bulur.
 */
export function birlesmeOnerileri(
  sessions: SessionNote[],
  aliases: Alias[],
): BirlesmeOnerisi[] {
  const birlesmis = new Set(aliases.map((a) => a.rawLabel));

  /* anahtar -> ham etiket -> (kaç kez geçti, son birim) */
  const gruplar = new Map<string, Map<string, { adet: number; birim: string | null }>>();

  for (const s of sessions) {
    for (const m of s.measurements) {
      if (birlesmis.has(m.label)) continue;
      if (sayiyaCevir(m.value) === null) continue;

      const anahtar = etiketAnahtari(m.label);
      if (!anahtar) continue;

      const grup = gruplar.get(anahtar) ?? new Map();
      const mevcut = grup.get(m.label) ?? { adet: 0, birim: m.unit };
      grup.set(m.label, { adet: mevcut.adet + 1, birim: mevcut.birim ?? m.unit });
      gruplar.set(anahtar, grup);
    }
  }

  const oneriler: BirlesmeOnerisi[] = [];
  for (const [anahtar, grup] of gruplar) {
    if (grup.size < 2) continue;

    const sirali = [...grup.entries()].sort((a, b) => b[1].adet - a[1].adet);
    oneriler.push({
      anahtar,
      hamEtiketler: sirali.map(([etiket]) => etiket),
      /* En çok kullanılan yazım öneriliyor: uzmanın alışkanlığı bu. */
      onerilenEtiket: sirali[0][0],
      onerilenBirim: sirali.find(([, v]) => v.birim)?.[1].birim ?? null,
    });
  }
  return oneriler;
}
