import Image from "next/image";
import { HK_LOCKUP_STROKES, HK_LOCKUP_TOTAL_DURATION } from "./hk-lockup-trace";

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
    /* Kalem izin sonuna kadar gider. Sondaki "dağılma" efekti sahibinin
       isteğiyle kaldırıldı; dağılma artık sayfa arka planında, logo
       çizilirken eş zamanlı oluyor (bkz. BrandPath). */
    const penPath = HK_LOCKUP_STROKES.map((s) => s.d).join(" ");

    return (
      <span
        className={`relative inline-block w-auto ${className}`}
        style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
      >
        <svg
          viewBox={`0 0 ${asset.width} ${asset.height}`}
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
