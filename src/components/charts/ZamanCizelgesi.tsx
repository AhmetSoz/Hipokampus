import { trTarih } from "@/lib/zaman";

/**
 * "Ne zaman ne oldu?" — seans, randevu, form ve plan maddesi tek eksende.
 *
 * TASARIM: gerçek içerik bir `<ul>`; SVG yalnızca dekoratif katman.
 * Böylece klavye gezinmesi, ekran okuyucu ve metin büyütme kendiliğinden
 * çalışıyor — grafiği erişilebilir kılmaya çalışmak yerine grafiği
 * erişilebilir bir listenin üstüne çiziyoruz.
 *
 * Olay türleri ŞEKİLLE ayrılıyor, renkle değil (WCAG 1.4.1): renk körü
 * bir kullanıcı için de seansla randevu ayırt edilebilir kalıyor.
 */

export type ZamanOlayi = {
  id: string;
  tarih: string;
  tur: "seans" | "randevu" | "form" | "plan";
  baslik: string;
  /** İkincil satır: dosya adı, durum vb. */
  detay?: string;
};

const TUR: Record<
  ZamanOlayi["tur"],
  { ad: string; simge: React.ReactNode }
> = {
  seans: {
    ad: "Seans",
    simge: <circle cx="9" cy="9" r="5" />,
  },
  randevu: {
    ad: "Görüşme",
    simge: <rect x="4" y="4" width="10" height="10" rx="1.5" />,
  },
  form: {
    ad: "Form",
    simge: <path d="M9 3.5 15 14.5 3 14.5Z" />,
  },
  plan: {
    ad: "Plan maddesi",
    simge: <rect x="4" y="7" width="10" height="4" rx="2" />,
  },
};

export function ZamanCizelgesi({ olaylar }: { olaylar: ZamanOlayi[] }) {
  if (olaylar.length === 0) {
    return <p className="text-ink-600">Henüz kayıtlı bir olay yok.</p>;
  }

  const sirali = [...olaylar].sort((a, b) => b.tarih.localeCompare(a.tarih));

  return (
    <div>
      {/* Şekil anahtarı: simgelerin ne anlama geldiği yazılı olmalı. */}
      <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2">
        {(Object.keys(TUR) as ZamanOlayi["tur"][]).map((t) => (
          <li key={t} className="flex items-center gap-2 text-base text-ink-600">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <g fill="var(--color-teal-600)">{TUR[t].simge}</g>
            </svg>
            {TUR[t].ad}
          </li>
        ))}
      </ul>

      <ul className="relative space-y-4 border-l-2 border-ink-200 pl-7">
        {sirali.map((o) => (
          <li key={o.id} className="relative">
            {/* Eksen üzerindeki işaret; listenin dışına taşıyor. */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              aria-hidden
              className="absolute top-1 -left-[2.4rem] rounded-full bg-paper"
            >
              <g fill="var(--color-teal-600)">{TUR[o.tur].simge}</g>
            </svg>
            <p className="text-base text-ink-600">
              {trTarih(o.tarih)}
              <span className="sr-only"> — {TUR[o.tur].ad}</span>
            </p>
            <p className="font-semibold text-ink-900">{o.baslik}</p>
            {o.detay && <p className="text-base text-ink-600">{o.detay}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
