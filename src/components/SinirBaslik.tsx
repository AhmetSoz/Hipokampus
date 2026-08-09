"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Görününce altına ince bir sinir lifi çizilen bölüm başlığı.
 *
 * Düz bir alt çizgi yerine, uçlarında sinaps noktaları olan hafif kıvrımlı
 * bir lif: başlık da omurgayla aynı dile ait olsun diye. Çizim bir kez
 * çalışır ve kalır.
 */
export function SinirBaslik({
  ustBaslik,
  children,
}: {
  ustBaslik: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gorundu, setGorundu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const g = new IntersectionObserver(
      ([giris]) => {
        if (!giris.isIntersecting) return;
        setGorundu(true);
        g.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.1 },
    );
    g.observe(el);
    return () => g.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <p className="mb-4 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
        {ustBaslik}
      </p>
      {children}
      <svg
        viewBox="0 0 260 20"
        aria-hidden
        className="mt-5 h-5 w-64 max-w-full"
      >
        <path
          d="M4 14 C60 4, 110 18, 160 9 C196 3, 226 10, 252 8"
          fill="none"
          stroke="var(--color-teal-600)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={gorundu ? 0 : 1}
          style={{
            transition: "stroke-dashoffset 1100ms var(--ease-calm)",
          }}
        />
        {[4, 160, 252].map((cx, i) => (
          <circle
            key={cx}
            cx={cx}
            cy={[14, 9, 8][i]}
            r="3"
            fill="var(--color-sky-500)"
            style={{
              opacity: gorundu ? 1 : 0,
              transform: gorundu ? "scale(1)" : "scale(0)",
              transformOrigin: "center",
              transformBox: "fill-box",
              transition: `opacity 400ms var(--ease-calm) ${500 + i * 220}ms, transform 400ms var(--ease-snap) ${500 + i * 220}ms`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
