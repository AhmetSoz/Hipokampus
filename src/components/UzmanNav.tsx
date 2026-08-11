"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Uzman paneli menüsü.
 *
 * Layout içinde satır içi yazılmıştı ve aktif sayfa vurgusu yoktu: uzman
 * hangi bölümde olduğunu göremiyordu. Danışan tarafındaki `PanelNav`'da
 * bu zaten vardı; iki panel arasındaki bu fark bilinçli değildi.
 *
 * `aria-current="page"` görsel vurgunun ekran okuyucu karşılığı.
 */

export type UzmanNavOgesi = {
  href: string;
  label: string;
  hint: string;
  /** Bekleyen iş sayısı; 0 ise gösterilmez. */
  rozet?: number;
};

export function UzmanNav({ ogeler }: { ogeler: UzmanNavOgesi[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Uzman paneli bölümleri">
      <ul className="space-y-2">
        {ogeler.map((item) => {
          /* Genel bakış tam eşleşme ister; diğerleri alt sayfalarında da
             aktif kalmalı (örn. /uzman-panel/danisanlar/d1). */
          const aktif =
            item.href === "/uzman-panel"
              ? pathname === "/uzman-panel"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-[3.5rem] items-center justify-between gap-3 rounded-xl border px-5 py-4 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] ${
                  aktif
                    ? "border-teal-700 bg-teal-700 text-white"
                    : "border-ink-200 bg-white text-ink-800 hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{item.label}</span>
                  <span
                    className={`block text-base ${
                      aktif ? "text-teal-50" : "text-ink-600"
                    }`}
                  >
                    {item.hint}
                  </span>
                </span>
                {item.rozet ? (
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                      aktif ? "bg-white/25 text-white" : "bg-teal-100 text-teal-900"
                    }`}
                  >
                    {item.rozet}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
