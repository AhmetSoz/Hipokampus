/**
 * Kütüphanesiz grafik seti.
 *
 * Tek bir çizgi grafiği her veriyi anlatmıyor. Buradaki üç tip farklı
 * soruları yanıtlıyor:
 *   - `BarChart`   : kategoriler arası karşılaştırma (hangi konu daha çok?)
 *   - `ProgressRing`: bir bütünün ne kadarı tamamlandı?
 *   - `ScaleBar`   : 1-5 ölçek yanıtının nerede durduğu
 *
 * Ortak ilke (kilitli karar): hiçbir grafik PUAN/SKOR üretmez. Yalnızca
 * girilen ham veriyi gösterir; iyi/kötü yorumu yapılmaz, renk nötrdür.
 */

function formatSayi(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

/* ------------------------------------------------------------------ */

/** Yatay çubuk grafik — kategorileri karşılaştırmak için. */
export function BarChart({
  title,
  items,
  unit,
}: {
  title: string;
  items: { label: string; value: number }[];
  unit?: string;
}) {
  if (items.length === 0) return null;
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-xl border border-ink-200 bg-paper-warm p-4">
      <p className="mb-4 font-semibold text-ink-900">{title}</p>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-ink-800">{it.label}</span>
              <span className="shrink-0 font-semibold text-ink-900">
                {formatSayi(it.value)}
                {unit ? ` ${unit}` : ""}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-linear-to-r from-teal-500 to-teal-700 transition-[width] duration-[var(--dur-slow)] ease-[var(--ease-calm)]"
                style={{ width: `${(it.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Halka ilerleme — bir bütünün tamamlanan oranı. */
export function ProgressRing({
  done,
  total,
  label,
}: {
  done: number;
  total: number;
  label: string;
}) {
  const R = 34;
  const C = 2 * Math.PI * R;
  const oran = total > 0 ? done / total : 0;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-paper-warm p-4">
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
        <circle
          cx="44"
          cy="44"
          r={R}
          fill="none"
          stroke="var(--color-ink-100)"
          strokeWidth="10"
        />
        <circle
          cx="44"
          cy="44"
          r={R}
          fill="none"
          stroke="var(--color-teal-600)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - oran)}
          transform="rotate(-90 44 44)"
          className="transition-[stroke-dashoffset] duration-[var(--dur-slow)] ease-[var(--ease-calm)]"
        />
      </svg>
      <div>
        <p className="font-[family-name:var(--font-display)] text-3xl text-ink-900">
          {done}
          <span className="text-xl text-ink-500">/{total}</span>
        </p>
        <p className="text-ink-700">{label}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * 1-5 ölçek yanıtı için nokta göstergesi. Puan değildir — kullanıcının
 * kendi işaretlediği yanıtın nerede durduğunu gösterir.
 */
export function ScaleBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${value} / ${max}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          aria-hidden
          className={`block size-3 rounded-full ${
            n <= value ? "bg-teal-700" : "bg-ink-200"
          }`}
        />
      ))}
      <span className="ml-1 font-semibold text-ink-900">
        {value}
        <span className="font-normal text-ink-500">/{max}</span>
      </span>
    </span>
  );
}
