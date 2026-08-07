"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DataScope, FamilyMember } from "@/data/types";

/**
 * Panel gezinmesi.
 *
 * Bölümler kişinin veri kapsamına göre filtrelenir. Kapsamı olmayan bölüm
 * gizlenmez, **kilitli olarak gösterilir** — kullanıcının neyi göremediğini
 * bilmesi, o bölümün varlığından habersiz olmasından iyidir. Kilidin kimin
 * açabileceği de yazılır.
 *
 * Etiketler günlük dile çekildi ("Danışma dosyaları" → "Mesajlarım"):
 * sahibi mesaj alanını ilk bakışta bulamadığını bildirdi. Bekleyen iş
 * sayıları rozet olarak gösteriliyor ki ne yapılacağı menüden anlaşılsın.
 */
const ITEMS: {
  href: string;
  label: string;
  hint: string;
  scope: DataScope | null;
  rozet?: "mesaj" | "form";
}[] = [
  {
    href: "/panel",
    label: "Genel bakış",
    hint: "Sizden bekleyenler ve özet",
    scope: null,
  },
  {
    href: "/panel/mesajlar",
    label: "Mesajlarım",
    hint: "Uzmanınızla yazışma",
    scope: "saglik-gorusme",
    rozet: "mesaj",
  },
  {
    href: "/panel/formlar",
    label: "Formlar",
    hint: "Doldurmanız istenenler",
    scope: "saglik-gorusme",
    rozet: "form",
  },
  {
    href: "/panel/plan",
    label: "Bakım planı",
    hint: "Uzmanın yazdığı maddeler",
    scope: "saglik-gorusme",
  },
  {
    href: "/panel/odeme",
    label: "Ödeme ve abonelik",
    hint: "Hizmet kalemleri",
    scope: "odeme-fatura",
  },
  {
    href: "/panel/erisim",
    label: "Erişim ve izinler",
    hint: "Kim neyi görüyor",
    scope: null,
  },
];

export function PanelNav({
  member,
  bekleyenMesaj = 0,
  bekleyenForm = 0,
}: {
  member: FamilyMember;
  bekleyenMesaj?: number;
  bekleyenForm?: number;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel bölümleri">
      <ul className="space-y-2">
        {ITEMS.map((item) => {
          const locked = item.scope !== null && !member.scopes.includes(item.scope);
          const active =
            pathname === item.href ||
            (item.href !== "/panel" && pathname.startsWith(`${item.href}/`));
          const rozet =
            item.rozet === "mesaj"
              ? bekleyenMesaj
              : item.rozet === "form"
                ? bekleyenForm
                : 0;

          if (locked) {
            return (
              <li key={item.href}>
                <span className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-100 px-5 py-4 text-ink-600">
                  <span>
                    <span className="block">{item.label}</span>
                    <span className="block text-base text-ink-500">
                      {item.hint}
                    </span>
                  </span>
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                    <path
                      d="M4.5 8V6a4.5 4.5 0 019 0v2M3.5 8h11v7h-11z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="sr-only">
                    Bu bölüme erişiminiz yok. Yetkiyi yalnızca panel sahibi verebilir.
                  </span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-3 rounded-xl border px-5 py-4 transition-[transform,box-shadow,background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] ${
                  active
                    ? "border-teal-700 bg-teal-700 text-white shadow-[var(--shadow-card)]"
                    : "border-ink-200 bg-white text-ink-800 hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50 hover:shadow-[var(--shadow-soft)]"
                }`}
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{item.label}</span>
                  <span
                    className={`block text-base ${active ? "text-teal-100" : "text-ink-600"}`}
                  >
                    {item.hint}
                  </span>
                </span>
                {rozet > 0 && (
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                      active ? "bg-white/25 text-white" : "bg-teal-700 text-white"
                    }`}
                  >
                    {rozet}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Danışanın en sık sorduğu şey: "uzmanı nasıl seçeceğim?" Panelde
          bu eylem hiçbir yerde görünmüyordu. */}
      {member.scopes.includes("saglik-gorusme") && (
        <Link
          href="/uzmanlar"
          className="mt-4 flex min-h-[3.5rem] items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 font-semibold text-white shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-px hover:shadow-[var(--shadow-pop)] active:scale-[0.98]"
        >
          Uzman bulun
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path
              d="M4 9h9.5M9 4.5 13.5 9 9 13.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </Link>
      )}

      <p className="mt-4 rounded-xl border border-ink-200 bg-white px-5 py-4 text-base text-ink-600 shadow-[var(--shadow-soft)]">
        Kilitli bölümler, erişim yetkiniz olmadığı için kapalıdır. Yetkiyi
        yalnızca panel sahibi verebilir.
      </p>
    </nav>
  );
}
