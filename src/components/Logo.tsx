import Image from "next/image";

/**
 * Marka kilidi (lockup) ve sembolü.
 *
 * Varlıklar tasarımcı teslimlerinden üretilir; elle çizilmiş yaklaşım
 * KULLANILMAZ. Kaynak dosyalar `logo/` klasöründe, üretim betiği
 * `scripts/prepare-logo.mjs`. Kaynaklar değişirse betiği yeniden çalıştırın.
 *
 * Varyant seçimi zemine göre yapılır:
 *   açık zemin  → "lockup" / "symbol"          (petrol turkuaz #0E5C63)
 *   petrol/koyu → "lockupReverse" / "symbolReverse" (beyaz + kum uç nokta)
 *
 * Ters varyant, tasarımcının kum rengi uç noktasını ("yön bulma") içerir;
 * açık zemin varyantı tek renktir. İkisi de teslim edilen dosyalara sadıktır.
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
   * Bir kerelik "elle çiziliyor" açılış efekti — maske ile üstten alta
   * açığa çıkma + kenarı takip eden ince bir mürekkep-ucu çizgisi. Varlık
   * hâlâ tasarımcı teslimi raster; yalnızca ilk görünüşü animasyonlu.
   * Sayfa içinde tekrarlayan yerlerde (header gibi) kullanın, aynı öğeyi
   * defalarca yeniden oynatmayın.
   */
  animate?: boolean;
}) {
  const asset = ASSETS[variant];

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
