/**
 * Seans ölçümleri için bespoke, kütüphanesiz bir çizgi grafik. Sayıya
 * çevrilebilen ölçüm değerleri zamana göre sıralanıp çizilir — hesaplanan
 * hiçbir değer veritabanına yazılmaz, yalnızca burada, görüntülemek için
 * türetilir (bkz. data/sessions.ts, SEANS NOTLARI notu).
 */
export function SessionChart({
  label,
  unit,
  points,
}: {
  label: string;
  unit: string | null;
  points: { date: string; value: number }[];
}) {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const W = 280;
  const H = 88;
  const pad = 12;

  const coords = sorted.map((p, i) => {
    const x =
      pad + (i / (sorted.length - 1 || 1)) * (W - pad * 2);
    const y = H - pad - ((p.value - min) / span) * (H - pad * 2);
    return { x, y };
  });
  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const first = sorted[0];
  const last = sorted.at(-1);

  return (
    <div className="rounded-xl border border-ink-200 bg-paper-warm p-4">
      <p className="mb-2 text-base font-semibold text-ink-900">
        {label}
        {unit && <span className="font-normal text-ink-600"> ({unit})</span>}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-20 w-full" preserveAspectRatio="none">
        <path
          d={path}
          fill="none"
          stroke="var(--color-teal-600)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={2.6} fill="var(--color-teal-700)" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-base text-ink-600">
        <span>
          {first &&
            new Date(first.date).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
            })}
        </span>
        <span>
          {last &&
            new Date(last.date).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
            })}
        </span>
      </div>
    </div>
  );
}
