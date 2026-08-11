import { formatSayi } from "@/lib/sayi";

/**
 * Satır içi mini trend çizgisi.
 *
 * Tablo satırının sonunda "bu ölçüm nereye gidiyor?" sorusunu bir bakışta
 * yanıtlar. Eksen yok, etiket yok — tek işi yönü göstermek; kesin
 * değerler zaten aynı satırda yazılı.
 *
 * YORUM YOK: renk nötr, "iyi/kötü" belirtilmez (kilitli karar).
 */

const W = 72;
const H = 20;
const PAD = 2;

export function Sparkline({
  values,
  label,
}: {
  values: number[];
  /** Ekran okuyucu için bağlam; görsel olarak yazılmaz. */
  label: string;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const aralik = max - min || 1;

  const x = (i: number) =>
    PAD + (i / (values.length - 1)) * (W - PAD * 2);
  const y = (v: number) =>
    H - PAD - ((v - min) / aralik) * (H - PAD * 2);

  const d = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(v)}`).join(" ");
  const son = values[values.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label={`${label}: ${values.length} ölçüm, ${formatSayi(values[0])} ile ${formatSayi(son)} arasında`}
      className="shrink-0 overflow-visible"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--color-teal-600)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Son nokta işaretli: gözün nereye bakacağı belli olsun. */}
      <circle
        cx={x(values.length - 1)}
        cy={y(son)}
        r="2.5"
        fill="var(--color-teal-700)"
      />
    </svg>
  );
}
