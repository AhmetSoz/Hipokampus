"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Görünür olduğunda içeriği açığa çıkarır.
 *
 * Kaydırma tabanlı anlatı için: bölüm ekrana girdiğinde bir kez animasyon
 * çalışır ve orada kalır. Kaydırma yönüne göre ileri geri oynatmak
 * (yukarı kaydırınca tekrar sönmek) sayfayı huzursuz yapıyor — bu yüzden
 * `bir kez` davranışı seçildi.
 *
 * `IntersectionObserver` kullanılıyor; scroll dinleyicisi değil. Scroll
 * olayı her karede tetiklenir ve uzun sayfada gözle görülür maliyeti var.
 *
 * Hareket hassasiyeti CSS ile ele alınıyor (`.hk-reveal`, globals.css):
 * JS tarafında dallanmak, efekt içinde setState çağırmayı gerektiriyordu.
 * CSS override hem daha basit hem de gözlemci hiç çalışmasa bile içeriği
 * görünür bırakıyor.
 */
export function Belirdiginde({
  children,
  gecikme = 0,
  className = "",
}: {
  children: React.ReactNode;
  /** Saniye cinsinden gecikme — aynı bölümdeki öğeleri sıralamak için. */
  gecikme?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gorundu, setGorundu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const gozlemci = new IntersectionObserver(
      ([giris]) => {
        if (!giris.isIntersecting) return;
        setGorundu(true);
        gozlemci.disconnect();
      },
      /* Alt kenardan biraz önce tetikle: öğe tam ekrana girmeden
         animasyon başlasın, kullanıcı boş alan görmesin. */
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`hk-reveal ${className} transition-[opacity,transform] duration-[900ms] ease-[var(--ease-calm)] ${
        gorundu ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${gecikme}s` }}
    >
      {children}
    </div>
  );
}
