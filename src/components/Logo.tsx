/**
 * Konsept 3 — "Hafıza Yolu" sembolü.
 *
 * ÖNEMLİ: Bu, tasarımcının vektör kaynağı gelene kadar kullanılacak elde
 * çizilmiş bir YAKLAŞIMDIR. Konsept 3'ün dört anlam katmanını taşır:
 *   1. Ana kontur  → denizatı hissi (kimlik & doğa)
 *   2. İç kıvrım   → hipokampüs kıvrımı (hafıza merkezi)
 *   3. İz çizgisi  → deneyimlerin izi (yol & öğrenme)
 *   4. Uç nokta    → yön bulma (yön & gelecek)
 * Orijinal .svg/.ai dosyası geldiğinde bu bileşenin içi onunla değiştirilmeli;
 * dışarıya verdiği arayüz (props) aynı kalabilir.
 */

type LogoProps = {
  /** Piksel cinsinden yükseklik. Genişlik orana göre hesaplanır. */
  size?: number;
  /** İz çizgisi ve uç nokta gösterilsin mi. Küçük ölçekte kapatın. */
  showTrail?: boolean;
  /** Açılışta izin çizilme hareketi oynatılsın mı. */
  animate?: boolean;
  className?: string;
};

export function LogoMark({
  size = 40,
  showTrail = true,
  animate = false,
  className,
}: LogoProps) {
  const width = showTrail ? (size * 132) / 124 : (size * 86) / 124;

  return (
    <svg
      role="img"
      aria-label="Hipokampüs sembolü"
      viewBox={showTrail ? "0 0 132 124" : "0 0 86 124"}
      width={width}
      height={size}
      fill="none"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 1 — Ana kontur: baş, sırt ve kuyruk sarmalı */}
        <path d="M14 44C20 32 31 23 44 22c12-1 21 8 22 19 1 12 4 20 5 30 1 13-4 25-14 33-9 7-20 8-25 1-4-7 0-15 8-14 7 1 9 9 4 12" />

        {/* Baş üstü tarak (denizatı sırtı) */}
        <path d="M35 25l3-6M45 22l2-7M55 25l3-6" strokeWidth="3" />

        {/* Çene ve gövde ön hattı */}
        <path d="M14 44c8 5 17 6 24 4 6-2 10 2 10 8 0 9-4 17-3 26" />

        {/* 2 — İç kıvrım: hipokampüs / hafıza merkezi */}
        <path d="M46 58c-1-10 7-16 14-12 7 4 6 15-2 16-5 1-8-4-4-7" />

        {showTrail && (
          <>
            {/* 3 — İz çizgisi: deneyimlerin izi */}
            <path
              d="M58 104c14 4 30 2 44-4"
              className={animate ? "hk-draw" : undefined}
              style={animate ? ({ "--hk-dash": 60 } as React.CSSProperties) : undefined}
            />
            {/* 4 — Uç nokta: yön bulma */}
            <circle
              cx="112"
              cy="98"
              r="4"
              stroke="var(--color-sand-400)"
              strokeWidth="4"
            />
          </>
        )}

        {/* Göz */}
        <circle cx="47" cy="33" r="1.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Sembol + kelime markası. Başlık ve altbilgide kullanılır. */
export function Logo({
  size = 36,
  showTrail = false,
  animate = false,
  className,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark size={size} showTrail={showTrail} animate={animate} />
      <span
        className="font-[family-name:var(--font-display)] tracking-tight text-ink-900"
        style={{ fontSize: size * 0.72 }}
      >
        Hipokampüs
      </span>
    </span>
  );
}
