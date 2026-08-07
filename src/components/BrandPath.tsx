/**
 * Marka arka planı — "Hafıza Ağı".
 *
 * Bulanık gradyan lekesi DEĞİL. Logo Konsept 3 "Hafıza Yolu"nun hikâyesi
 * sayfa ölçeğinde sürüyor: belirsiz bir kıvrımla başlayan yol açılıyor,
 * üzerindeki hafıza noktalarından sinir uçları (dendrit) her yöne
 * dallanıyor. Hafıza bir nokta değil, bağlantıdır.
 *
 * Logoyla AYNI renkte (petrol turkuaz) ve logo çizilirken EŞ ZAMANLI
 * çiziliyor: sayfa açıldığında üstte marka elle yazılırken arka planda da
 * ağ örülüyor. Bunun için ağ da stroke-dashoffset ile "çizilir", solarak
 * belirmez.
 *
 * Ağ deterministik olarak üretilir (sabit tohumlu PRNG): sunucu ve
 * istemci birebir aynı çıktıyı verir, hidrasyon uyuşmazlığı olmaz.
 * `Math.random()` kullanılmamasının sebebi budur.
 */

const VB_W = 1440;
const VB_H = 640;

/** mulberry32 — küçük, hızlı, deterministik. */
function makeRng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Node = { x: number; y: number };
type Edge = { d: string; len: number };
type Filament = { d: string; tip: Node };

/**
 * Ağı bir kez, modül yüklenirken kurar. Düğümler gevşek bir ızgaraya
 * serpilir (tamamen rastgele dağıtım kümelenme yapıyordu); her düğüm
 * yakın komşularına hafif kavisli bağlarla bağlanır ve etrafına dendrit
 * saçar.
 */
function buildNetwork() {
  const rnd = makeRng(20260806);
  const COLS = 6;
  const ROWS = 3;
  const nodes: Node[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cellW = VB_W / COLS;
      const cellH = VB_H / ROWS;
      nodes.push({
        x: Math.round(cellW * (c + 0.5) + (rnd() - 0.5) * cellW * 0.75),
        y: Math.round(cellH * (r + 0.5) + (rnd() - 0.5) * cellH * 0.8),
      });
    }
  }

  // Bağlar: her düğüm, kendisinden sonraki en yakın iki düğüme bağlanır.
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const others = nodes
      .map((b, j) => ({ b, j, dist: Math.hypot(b.x - a.x, b.y - a.y) }))
      .filter((o) => o.j > i && o.dist < 420)
      .sort((p, q) => p.dist - q.dist)
      .slice(0, 2);

    for (const o of others) {
      const mx = (a.x + o.b.x) / 2 + (rnd() - 0.5) * 90;
      const my = (a.y + o.b.y) / 2 + (rnd() - 0.5) * 90;
      edges.push({
        d: `M ${a.x} ${a.y} Q ${Math.round(mx)} ${Math.round(my)} ${o.b.x} ${o.b.y}`,
        len: o.dist,
      });
    }
  }

  // Dendritler: her düğümden 3-5 kısa dal, uçlarında sinaps noktası.
  const filaments: Filament[] = [];
  for (const n of nodes) {
    const count = 3 + Math.floor(rnd() * 3);
    const base = rnd() * Math.PI * 2;
    for (let k = 0; k < count; k++) {
      const angle = base + (k / count) * Math.PI * 2 + (rnd() - 0.5) * 0.7;
      const len = 46 + rnd() * 62;
      const ex = Math.round(Math.cos(angle) * len);
      const ey = Math.round(Math.sin(angle) * len);
      // Kontrol noktası dalı hafifçe büküyor — düz çizgi mekanik duruyor.
      const cx = Math.round(ex * 0.45 + (rnd() - 0.5) * 34);
      const cy = Math.round(ey * 0.45 + (rnd() - 0.5) * 34);
      filaments.push({
        d: `M ${n.x} ${n.y} q ${cx} ${cy} ${ex} ${ey}`,
        tip: { x: n.x + ex, y: n.y + ey },
      });
    }
  }

  return { nodes, edges, filaments };
}

const NET = buildNetwork();

/* Logo çizimi ~2.94 sn sürüyor; ağ da aynı pencereye yayılıyor ki ikisi
   birlikte örülüyormuş gibi görünsün. */
const SPAN = 2.9;

