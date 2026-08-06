/**
 * Seans ölçümleri için bespoke, kütüphanesiz çizgi grafik.
 *
 * Sayıya çevrilebilen ölçümler zamana göre çizilir. Hesaplanan hiçbir
 * değer veritabanına yazılmaz — yalnızca burada, göstermek için türetilir
 * (bkz. data/sessions.ts). Bu bir SKOR DEĞİLDİR: uzmanın kendi girdiği
 * ham ölçümün zaman içindeki seyri.
 *
 * Tasarım kararları:
 *  - Eksen değerleri yazılır. Değersiz bir çizgi "yükseliyor" der ama
 *    neyden neye yükseldiğini söylemez; bakım bağlamında bu yetersiz.
 *  - Son değer büyük gösterilir ve ilk ölçüme göre değişim belirtilir —
 *    uzmanın asıl sorusu "şu an ne durumda ve ne kadar değişti".
 *  - Değişimin İYİ mi KÖTÜ mü olduğu YORUMLANMAZ; yön belirtilir, renk
 *    nötr kalır. Yorum uzmana aittir (kilitli karar: puan/değerlendirme
 *    üretilmez).
 */

const W = 320;
const H = 132;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

function formatSayi(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

export function SessionChart({
  label,
  unit,
  points,
}: {
  label: string;
  unit: string | null;
  points: { date: string; value: number }[];
}) {
  /* Kararlı sıralama: eşit tarihlerde girdi sırası korunur. Seri zaten
     eskiden yeniye kurulmuş olarak gelir (bkz. SessionLog). */
  const sorted = points
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.date.localeCompare(b.p.date) || a.i - b.i)
    .map(({ p }) => p);

  const values = sorted.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  /* Tüm değerler eşitse düz çizgi ortada dursun; aksi hâlde 0'a bölme
     ve kenara yapışma oluyor. */
  const flat = rawMax === rawMin;
  const min = flat ? rawMin - 1 : rawMin;
  const max = flat ? rawMax + 1 : rawMax;
  const span = max - min;

  const x = (i: number) =>
    PAD_L + (i / (sorted.length - 1 || 1)) * (W - PAD_L - PAD_R);
  const y = (v: number) =>
    H - PAD_B - ((v - min) / span) * (H - PAD_T - PAD_B);

  const coords = sorted.map((p, i) => ({ x: x(i), y: y(p.value) }));
  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const area =
    `M ${coords[0].x.toFixed(1)} ${(H - PAD_B).toFixed(1)} ` +
    coords.map((c) => `L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ") +
    ` L ${coords[coords.length - 1].x.toFixed(1)} ${(H - PAD_B).toFixed(1)} Z`;

  const ilk = sorted[0];
  const son = sorted[sorted.length - 1];
  const fark = son.value - ilk.value;
  const yon = fark > 0 ? "↑" : fark < 0 ? "↓" : "→";

  const tarih = (iso: string) =>
    new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <div className="rounded-xl border border-ink-200 bg-paper-warm p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-semibold text-ink-900">
          {label}
          {unit && <span className="font-normal text-ink-600"> ({unit})</span>}
        </p>
        <p className="text-ink-700">
          <span className="font-[family-name:var(--font-display)] text-2xl text-ink-900">
            {formatSayi(son.value)}
          </span>
          {sorted.length > 1 && (
            <span className="ml-2 text-base">
              {yon} {formatSayi(Math.abs(fark))} · {sorted.length} ölçüm
            </span>
          )}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full" role="img"
        aria-label={`${label}: ${formatSayi(ilk.value)} ile ${formatSayi(son.value)} arasında ${sorted.length} ölçüm`}
      >
        {/* Üst ve alt sınır çizgileri + değerleri */}
        {[max, min].map((v, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--color-ink-200)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={PAD_L - 6}
              y={y(v) + 4}
              textAnchor="end"
              className="fill-ink-500"
              style={{ fontSize: "11px" }}
            >
              {formatSayi(v)}
            </text>
          </g>
        ))}

        <path d={area} fill="var(--color-teal-500)" opacity="0.1" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-teal-600)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((c, i) => {
          const sonuncu = i === coords.length - 1;
          return (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={sonuncu ? 4.5 : 2.8}
              fill={sonuncu ? "var(--color-teal-700)" : "var(--color-teal-600)"}
              stroke={sonuncu ? "#fff" : "none"}
              strokeWidth={sonuncu ? 2 : 0}
            />
          );
        })}

        <text
          x={PAD_L}
          y={H - 6}
          className="fill-ink-500"
          style={{ fontSize: "11px" }}
        >
          {tarih(ilk.date)}
        </text>
        <text
          x={W - PAD_R}
          y={H - 6}
          textAnchor="end"
          className="fill-ink-500"
          style={{ fontSize: "11px" }}
        >
          {tarih(son.date)}
        </text>
      </svg>
    </div>
  );
}
