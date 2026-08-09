"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Vizyon ve misyon — iki kutu değil, birbirine sinapsla bağlanan iki düğüm.
 *
 * Sahibinin isteği: "vizyon misyon kısmı detaylı, laf kalabalığı değil,
 * göze hitap edecek." Bu yüzden metin kısa tutuldu ve anlam görselden
 * çıkıyor: misyon (bugün yaptığımız) ile vizyon (varmak istediğimiz)
 * arasında çizilen bir bağ var — biri diğerine götürüyor.
 *
 * Görününce: önce düğümler açılır, sonra aralarındaki lif çizilir, en son
 * lif üzerinde bir sinyal akar. Sıra anlamlı: önce uçlar var olur, sonra
 * bağlanır, sonra bağ çalışır.
 */
export function VizyonMisyon({
  misyon,
  vizyon,
}: {
  misyon: { baslik: string; metin: string; maddeler: string[] };
  vizyon: { baslik: string; metin: string; maddeler: string[] };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ac, setAc] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const g = new IntersectionObserver(
      ([giris]) => {
        if (!giris.isIntersecting) return;
        setAc(true);
        g.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.1 },
    );
    g.observe(el);
    return () => g.disconnect();
  }, []);

  const kutu = (
    veri: { baslik: string; metin: string; maddeler: string[] },
    gecikme: number,
  ) => (
    <div
      className="relative rounded-2xl border-2 border-teal-300 bg-white p-7 shadow-[var(--shadow-card)] transition-[opacity,transform] duration-[800ms] ease-[var(--ease-calm)] sm:p-8"
      style={{
        opacity: ac ? 1 : 0,
        transform: ac ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${gecikme}ms`,
      }}
    >
      <h3 className="mb-3 text-2xl text-ink-900">{veri.baslik}</h3>
      <p className="mb-5 text-lg text-ink-700">{veri.metin}</p>
      <ul className="space-y-2.5">
        {veri.maddeler.map((m, i) => (
          <li
            key={m}
            className="flex gap-3 text-ink-800 transition-[opacity,transform] duration-[600ms] ease-[var(--ease-calm)]"
            style={{
              opacity: ac ? 1 : 0,
              transform: ac ? "translateX(0)" : "translateX(-8px)",
              transitionDelay: `${gecikme + 400 + i * 120}ms`,
            }}
          >
            <span
              aria-hidden
              className="mt-2.5 size-2 shrink-0 rounded-full bg-sky-500"
            />
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_7rem_1fr] lg:gap-0">
        {kutu(misyon, 0)}

        {/* Bağ — iki düğüm arasında çizilen lif ve üzerinde akan sinyal */}
        <div className="relative hidden lg:block">
          <svg
            viewBox="0 0 112 40"
            preserveAspectRatio="none"
            aria-hidden
            className="absolute top-1/2 left-0 h-10 w-full -translate-y-1/2"
          >
            <path
              id="hk-vm-bag"
              d="M2 20 C34 6, 78 34, 110 20"
              fill="none"
              stroke="var(--color-teal-600)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={ac ? 0 : 1}
              style={{ transition: "stroke-dashoffset 1000ms var(--ease-calm) 700ms" }}
            />
            {ac && (
              <circle r="4" fill="var(--color-sky-500)">
                <animateMotion
                  dur="3.2s"
                  begin="1.7s"
                  repeatCount="indefinite"
                  path="M2 20 C34 6, 78 34, 110 20"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.15;0.85;1"
                  dur="3.2s"
                  begin="1.7s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>
        </div>

        {kutu(vizyon, 250)}
      </div>
    </div>
  );
}
