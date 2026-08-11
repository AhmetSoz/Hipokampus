"use client";

import { useEffect, useRef } from "react";

/**
 * Form hatasını ekran okuyucuya DUYURAN hata kutusu.
 *
 * SORUN: Projedeki hata deseni `redirect(?hata=...)` → sayfa yeniden
 * render → hata metni sayfada. Bu, görsel kullanıcı için çalışıyor ama
 * ekran okuyucu için çalışmıyor: canlı bölge (`aria-live`) yalnızca
 * SONRADAN DEĞİŞEN içeriği duyurur. Sunucu render'ında zaten dolu gelen
 * bir bölge hiç okunmaz. Projede bugün tek bir `aria-live` var
 * (ExpertFilters) ve form hatalarının hiçbiri duyurulmuyor.
 *
 * ÇÖZÜM iki parçalı:
 *  1. `role="alert"` — çoğu ekran okuyucuda ilk render'da da duyurulur,
 *     ama garanti değil.
 *  2. Odağı hata kutusuna taşımak — bu garanti. Kullanıcı hatayı duyar
 *     ve zaten hatanın olduğu yerdedir.
 *
 * `hedefId` verilirse hatalı alana atlayan bir bağlantı da çıkar.
 */
export function FormHatasi({
  children,
  hedefId,
  className = "",
}: {
  children: React.ReactNode;
  hedefId?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={`mb-4 rounded-xl border-l-4 border-danger-600 bg-danger-50 px-4 py-3 font-semibold text-danger-700 ${className}`}
    >
      {children}
      {hedefId && (
        <>
          {" "}
          <a
            href={`#${hedefId}`}
            className="font-semibold text-danger-700 underline underline-offset-4"
          >
            Alana gidin
          </a>
        </>
      )}
    </div>
  );
}
