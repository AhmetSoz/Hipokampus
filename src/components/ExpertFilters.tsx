"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { NeedArea } from "@/data/types";

/**
 * Süzme alanları. Seçimler adres çubuğunda tutulur — sayfa paylaşılabilir
 * ve sunucuda üretilebilir kalır.
 *
 * Bu alanlar TEMSİLÎDİR: hangi kriterin zorunlu süzme, hangisinin yalnızca
 * sıralama etkisi olacağı henüz kararlaştırılmadı (açık soru 7).
 */
export function ExpertFilters({
  fields,
  cities,
  needAreas,
  total,
  shown,
}: {
  fields: string[];
  cities: string[];
  needAreas: NeedArea[];
  total: number;
  shown: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(next.size ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  const hasFilter = params.size > 0;

  const select =
    "min-h-[3.25rem] w-full rounded-lg border-2 border-ink-200 bg-white px-4 text-lg text-ink-900 transition-colors focus:border-teal-600";

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label
            htmlFor="f-need"
            className="mb-2 block font-semibold text-ink-900"
          >
            Konu
          </label>
          <select
            id="f-need"
            className={select}
            value={params.get("konu") ?? ""}
            onChange={(e) => setParam("konu", e.target.value)}
          >
            <option value="">Tüm konular</option>
            {needAreas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="f-field"
            className="mb-2 block font-semibold text-ink-900"
          >
            Uzmanlık alanı
          </label>
          <select
            id="f-field"
            className={select}
            value={params.get("alan") ?? ""}
            onChange={(e) => setParam("alan", e.target.value)}
          >
            <option value="">Tüm alanlar</option>
            {fields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="f-city"
            className="mb-2 block font-semibold text-ink-900"
          >
            Şehir
          </label>
          <select
            id="f-city"
            className={select}
            value={params.get("sehir") ?? ""}
            onChange={(e) => setParam("sehir", e.target.value)}
          >
            <option value="">Tüm şehirler</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-5">
        <p aria-live="polite" className="text-ink-700">
          {shown === total
            ? `${total} uzman listeleniyor`
            : `${total} uzmandan ${shown} tanesi gösteriliyor`}
        </p>
        {hasFilter && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="min-h-[3rem] rounded-lg px-4 text-lg text-teal-800 underline underline-offset-4"
          >
            Süzmeyi temizleyin
          </button>
        )}
      </div>
    </div>
  );
}
