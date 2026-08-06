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
 */
const ITEMS: {
  href: string;
  label: string;
  scope: DataScope | null;
}[] = [
  { href: "/panel", label: "Genel bakış", scope: null },
  { href: "/panel/plan", label: "Bakım planı", scope: "saglik-gorusme" },
  { href: "/panel/mesajlar", label: "Danışma dosyaları", scope: "saglik-gorusme" },
  { href: "/panel/formlar", label: "Formlar", scope: "saglik-gorusme" },
  { href: "/panel/odeme", label: "Ödeme ve abonelik", scope: "odeme-fatura" },
  { href: "/panel/erisim", label: "Erişim ve izinler", scope: null },
];

export function PanelNav({ member }: { member: FamilyMember }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel bölümleri">
      <ul className="space-y-2">
        {ITEMS.map((item) => {
          const locked = item.scope !== null && !member.scopes.includes(item.scope);
          const active = pathname === item.href;

          if (locked) {
            return (
              <li key={item.href}>
                <span className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-100 px-5 py-4 text-ink-600">
                  <span>{item.label}</span>
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
                className={`flex min-h-[3.5rem] items-center rounded-xl border px-5 py-4 ${
                  active
                    ? "border-teal-700 bg-teal-700 font-semibold text-white shadow-[var(--shadow-card)]"
                    : "border-ink-200 bg-white text-ink-800 hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50 hover:shadow-[var(--shadow-soft)]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 rounded-xl border border-ink-200 bg-white px-5 py-4 text-base text-ink-600 shadow-[var(--shadow-soft)]">
        Kilitli bölümler, erişim yetkiniz olmadığı için kapalıdır. Yetkiyi
        yalnızca panel sahibi verebilir.
      </p>
    </nav>
  );
}
