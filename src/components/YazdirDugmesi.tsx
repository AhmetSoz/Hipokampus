"use client";

import { Dugme } from "./form";

/**
 * Tarayıcının yazdırma penceresini açar.
 *
 * PDF kütüphanesi eklenmedi: `window.print()` + `@media print` aynı işi
 * yapıyor ve kullanıcı zaten "PDF olarak kaydet"i oradan seçebiliyor.
 * Sunucuda PDF üretmek yeni bir bağımlılık ve yeni bir hata yüzeyi
 * demekti.
 *
 * Tek satırlık istemci bileşeni — rapor sayfasının kalanı sunucu
 * bileşeni olarak kalıyor.
 */
export function YazdirDugmesi({ children }: { children: React.ReactNode }) {
  return (
    <Dugme
      type="button"
      onClick={() => window.print()}
      /* Yazdırılan çıktıda düğmenin kendisi görünmemeli. */
      className="print:hidden"
    >
      {children}
    </Dugme>
  );
}
