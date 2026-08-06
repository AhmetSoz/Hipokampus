import Image from "next/image";
import {
  HK_LOCKUP_STROKES,
  HK_LOCKUP_TIP,
  HK_LOCKUP_TOTAL_DURATION,
} from "./hk-lockup-trace";

/**
 * Marka kilidi (lockup) ve sembolü.
 *
 * Varlıklar tasarımcı teslimlerinden üretilir; elle çizilmiş yaklaşım
 * bunların YERİNE KULLANILMAZ. Kaynak dosyalar `logo/` klasöründe, üretim
 * betiği `scripts/prepare-logo.mjs`. Kaynaklar değişirse betiği yeniden
 * çalıştırın.
 *
 * Varyant seçimi zemine göre yapılır:
 *   açık zemin  → "lockup" / "symbol"          (petrol turkuaz #0E5C63)
 *   petrol/koyu → "lockupReverse" / "symbolReverse" (beyaz + kum uç nokta)
 *
 * Ters varyant, tasarımcının kum rengi uç noktasını ("yön bulma") içerir;
 * açık zemin varyantı tek renktir. İkisi de teslim edilen dosyalara sadıktır.
 *
 * `hk-lockup-trace.ts`, `logo-lockup.png`'nin potrace ile çıkarılmış anahat
 * parçalarıdır (her alt-yol/subpath ayrı) — YALNIZCA `animate` açılış
 * efektindeki kalem-çizim maskesi için kullanılır, gerçek logonun yerine
 * geçmez (bkz. üstteki not). SVG'de stroke-dasharray her subpath'in
 * BAŞINDA sıfırlanır (spec gereği); bu yüzden tek bir birleşik path yerine
 * her parça kendi <path>'i olarak, gerçek uzunluğuyla orantılı gecikme ve
 * süreyle art arda çiziliyor — aksi halde tüm parçalar aynı anda "birden"
 * çizilmiş gibi görünüyordu. Kaynak PNG değişirse bu iz de yeniden
 * üretilmelidir (bkz. scratchpad'teki trace-lockup.mjs + measure-subpaths.mjs
 * betikleri, potrace ile).
 */

const ASSETS = {
  lockup: { src: "/brand/logo-lockup.png", width: 535, height: 220 },
  lockupReverse: {
    src: "/brand/logo-lockup-reverse.png",
    width: 574,
    height: 220,
  },
  symbol: { src: "/brand/logo-symbol.png", width: 180, height: 320 },
  symbolReverse: {
    src: "/brand/logo-symbol-reverse.png",
    width: 181,
    height: 320,
  },
} as const;

export type LogoVariant = keyof typeof ASSETS;

