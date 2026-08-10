/**
 * SAAT DİLİMİ — TEK KAPI.
 *
 * Bu dosya projedeki bütün tarih/saat dönüşümlerinin geçtiği yerdir.
 *
 * KURAL 1: `zaman.ts` dışında `toLocaleString` / `toLocaleDateString` /
 * `toLocaleTimeString` ÇAĞRILMAZ. Bu çağrılar çalıştıkları yerin saat
 * dilimini kullanır: sunucu bileşeninde Vercel'in UTC'si, istemci
 * bileşeninde kullanıcının tarayıcısı. Aynı veri iki yerde iki farklı
 * saat gösterir ve istemci bileşenlerinde hidrasyon uyuşmazlığı üretir —
 * `Math.random` yasağıyla tam olarak aynı kategoriden bir hata.
 *
 * KURAL 2: `new Date("2026-08-12T14:00")` biçiminde OFSETSİZ ayrıştırma
 * KULLANILMAZ. ECMAScript bu biçimi "yerel saat" sayar. Sunucu UTC
 * olduğu için uzmanın yazdığı 14:00, 14:00Z olarak kaydedilir ve
 * Türkiye'de 17:00 görünür. Yerelden UTC'ye geçmek için `trYerelToUTC`.
 *
 * TERİMLER
 * - "an" (instant): mutlak bir zaman noktası. `Date`, DB'de `timestamp`.
 *   Örnek: `appointments.startsAt`.
 * - "duvar saati" (wall time): takvimdeki gün + saat. Saat dilimi olmadan
 *   bir ana karşılık gelmez. Örnek: müsaitlik kuralındaki "her pazartesi
 *   10:00" — bu bir niyet, bir an değil.
 *
 * Müsaitlik kuralları duvar saati saklar, randevular an saklar; ikisi
 * arasındaki çeviri yalnızca buradan geçer.
 */

/** IANA saat dilimi. Uzmanlar bugün yalnızca Türkiye'de. */
export const SAAT_DILIMI = "Europe/Istanbul";

/**
 * Formatlayıcılar pahalıdır ve seçenek kümesi tekrar eder; anahtara göre
 * önbelleğe alınıyor. Modül düzeyinde tutmak güvenli — durum taşımazlar.
 */
const bicimlendiriciler = new Map<string, Intl.DateTimeFormat>();

function bicimlendirici(opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const anahtar = JSON.stringify(opts);
  let mevcut = bicimlendiriciler.get(anahtar);
  if (!mevcut) {
    mevcut = new Intl.DateTimeFormat("tr-TR", {
      timeZone: SAAT_DILIMI,
      ...opts,
    });
    bicimlendiriciler.set(anahtar, mevcut);
  }
  return mevcut;
}

/**
 * Türkiye saatiyle biçimlendirir. Projedeki tüm `toLocale*` çağrılarının
 * yerine geçer. Sunucuda da istemcide de aynı sonucu verir.
 */
export function trFormat(
  an: Date | string | number,
  opts: Intl.DateTimeFormatOptions,
): string {
  return bicimlendirici(opts).format(new Date(an));
}

/* ------------------------------------------------------------------ */
/* An  ->  Türkiye duvar saati                                          */

/**
 * Bir anın Türkiye'deki parçaları. `Intl` üzerinden okunuyor çünkü
 * `Date.getHours()` çalıştığı makinenin saat dilimini kullanır.
 */