export function BrandPath({
  className = "",
  animate = false,
  soften = true,
}: {
  className?: string;
  animate?: boolean;
  /**
   * Metin bölgesinde ağı soluklaştırır. Sayfalarda metin sola hizalı
   * olduğu için soldan sağa açılan bir maske kullanılıyor: yoğunluk
   * düşmüyor, yalnızca yazının arkasında geri çekiliyor.
   */
  soften?: boolean;
}) {
  const mask = soften
    ? "linear-gradient(to right, rgba(0,0,0,0.28), rgba(0,0,0,0.45) 34%, rgba(0,0,0,0.85) 62%, #000 82%)"
    : undefined;
  const drawn = (delay: number) =>
    animate
      ? { className: "hk-net-draw", style: { animationDelay: `${delay.toFixed(2)}s` } }
      : {};
  const popped = (delay: number) =>
    animate
      ? { className: "hk-net-node", style: { animationDelay: `${delay.toFixed(2)}s` } }
      : {};

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      /* `hk-net-arrive`: sayfa değişiminde ağ da bir sinyal geçiyormuş
         gibi kısaca parlıyor. Bileşen her gezinmede yeniden kurulduğu
         için animasyon kendiliğinden tekrar çalışıyor. */
      className={`pointer-events-none hk-net-arrive ${className}`}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    >
      {/* Bağlar — ağın omurgası */}
      <g stroke="var(--color-teal-700)" fill="none" strokeLinecap="round">
        {NET.edges.map((e, i) => (
          <path
            key={`e${i}`}
            d={e.d}
            strokeWidth="1.6"
            strokeOpacity="0.3"
            pathLength={1}
            {...drawn((i / NET.edges.length) * SPAN * 0.7)}
          />
        ))}
      </g>

      {/* Dendritler — her yöne saçılan sinir uçları */}
      <g stroke="var(--color-teal-600)" fill="none" strokeLinecap="round">
        {NET.filaments.map((f, i) => (
          <path
            key={`f${i}`}
            d={f.d}
            strokeWidth="1.2"
            strokeOpacity="0.26"
            pathLength={1}
            {...drawn(0.25 + (i / NET.filaments.length) * SPAN)}
          />
        ))}
      </g>

      {/* Sinaps uçları */}
      <g fill="var(--color-sky-500)">
        {NET.filaments.map((f, i) => (
          <circle
            key={`t${i}`}
            cx={f.tip.x}
            cy={f.tip.y}
            r="2.4"
            opacity="0.42"
            {...popped(0.6 + (i / NET.filaments.length) * SPAN)}
          />
        ))}
      </g>

      {/* Düğümler — hafıza noktaları. Çok yavaş nefes alıyorlar. */}
      <g>
        {NET.nodes.map((n, i) => (
          <g key={`n${i}`} {...popped(0.4 + (i / NET.nodes.length) * SPAN * 0.8)}>
            <circle
              cx={n.x}
              cy={n.y}
              r="11"
              fill="var(--color-teal-500)"
              opacity="0.12"
              className="hk-net-breathe"
              style={{ animationDelay: `${(i % 6) * 1.7}s` }}
            />
            <circle cx={n.x} cy={n.y} r="4.5" fill="var(--color-teal-700)" opacity="0.5" />
          </g>
        ))}
      </g>

      {/*
        SİNAPS AKIŞI — ağ çizildikten sonra susmuyor, sakin bir şekilde
        yaşamaya devam ediyor. Sahibinin isteği: "sürekli çalışmalı ama
        smooth olmalı, göz yoracak karman çorman değil."

        Denge: AZ ama OKUNUR. On tane soluk nokta gürültü gibi duruyordu;
        altı tane belirgin nokta kasıtlı bir doku gibi duruyor. Bağların
        her beşincisinde tek nokta, 16-26 saniyelik turlarla ve geniş
        aralıklı gecikmelerle.
      */}
      <g className="hk-net-pulse">
        {NET.edges
          .filter((_, i) => i % 5 === 0)
          .map((e, i) => {
            const sure = 16 + (i % 4) * 3.5;
            const basla = SPAN + i * 2.4;
            return (
              <circle key={`p${i}`} r="3.4" fill="var(--color-teal-600)" opacity="0">
                <animateMotion
                  dur={`${sure}s`}
                  begin={`${basla}s`}
                  repeatCount="indefinite"
                  path={e.d}
                  calcMode="linear"
                />
                {/* Uçlarda beliriyor ve sönüyor — sert giriş/çıkış olmasın. */}
                <animate
                  attributeName="opacity"
                  values="0;0.75;0.75;0"
                  keyTimes="0;0.12;0.88;1"
                  dur={`${sure}s`}
                  begin={`${basla}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
      </g>
    </svg>
  );
}
