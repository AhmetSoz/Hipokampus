/**
 * Marka çizgisi — dekoratif, tek seferlik.
 *
 * Bir "bulanık gradyan lekesi" DEĞİL. Logo Konsept 3 "Hafıza Yolu"nun
 * kendi hikâyesini büyük ölçekte tekrarlıyor: belirsiz bir kıvrımla
 * başlar (süreç belirsizlikle başlar), açılıp netleşen bir çizgiye
 * dönüşür ve tek bir uç noktada durur (yön bulma). Metnin okunabilirliğini
 * bozmaması için çok ince ve düşük opaklıkta.
 *
 * Yalnızca kilitli iki renk (turkuaz + açık mavi) kullanılır. Bulanıklık/
 * blur yok — net bir çizgi, kendinden emin.
 */
export function BrandPath({
  className = "",
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none ${className}`}
    >
      {/* Belirsiz başlangıç — açılan bir kıvrım */}
      <path
        d="M188 108
           C138 118,120 168,150 196
           C176 220,214 208,220 180
           C224 160,204 148,190 160"
        stroke="var(--color-teal-700)"
        strokeOpacity="0.16"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className={animate ? "hk-draw-path" : undefined}
        style={animate ? ({ "--hk-len": 260 } as React.CSSProperties) : undefined}
      />

      {/* Netleşen yol */}
      <path
        d="M190 160
           C280 232,344 118,486 258
           C626 396,782 176,982 318
           C1128 420,1224 300,1372 336"
        stroke="var(--color-teal-700)"
        strokeOpacity="0.16"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        className={animate ? "hk-draw-path" : undefined}
        style={animate ? ({ "--hk-len": 1900 } as React.CSSProperties) : undefined}
      />

      {/* Hafıza işaretleri — yol üzerindeki duraklar */}
      <circle cx="486" cy="258" r="4" fill="var(--color-sky-500)" opacity="0.4" />
      <circle cx="782" cy="176" r="3.5" fill="var(--color-teal-600)" opacity="0.3" />
      <circle cx="982" cy="318" r="4" fill="var(--color-sky-500)" opacity="0.4" />

      {/* Uç nokta — yön bulma */}
      <circle
        cx="1372"
        cy="336"
        r="7"
        fill="var(--color-teal-700)"
        className={animate ? "hk-draw-mark" : undefined}
      />
      <circle
        cx="1372"
        cy="336"
        r="14"
        fill="var(--color-teal-500)"
        opacity="0.18"
        className={animate ? "hk-draw-mark" : undefined}
      />
    </svg>
  );
}