function trParcalar(an: Date): {
  yil: number;
  ay: number;
  gun: number;
  saat: number;
  dakika: number;
} {
  const parts = bicimlendirici({
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(an);

  const al = (tip: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === tip)?.value ?? "0");

  /* `hour12: false` bazı ortamlarda gece yarısını "24" verir. */
  const saat = al("hour") % 24;

  return {
    yil: al("year"),
    ay: al("month"),
    gun: al("day"),
    saat,
    dakika: al("minute"),
  };
}

/**
 * Verilen an için Türkiye'nin UTC ofseti (dakika). Sabit +180 YAZILMADI:
 * Türkiye 2016'dan beri kalıcı UTC+3, yani bugün ikisi aynı sonucu verir —
 * ama sabit sayı, kural bir gün değişirse sessizce yanlış çalışan kod
 * bırakır. `Intl` çalışma zamanının IANA veritabanını kullanır ve
 * kendiliğinden doğru kalır.
 */
export function trOfsetDakika(an: Date | string | number): number {
  const d = new Date(an);
  const p = trParcalar(d);
  /* Türkiye'deki duvar saatini UTC'ymiş gibi kurup gerçek anla farkını
     alıyoruz; kalan tam olarak ofsettir. */
  const sanki = Date.UTC(p.yil, p.ay - 1, p.gun, p.saat, p.dakika);
  /* Saniye ve altını at: ofset her zaman tam dakikadır, kalanı fark
     hesabına gürültü katar. */
  const gercek = Math.floor(d.getTime() / 60000) * 60000;
  return Math.round((sanki - gercek) / 60000);
}

function ikiHane(n: number): string {
  return String(n).padStart(2, "0");
}

/** Anın Türkiye takvimindeki günü: "YYYY-MM-DD". */
export function trGun(an: Date | string | number): string {
  const p = trParcalar(new Date(an));
  return `${p.yil}-${ikiHane(p.ay)}-${ikiHane(p.gun)}`;
}

/** Anın Türkiye'deki gün-içi dakikası: 0–1439. */
export function trDakika(an: Date | string | number): number {
  const p = trParcalar(new Date(an));
  return p.saat * 60 + p.dakika;
}

/* ------------------------------------------------------------------ */
/* Türkiye duvar saati  ->  an                                          */

/**
 * Türkiye takvim günü + gün-içi dakikasından mutlak anı üretir.
 *
 * İki adımlı: ofset, çevirmek istediğimiz anın kendisine bağlıdır
 * (yaz saati uygulaması geri gelirse geçiş gününde değişir). Önce kaba
 * bir tahminle bir an kurup o anın gerçek ofsetini okuyoruz, sonra
 * onunla düzeltiyoruz. Bu, geçiş sınırında bile doğru sonuç verir.
 */
export function trYerelToUTC(gun: string, dakika: number): Date {
  const [yil, ay, gunNo] = gun.split("-").map(Number);
  const kaba = Date.UTC(yil, ay - 1, gunNo, 0, dakika);
  const ofset = trOfsetDakika(new Date(kaba));
  return new Date(kaba - ofset * 60000);
}

/* ------------------------------------------------------------------ */
/* Gün ve hafta aritmetiği — hepsi "YYYY-MM-DD" dizesi üzerinde          */

/**
 * ISO hafta günü: 1 = Pazartesi … 7 = Pazar. Türkiye'de hafta pazartesi
 * başlar; `Date.getUTCDay()`'in 0 = Pazar düzeni doğrudan kullanılmıyor.
 */
export function trHaftaGunu(gun: string): number {
  const [yil, ay, gunNo] = gun.split("-").map(Number);
  const d = new Date(Date.UTC(yil, ay - 1, gunNo));
  return d.getUTCDay() === 0 ? 7 : d.getUTCDay();
}

/**
 * Gün ekler/çıkarır. UTC gece yarısıyla yürüyor; sonuç yine takvim günü
 * olarak okunduğu için saat dilimi sarkması olmaz.
 */
export function gunEkle(gun: string, n: number): string {
  const [yil, ay, gunNo] = gun.split("-").map(Number);
  const d = new Date(Date.UTC(yil, ay - 1, gunNo));
  d.setUTCDate(d.getUTCDate() + n);
  return `${d.getUTCFullYear()}-${ikiHane(d.getUTCMonth() + 1)}-${ikiHane(d.getUTCDate())}`;
}

/** İçinde bulunduğu haftanın pazartesisi. */
export function trHaftaBasi(gun: string): string {
  return gunEkle(gun, -(trHaftaGunu(gun) - 1));
}

/** Pazartesiden itibaren 7 günün listesi. */
export function haftaGunleri(pazartesi: string): string[] {
  return Array.from({ length: 7 }, (_, i) => gunEkle(pazartesi, i));
}

/** Bugünün Türkiye takvim günü. */
export function bugunTr(): string {
  return trGun(new Date());
}

/** "YYYY-MM-DD" biçimi ve gerçek bir takvim günü mü? */
export function gunGecerliMi(gun: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun)) return false;
  const [yil, ay, gunNo] = gun.split("-").map(Number);
  const d = new Date(Date.UTC(yil, ay - 1, gunNo));
  return (
    d.getUTCFullYear() === yil &&
    d.getUTCMonth() === ay - 1 &&
    d.getUTCDate() === gunNo
  );
}

/* ------------------------------------------------------------------ */
/* Gün-içi dakikanın gösterimi                                          */

/** 840 -> "14:00". Duvar saati değerleri için; an için `trSaat`. */
export function dakikaToSaat(dakika: number): string {
  return `${ikiHane(Math.floor(dakika / 60))}:${ikiHane(dakika % 60)}`;
}

/** "14:00" -> 840. Geçersizse `null`. */
export function saatToDakika(saat: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(saat.trim());
  if (!m) return null;
  const s = Number(m[1]);
  const d = Number(m[2]);
  if (s > 23 || d > 59) return null;
  return s * 60 + d;
}

/* ------------------------------------------------------------------ */
/* Sık kullanılan gösterim biçimleri                                    */

/** "12 Ağustos 2026 Çarşamba" */
export function trUzunTarih(an: Date | string | number): string {
  return trFormat(an, {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

/** "12 Ağustos, 14:00" */
export function trTarihSaat(an: Date | string | number): string {
  return trFormat(an, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "14:00" */
export function trSaat(an: Date | string | number): string {
  return trFormat(an, { hour: "2-digit", minute: "2-digit" });
}

/** "12 Ağustos 2026" */
export function trTarih(an: Date | string | number): string {
  return trFormat(an, { day: "numeric", month: "long", year: "numeric" });
}

/** "12 Ağu" — dar alanlar (grafik ekseni, tablo) için. */
export function trKisaTarih(an: Date | string | number): string {
  return trFormat(an, { day: "numeric", month: "short" });
}
