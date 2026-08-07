"use client";

import { usePathname } from "next/navigation";

/**
 * Sayfa geçişi.
 *
 * Rota değiştiğinde içerik sertçe yer değiştiriyordu. `key` olarak
 * pathname verildiği için React alt ağacı yeniden kuruyor ve giriş
 * animasyonu her gezinmede yeniden çalışıyor.
 *
 * Bilerek kısa ve küçük genlikli (14px, 380ms): geçiş fark edilsin ama
 * bekletmesin. Uzun ya da abartılı bir geçiş, sık gezinilen bir panelde
 * hızla yorucu hâle gelir.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="hk-page-enter">
      {children}
    </div>
  );
}
