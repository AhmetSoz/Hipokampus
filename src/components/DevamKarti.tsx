import Link from "next/link";

/**
 * Giriş yapmış kullanıcının ana sayfada gördüğü kart.
 *
 * Hesabı olan kişi her gelişinde tanıtım okumaz ve ihtiyaç formunu
 * baştan doldurmaz — kaldığı yerden devam eder. Kart yalnızca "bekleyen
 * iş" varsa onu öne çıkarır; yoksa doğrudan panele götürür.
 */

export type BekleyenIs = {
  etiket: string;
  sayi: number;
  href: string;
};

export function DevamKarti({
  ad,
  panelHref,
  bekleyenler,
}: {
  ad: string;
  panelHref: string;
  bekleyenler: BekleyenIs[];
}) {
  const acil = bekleyenler.filter((b) => b.sayi > 0);

  return (
    <div className="hk-enter rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <p className="mb-1 text-base text-ink-500">Tekrar hoş geldiniz</p>
      <p className="mb-6 text-2xl text-ink-900">{ad}</p>

      {acil.length === 0 ? (
        <p className="mb-6 text-lg text-ink-700">
          Bekleyen bir işiniz yok. Panelinizden her şeyi görebilirsiniz.
        </p>
      ) : (
        <ul className="mb-6 space-y-3">
          {acil.map((b) => (
            <li key={b.etiket}>
              <Link
                href={b.href}
                className="flex items-center justify-between gap-4 rounded-xl border-2 border-teal-300 bg-teal-50 px-5 py-4 hover:-translate-y-px hover:shadow-[var(--shadow-soft)]"
              >
                <span className="text-lg text-ink-900">{b.etiket}</span>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-700 font-semibold text-white">
                  {b.sayi}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={panelHref}
        className="inline-flex min-h-[3.25rem] items-center rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.97]"
      >
        Panele gidin
      </Link>
    </div>
  );
}
