"use client";

import { useState } from "react";
import { musaitlikKurallariniKaydet } from "@/app/actions/ajanda";
import { GonderDugmesi } from "@/components/GonderDugmesi";
import type { MusaitlikKurali } from "@/data/availability";
import { dakikaToSaat } from "@/lib/zaman";

/**
 * Haftalık müsaitlik kuralı düzenleyici.
 *
 * Uzmanın zihnindeki modele birebir oturuyor: "salı ve perşembe
 * öğleden sonraları müsaitim". Gün bazlı bir açık/kapalı + saat aralığı;
 * slot uzunluğu ve ara tüm günler için ortak.
 *
 * Tek slot uzunluğu bilinçli: gün gün farklı süre tanımlamak formu
 * ikiye katlıyor ve gerçek bir ihtiyaca karşılık gelmiyor. Gerekirse
 * `expert_availability_rules` satır bazında zaten taşıyabiliyor.
 *
 * İstemci bileşeni yalnızca kapalı günlerin saat alanlarını
 * soluklaştırmak için; form gönderimi sunucu eylemine gidiyor.
 */

const GUNLER = [
  { no: 1, ad: "Pazartesi" },
  { no: 2, ad: "Salı" },
  { no: 3, ad: "Çarşamba" },
  { no: 4, ad: "Perşembe" },
  { no: 5, ad: "Cuma" },
  { no: 6, ad: "Cumartesi" },
  { no: 7, ad: "Pazar" },
] as const;

const GIRDI =
  "min-h-[3rem] rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600 disabled:bg-ink-100 disabled:text-ink-500";

export function MusaitlikDuzenleyici({
  kurallar,
}: {
  kurallar: MusaitlikKurali[];
}) {
  const mevcut = new Map(kurallar.map((k) => [k.weekday, k]));
  const [acik, setAcik] = useState<Record<number, boolean>>(
    Object.fromEntries(GUNLER.map((g) => [g.no, mevcut.has(g.no)])),
  );

  const ilk = kurallar[0];

  return (
    <form action={musaitlikKurallariniKaydet} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="slot"
            className="mb-1.5 block font-semibold text-ink-900"
          >
            Görüşme süresi (dakika)
          </label>
          <input
            id="slot"
            name="slot"
            type="number"
            min={15}
            max={240}
            step={5}
            defaultValue={ilk?.slotMinutes ?? 45}
            className={`w-full ${GIRDI}`}
          />
        </div>
        <div>
          <label
            htmlFor="bosluk"
            className="mb-1.5 block font-semibold text-ink-900"
          >
            Görüşmeler arası ara (dakika)
          </label>
          <input
            id="bosluk"
            name="bosluk"
            type="number"
            min={0}
            max={120}
            step={5}
            defaultValue={ilk?.gapMinutes ?? 15}
            className={`w-full ${GIRDI}`}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-semibold text-ink-900">
          Hangi günler müsaitsiniz?
        </legend>

        {GUNLER.map((g) => {
          const k = mevcut.get(g.no);
          const gunAcik = acik[g.no];
          return (
            <div
              key={g.no}
              className={`rounded-xl border-2 p-4 transition-colors duration-[var(--dur-fast)] ${
                gunAcik ? "border-teal-300 bg-teal-50" : "border-ink-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <label className="flex min-h-[2.75rem] min-w-[9rem] items-center gap-3 font-semibold text-ink-900">
                  <input
                    type="checkbox"
                    name={`acik-${g.no}`}
                    checked={gunAcik}
                    onChange={(e) =>
                      setAcik((s) => ({ ...s, [g.no]: e.target.checked }))
                    }
                    className="size-5 accent-teal-700"
                  />
                  {g.ad}
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor={`bas-${g.no}`}
                    className="text-base text-ink-700"
                  >
                    Başlangıç
                  </label>
                  <input
                    id={`bas-${g.no}`}
                    name={`bas-${g.no}`}
                    type="time"
                    step={300}
                    disabled={!gunAcik}
                    defaultValue={dakikaToSaat(k?.startMinute ?? 600)}
                    className={GIRDI}
                  />
                  <label
                    htmlFor={`bit-${g.no}`}
                    className="text-base text-ink-700"
                  >
                    Bitiş
                  </label>
                  <input
                    id={`bit-${g.no}`}
                    name={`bit-${g.no}`}
                    type="time"
                    step={300}
                    disabled={!gunAcik}
                    defaultValue={dakikaToSaat(k?.endMinute ?? 960)}
                    className={GIRDI}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </fieldset>

      <GonderDugmesi beklerken="Kaydediliyor…">
        Müsaitliği kaydedin
      </GonderDugmesi>
    </form>
  );
}
