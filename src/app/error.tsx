"use client";

import Link from "next/link";

/**
 * Hata sayfası.
 *
 * Teknik ayrıntı gösterilmez; kullanıcıya ne yapabileceği söylenir.
 * Bu sayfa kök düzende (layout) sarmalanır, yani başlık ve altbilgi durur.
 */
export default function HataSayfasi({ reset }: { reset: () => void }) {
  return (
    <div className="bg-linear-to-b from-sky-50 to-paper py-20 sm:py-28">
      <div className="mx-auto w-full max-w-2xl px-6 sm:px-8">
        <p className="mb-4 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
          Bir sorun oluştu
        </p>
        <h1 className="mb-5 text-4xl sm:text-5xl">Sayfa yüklenemedi</h1>
        <p className="mb-10 text-xl text-ink-700">
          Bu bizim tarafımızdaki bir sorun. Yeniden denemek çoğu zaman yeterli
          oluyor.
        </p>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[3.75rem] items-center rounded-lg bg-teal-700 px-7 text-lg font-semibold text-white transition-colors hover:bg-teal-800"
          >
            Yeniden deneyin
          </button>
          <Link
            href="/"
            className="inline-flex min-h-[3.75rem] items-center rounded-lg border-2 border-teal-700 bg-white px-7 text-lg font-semibold text-teal-800 transition-colors hover:bg-teal-50"
          >
            Ana sayfaya dönün
          </Link>
        </div>

        <p className="mt-12 rounded-lg border-l-4 border-ink-300 bg-paper-warm p-6 text-ink-800">
          Acil bir durumdaysanız beklemeyin —{" "}
          <strong className="text-ink-900">112&apos;yi arayın.</strong>{" "}
          Hipokampüs acil müdahale sunmaz.
        </p>
      </div>
    </div>
  );
}
