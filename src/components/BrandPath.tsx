/**
 * Marka çizgisi — dekoratif, tek seferlik.
 *
 * Bir "bulanık gradyan lekesi" DEĞİL. Logo Konsept 3 "Hafıza Yolu"nun
 * kendi hikâyesini büyük ölçekte tekrarlıyor: belirsiz bir kıvrımla
 * başlar (süreç belirsizlikle başlar), açılıp netleşen bir çizgiye
 * dönüşür ve tek bir uç noktada durur (yön bulma). Metnin okunabilirliğini
 * bozmaması için çok ince ve düşük opaklıkta.
 *
 * Yol üzerindeki hafıza noktalarından sinir ucu (dendrit) dalları açılır —
 * logonun sonundaki dağılma efektiyle AYNI görsel dil. Amaç bir "beyin
 * çizimi" yapmak değil: hafızanın nokta değil bağlantı olduğunu ima eden
 * seyrek bir ağ. Bu yüzden dal sayısı bilerek az ve opaklık çok düşük.
 *
 * Yalnızca kilitli iki renk (turkuaz + açık mavi) kullanılır. Bulanıklık/
 * blur yok — net çizgiler, kendinden emin.
 */

/** Bir hafıza noktasından açılan sinir ucu demeti. */
function Dendrite({
  x,
  y,
  branches,
  animate,
  delay,
}: {
  x: number;
  y: number;
  /** [kontrolX, kontrolY, uçX, uçY] — noktaya göreli. */
  branches: [number, number, number, number][];
  animate: boolean;
  delay: number;
}) {
  return (
    <g
      className={animate ? "hk-brand-dendrite" : undefined}
      style={animate ? { animationDelay: `${delay}s` } : undefined}
    >
      {branches.map(([cx, cy, ex, ey], i) => (
        <g key={i}>
          <path
            d={`M ${x} ${y} q ${cx} ${cy} ${ex} ${ey}`}
            stroke="var(--color-teal-600)"
            strokeOpacity="0.14"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx={x + ex}
            cy={y + ey}
            r="2.6"
            fill="var(--color-sky-500)"
            opacity="0.22"
          />
        </g>
      ))}
    </g>
  );
}

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

      {/* Sinir uçları — hafıza noktaları birer bağlantı düğümü */}
      <Dendrite
        x={486}
        y={258}
        animate={animate}
        delay={2.4}
        branches={[
          [-18, -30, -40, -58],
          [-34, -10, -74, -14],
          [-14, 26, -30, 54],
        ]}
      />
      <Dendrite
        x={782}
        y={176}
        animate={animate}
        delay={2.6}
        branches={[
          [16, -32, 34, -62],
          [40, -8, 88, -10],
          [12, 30, 26, 62],
          [-20, -26, -46, -46],
        ]}
      />
      <Dendrite
        x={982}
        y={318}
        animate={animate}
        delay={2.8}
        branches={[
          [-16, 30, -36, 60],
          [22, 28, 48, 56],
          [34, -14, 76, -22],
        ]}
      />

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

      {/* Uç noktadan açılan dağılma — logonun sonundaki efektin büyük
          ölçekli karşılığı: yol bir noktada bitmiyor, bağlantıya dönüşüyor. */}
      <Dendrite
        x={1372}
        y={336}
        animate={animate}
        delay={3.0}
        branches={[
          [22, -34, 48, -64],
          [42, -6, 92, -8],
          [20, 32, 44, 66],
          [4, -40, 10, -78],
          [8, 36, 18, 74],
        ]}
      />
    </svg>
  );
}