export function Logo({
  variant = "lockup",
  className = "h-12",
  priority = false,
  decorative = false,
  animate = false,
}: {
  variant?: LogoVariant;
  /**
   * Görüntülenme yüksekliği Tailwind sınıfıyla verilir (`h-12`, `h-14 sm:h-16`).
   * Genişlik her zaman orana göre hesaplanır. Ekran boyutuna göre değişebilsin
   * diye sabit piksel yerine sınıf kullanılıyor.
   */
  className?: string;
  priority?: boolean;
  /** Yanında zaten "Hipokampüs" yazıyorsa true verin. */
  decorative?: boolean;
  /**
   * Bir kerelik "elle çiziliyor" açılış efekti: gerçek logonun anahat
   * izi (`hk-lockup-trace.ts`) bir SVG maskesinde kalem gibi çizilir,
   * arkadaki gerçek PNG yalnızca kalemin geçtiği yerlerde açığa çıkar.
   * Şu an yalnızca `variant="lockup"` için gerçek iz var; sabit bir maske
   * kimliği kullanır, bu yüzden sayfada tek sefer kullanın (header gibi).
   * Diğer varyantlarda basit üstten-alta açılışa düşer.
   */
  animate?: boolean;
}) {
  const asset = ASSETS[variant];

  if (animate && variant === "lockup") {
    /* Kalem, çizimi bitirdiği yerden son harfin ("s") görsel ucuna
       kayar; dağılma oradan başlar. İzin son parçası kapalı bir kontur
       olduğu için kendi bitişi ucu değil — bu yüzden uca giden kısa bir
       çizgi ekliyoruz. */
    const penPath =
      HK_LOCKUP_STROKES.map((s) => s.d).join(" ") +
      ` L ${HK_LOCKUP_TIP.x} ${HK_LOCKUP_TIP.y}`;

    /* Sinir ucu filamentleri: uçtan dışarı açılan dallar. Sade kalsın
       diye altı tane, koordinatlar uca göreli. Bir kısmı ikinci bir dal
       veriyor (çatallanma) — dendrit hissini tek başına uzunluk değil,
       bu dallanma veriyor. */
    const filaments = [
      { c: [14, -15], e: [33, -26], fork: [12, -3] },
      { c: [17, -4], e: [38, -7] },
      { c: [14, 10], e: [32, 20], fork: [11, 6] },
      { c: [3, -17], e: [10, -33] },
      { c: [4, 14], e: [11, 28] },
      { c: [16, 2], e: [36, 6] },
    ];
    // Filamentler sağa taşıyor; görünüm alanını biraz genişletiyoruz.
    const PAD = 46;
    const vbW = asset.width + PAD;

    return (
      <span
        className={`relative inline-block w-auto ${className}`}
        style={{ aspectRatio: `${vbW} / ${asset.height}` }}
      >
        <svg
          viewBox={`0 0 ${vbW} ${asset.height}`}
          className="block h-full w-full"
          role={decorative ? undefined : "img"}
          aria-label={decorative ? undefined : "Hipokampüs"}
          aria-hidden={decorative || undefined}
        >
          <defs>
            <mask id="hk-lockup-reveal" maskUnits="userSpaceOnUse">
              {HK_LOCKUP_STROKES.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={11}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  className="hk-lockup-stroke"
                  style={{
                    animationDelay: `${s.delay}s`,
                    animationDuration: `${s.duration}s`,
                  }}
                />
              ))}
            </mask>
          </defs>
          <image
            href={asset.src}
            width={asset.width}
            height={asset.height}
            mask="url(#hk-lockup-reveal)"
          />
          {/* Dağılma: uçtan açılan sinir ucu dalları. Çizim bitince
              başlar, dallar dışa doğru çizilir ve söner. */}
          <g className="hk-lockup-burst">
            {filaments.map((f, i) => (
              <g key={i}>
                <path
                  d={`M ${HK_LOCKUP_TIP.x} ${HK_LOCKUP_TIP.y} q ${f.c[0]} ${f.c[1]} ${f.e[0]} ${f.e[1]}`}
                  fill="none"
                  stroke="var(--color-teal-500)"
                  strokeWidth={1.9}
                  strokeLinecap="round"
                  pathLength={1}
                  className="hk-lockup-filament"
                  style={{ animationDelay: `${HK_LOCKUP_TOTAL_DURATION + i * 0.06}s` }}
                />
                {f.fork && (
                  <path
                    d={`M ${HK_LOCKUP_TIP.x + f.e[0]} ${HK_LOCKUP_TIP.y + f.e[1]} q ${f.fork[0] * 0.5} ${f.fork[1] * 0.5} ${f.fork[0]} ${f.fork[1]}`}
                    fill="none"
                    stroke="var(--color-teal-400)"
                    strokeWidth={1.3}
                    strokeLinecap="round"
                    pathLength={1}
                    className="hk-lockup-filament"
                    style={{
                      animationDelay: `${HK_LOCKUP_TOTAL_DURATION + 0.22 + i * 0.06}s`,
                    }}
                  />
                )}
                <circle
                  cx={HK_LOCKUP_TIP.x + f.e[0] + (f.fork?.[0] ?? 0)}
                  cy={HK_LOCKUP_TIP.y + f.e[1] + (f.fork?.[1] ?? 0)}
                  r={2.4}
                  fill="var(--color-sky-500)"
                  className="hk-lockup-synapse"
                  style={{ animationDelay: `${HK_LOCKUP_TOTAL_DURATION + 0.42 + i * 0.06}s` }}
                />
              </g>
            ))}
          </g>

          <circle
            r={3.4}
            className="hk-lockup-pen"
            style={{ animationDuration: `${HK_LOCKUP_TOTAL_DURATION}s` }}
          >
            <animateMotion
              dur={`${HK_LOCKUP_TOTAL_DURATION}s`}
              calcMode="linear"
              fill="freeze"
              begin="0.05s"
              path={penPath}
            />
          </circle>
        </svg>
      </span>
    );
  }

  const img = (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      priority={priority}
      alt={decorative ? "" : "Hipokampüs"}
      aria-hidden={decorative || undefined}
      className={`w-auto ${className} ${animate ? "hk-logo-reveal-img" : ""}`}
    />
  );

  if (!animate) return img;

  return <span className="hk-logo-reveal">{img}</span>;
}
