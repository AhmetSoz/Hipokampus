/**
 * Yığılı çubuk — kategori × durum dağılımı.
 *
 * Örn. "plan maddeleri hangi alanda, hangi durumda". Tek çubukta üç
 * durum yan yana; toplam da okunabiliyor.
 *
 * ÜÇÜNCÜ SERİ İÇİN RENK EKLENMİYOR: palet turkuaz + açık mavi ile sınırlı
 * (turuncu yasağı, karanlık mod yok). Üçüncü ayrım SVG `<pattern>` ile
 * çapraz tarama olarak yapılıyor — renk sayısını artırmadan ayırt
 * edilebilirlik, üstelik renk körlüğüne de dayanıklı (WCAG 1.4.1).
 *
 * ORAN/YÜZDE YAZILMAZ: yalnızca ham sayılar. Bir "tamamlanma yüzdesi"
 * göstermek, yasaklanmış skorun kılık değiştirmiş hâli olurdu.
 */

export type YigiliSeri = { ad: string; degerler: number[] };

const DOLGU = [
  "var(--color-teal-700)",
  "var(--color-sky-500)",
  "url(#hk-tarama)",
] as const;

export function YigiliCubuk({
  seriEtiketleri,
  satirlar,
}: {
  /** En fazla üç: renk paleti bilinçli olarak dar. */
  seriEtiketleri: string[];
  satirlar: YigiliSeri[];
}) {
  const enBuyuk = Math.max(
    1,
    ...satirlar.map((s) => s.degerler.reduce((a, b) => a + b, 0)),
  );

  return (
    <div>
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <pattern
            id="hk-tarama"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="var(--color-teal-100)" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke="var(--color-teal-600)"
              strokeWidth="2.5"
            />
          </pattern>
        </defs>
      </svg>

      <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2">
        {seriEtiketleri.map((e, i) => (
          <li key={e} className="flex items-center gap-2 text-base text-ink-700">
            <svg width="14" height="14" aria-hidden>
              <rect width="14" height="14" rx="3" fill={DOLGU[i]} />
            </svg>
            {e}
          </li>
        ))}
      </ul>

      <ul className="space-y-3">
        {satirlar.map((satir) => {
          const toplam = satir.degerler.reduce((a, b) => a + b, 0);
          return (
            <li key={satir.ad}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-ink-900">{satir.ad}</span>
                <span className="text-base text-ink-600">
                  {satir.degerler
                    .map((d, i) => (d > 0 ? `${seriEtiketleri[i]}: ${d}` : null))
                    .filter(Boolean)
                    .join(" · ") || "kayıt yok"}
                </span>
              </div>
              <svg
                viewBox={`0 0 ${enBuyuk} 1`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`${satir.ad}: ${satir.degerler
                  .map((d, i) => `${seriEtiketleri[i]} ${d}`)
                  .join(", ")}`}
                className="h-5 w-full overflow-hidden rounded-md bg-ink-100"
              >
                {satir.degerler.map((d, i) => {
                  const oncekiler = satir.degerler
                    .slice(0, i)
                    .reduce((a, b) => a + b, 0);
                  if (d === 0) return null;
                  return (
                    <rect
                      key={i}
                      x={oncekiler}
                      y={0}
                      width={d}
                      height={1}
                      fill={DOLGU[i]}
                    />
                  );
                })}
              </svg>
              <span className="sr-only">Toplam {toplam}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
