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
  height = 40,
  priority = false,
  className,
  decorative = false,
}: {
  variant?: LogoVariant;
  /** Piksel cinsinden yükseklik; genişlik orana göre hesaplanır. */
  height?: number;
  priority?: boolean;
  className?: string;
  /** Yanında zaten "Hipokampüs" yazıyorsa true verin. */
  decorative?: boolean;
}) {
  const asset = ASSETS[variant];
  const width = Math.round((asset.width / asset.height) * height);

  return (
    <Image
      src={asset.src}
      width={width}
      height={height}
      priority={priority}
      alt={decorative ? "" : "Hipokampüs"}
      aria-hidden={decorative || undefined}
      className={className}
      style={{ height, width: "auto" }}
    />
  );
}
