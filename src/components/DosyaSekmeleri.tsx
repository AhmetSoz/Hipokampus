import Link from "next/link";

/**
 * Dosya sekmeleri.
 *
 * Uzman dosya sayfası altı bölümü alt alta yığıyordu ve ~6 ekran
 * uzunluğundaydı; not eklemek için sayfanın yarısını kaydırmak
 * gerekiyordu. Sekmeler tek ekrana indiriyor.
 *
 * URL tabanlı (`?sekme=`), istemci durumu yok: sunucuda render edilir,
 * bağlantı paylaşılabilir, geri tuşu çalışır ve JavaScript gerektirmez.
 */

export type SekmeId = "yazisma" | "seanslar" | "formlar" | "gorevler";

export const SEKMELER: { id: SekmeId; label: string }[] = [
  { id: "yazisma", label: "Yazışma" },
  { id: "seanslar", label: "Seanslar" },
  { id: "formlar", label: "Formlar" },
  { id: "gorevler", label: "Görevler" },
];

export function normalizeSekme(value: unknown): SekmeId {
  return SEKMELER.some((s) => s.id === value) ? (value as SekmeId) : "yazisma";
}

export function DosyaSekmeleri({
  basePath,
  aktif,
  rozetler = {},
}: {
  basePath: string;
  aktif: SekmeId;
  /** Sekme başına sayı rozeti; 0 ise gösterilmez. */
  rozetler?: Partial<Record<SekmeId, number>>;
}) {
  return (
    <nav aria-label="Dosya bölümleri">
      <ul className="flex flex-wrap gap-2">
        {SEKMELER.map((s) => {
          const active = s.id === aktif;
          const rozet = rozetler[s.id] ?? 0;
          return (
            <li key={s.id}>
              <Link
                href={`${basePath}?sekme=${s.id}`}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[3rem] items-center gap-2 rounded-xl border-2 px-5 font-semibold ${
                  active
                    ? "border-teal-700 bg-teal-700 text-white shadow-[var(--shadow-card)]"
                    : "border-ink-200 bg-white text-ink-800 hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                {s.label}
                {rozet > 0 && (
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-base ${
                      active ? "bg-white/25 text-white" : "bg-teal-100 text-teal-900"
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
    </nav>
  );
}
