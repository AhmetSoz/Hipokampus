import Link from "next/link";

/**
 * URL tabanlı sekme çubuğu.
 *
 * `DosyaSekmeleri`'nde kurulmuş desenin genelleştirilmişi: sunucuda
 * render edilir, istemci durumu yoktur, bağlantı paylaşılabilir, geri
 * tuşu çalışır ve JavaScript gerektirmez. Danışan detay sayfası da aynı
 * davranışı istediği için tekrar yazmak yerine buraya çıkarıldı.
 *
 * `role="tablist"` KULLANILMIYOR: bunlar gerçek bağlantı, sekme widget'ı
 * değil. ARIA sekme rolü vermek, ok tuşu gezinmesi ve `aria-controls`
 * sözleşmesini de üstlenmeyi gerektirir; yarım uygulanmış bir tab
 * pattern, hiç olmamasından kötüdür. Bağlantı listesi olarak bırakmak
 * hem doğru hem de klavyeyle zaten çalışıyor.
 */

export function SekmeCubugu<T extends string>({
  basePath,
  param = "sekme",
  sekmeler,
  aktif,
  rozetler = {},
  etiket = "Bölümler",
}: {
  basePath: string;
  /** Sorgu parametresinin adı. */
  param?: string;
  sekmeler: readonly { id: T; label: string }[];
  aktif: T;
  /** Sekme başına sayı rozeti; 0 ise gösterilmez. */
  rozetler?: Partial<Record<T, number>>;
  etiket?: string;
}) {
  return (
    <nav aria-label={etiket}>
      <ul className="flex flex-wrap gap-2">
        {sekmeler.map((s) => {
          const active = s.id === aktif;
          const rozet = rozetler[s.id] ?? 0;
          return (
            <li key={s.id}>
              <Link
                href={`${basePath}?${param}=${s.id}`}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[3rem] items-center gap-2 rounded-xl border-2 px-5 font-semibold transition-[transform,background-color,border-color] duration-[var(--dur-fast)] ${
                  active
                    ? "border-teal-700 bg-teal-700 text-white shadow-[var(--shadow-card)]"
                    : "border-ink-200 bg-white text-ink-800 hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                {s.label}
                {rozet > 0 && (
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-base ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-teal-100 text-teal-900"
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

/**
 * Sorgu parametresini geçerli bir sekme kimliğine indirger.
 * Bilinmeyen/eksik değerde ilk sekmeye düşer.
 */
export function sekmeCoz<T extends string>(
  value: unknown,
  sekmeler: readonly { id: T }[],
): T {
  return sekmeler.some((s) => s.id === value) ? (value as T) : sekmeler[0].id;
}
