import type { NeedAreaId } from "@/data/types";

/**
 * İhtiyaç başlığı simgeleri.
 *
 * Amaç: metnin yanında küçük bir görsel dayanak. Sahibinin isteği:
 * "sağda solda küçük görsel destekler, estetiği ve sadeliği bozmadan."
 *
 * Hepsi elle çizildi ve marka diline bağlı: 24x24 kutu, 1.7px yuvarlak
 * uçlu tek çizgi, dolgu yok, renk `currentColor`. Logonun ve arka plan
 * ağının çizgi kalınlığıyla aynı aileden; kütüphane eklenmedi çünkü
 * hazır ikon setleri bu dile yabancı duruyor.
 *
 * Dekoratiftir: her zaman `aria-hidden`. Anlamı yanındaki metin taşır.
 */

const S = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const PATHS: Record<NeedAreaId, React.ReactNode> = {
  /* Günlük yaşam — alışveriş filesi ve içindekiler */
  gunluk: (
    <>
      <path d="M5 8h14l-1.3 11.2a1.5 1.5 0 0 1-1.5 1.3H7.8a1.5 1.5 0 0 1-1.5-1.3Z" {...S} />
      <path d="M9 8V6.2A3 3 0 0 1 12 3.2a3 3 0 0 1 3 3V8" {...S} />
      <path d="M10 12.5v4M14 12.5v4" {...S} />
    </>
  ),

  /* Ev güvenliği — ev ve tutunma barı */
  "ev-guvenlik": (
    <>
      <path d="M4 10.5 12 4l8 6.5" {...S} />
      <path d="M6 10v9.5h12V10" {...S} />
      <path d="M9 16.5h6" {...S} />
      <path d="M9 14.8v3.4M15 14.8v3.4" {...S} />
    </>
  ),

  /* Hafıza — markanın iz çizgisi: kıvrımdan açılan yol ve duraklar */
  hafiza: (
    <>
      <path d="M4 17c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-5 5-5" {...S} />
      <circle cx="4" cy="17" r="1.3" {...S} />
      <circle cx="19" cy="12" r="1.6" {...S} />
      <path d="M8.5 7.5c0-1.6 1.3-2.9 2.9-2.9s2.9 1.3 2.9 2.9" {...S} />
    </>
  ),

  /* Sağlık koordinasyonu — takvim ve onay */
  "saglik-koordinasyon": (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" {...S} />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" {...S} />
      <path d="M9 15l2 2 4-4" {...S} />
    </>
  ),

  /* Yakının yükü — omuzda taşınan ağırlık */
  "bakim-veren": (
    <>
      <circle cx="9" cy="6" r="2.6" {...S} />
      <path d="M4.5 20v-4a4.5 4.5 0 0 1 4.5-4.5" {...S} />
      <path d="M13.5 13.5h6M13.5 13.5v5.5h6v-5.5" {...S} />
      <path d="M16.5 11v2.5" {...S} />
    </>
  ),

  /* Sosyal bağ — iki kişi ve aralarındaki bağ */
  sosyal: (
    <>
      <circle cx="7" cy="8" r="2.6" {...S} />
      <circle cx="17" cy="8" r="2.6" {...S} />
      <path d="M3 19v-2.2A3.8 3.8 0 0 1 6.8 13h.4" {...S} />
      <path d="M21 19v-2.2A3.8 3.8 0 0 0 17.2 13h-.4" {...S} />
      <path d="M9.8 16.5h4.4" {...S} />
    </>
  ),

  /* Seçenekler — dallanan yollar */
  secenekler: (
    <>
      <path d="M12 20.5V13" {...S} />
      <path d="M12 13 6.5 8M12 13l5.5-5" {...S} />
      <circle cx="6" cy="6.5" r="2" {...S} />
      <circle cx="18" cy="6.5" r="2" {...S} />
      <circle cx="12" cy="21" r="1.4" {...S} />
    </>
  ),

  /* Aile içi karar — karşılıklı konuşma */
  "aile-karar": (
    <>
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 12 13H8l-3.5 2.6V13a2.5 2.5 0 0 1-1-2Z" {...S} />
      <path d="M17.5 9.5h.5A2.5 2.5 0 0 1 20.5 12v3a2.5 2.5 0 0 1-1 2v2.4L16.5 17H13" {...S} />
    </>
  ),
};

export function NeedIcon({
  area,
  className = "size-6",
}: {
  area: NeedAreaId;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {PATHS[area]}
    </svg>
  );
}
