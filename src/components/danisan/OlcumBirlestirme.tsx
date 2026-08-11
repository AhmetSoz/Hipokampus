import {
  birlestirmeyiGeriAl,
  etiketleriBirlestir,
} from "@/app/actions/olcumler";
import { GonderDugmesi } from "@/components/GonderDugmesi";
import type { BirlesmeOnerisi, OlcumSerisi } from "@/lib/olcum";

/**
 * "Bu ikisi aynı ölçüm mü?" önerileri ve geri alma.
 *
 * Sistem birleştirmeyi KENDİ YAPMAZ. Etiketleri sessizce birleştirmek de
 * bir yorumdur ve yanlışsa uzmanın göremediği bir veri hatası bırakır —
 * proje boyunca uygulanan ilkenin aynısı: sistem yorum yapmaz, uzman
 * yapar (puan yok, "iyi/kötü" yok, tanı yok).
 *
 * Ham etiketler hiç değişmediği için birleştirme her zaman geri alınabilir.
 */
export function OlcumBirlestirme({
  consultantId,
  oneriler,
  seriler,
}: {
  consultantId: string;
  oneriler: BirlesmeOnerisi[];
  seriler: OlcumSerisi[];
}) {
  const birlesmisler = seriler.filter((s) => s.hamEtiketSayisi > 1);

  if (oneriler.length === 0 && birlesmisler.length === 0) return null;

  return (
    <div className="space-y-4">
      {oneriler.map((o) => (
        <div
          key={o.anahtar}
          className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-5"
        >
          <h4 className="mb-2 text-lg font-semibold text-ink-900">
            Bunlar aynı ölçüm mü?
          </h4>
          <ul className="mb-4 flex flex-wrap gap-2">
            {o.hamEtiketler.map((e) => (
              <li
                key={e}
                className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-ink-800"
              >
                {e}
              </li>
            ))}
          </ul>
          <p className="mb-4 text-base text-ink-700">
            Farklı yazıldıkları için ayrı seriler olarak görünüyorlar ve
            aralarındaki değişim izlenemiyor. Birleştirirseniz tek bir trend
            olurlar; yazdığınız notlar değişmez.
          </p>

          <form
            action={etiketleriBirlestir}
            className="flex flex-wrap items-end gap-3"
          >
            <input type="hidden" name="danisan" value={consultantId} />
            {o.hamEtiketler.map((e) => (
              <input key={e} type="hidden" name="ham" value={e} />
            ))}
            <div className="min-w-0 flex-1">
              <label
                htmlFor={`etiket-${o.anahtar}`}
                className="mb-1.5 block font-semibold text-ink-900"
              >
                Hangi adla görünsün?
              </label>
              <input
                id={`etiket-${o.anahtar}`}
                name="etiket"
                defaultValue={o.onerilenEtiket}
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              />
            </div>
            <div className="w-28">
              <label
                htmlFor={`birim-${o.anahtar}`}
                className="mb-1.5 block font-semibold text-ink-900"
              >
                Birim
              </label>
              <input
                id={`birim-${o.anahtar}`}
                name="birim"
                defaultValue={o.onerilenBirim ?? ""}
                className="min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600"
              />
            </div>
            <GonderDugmesi beklerken="…">Birleştirin</GonderDugmesi>
          </form>
        </div>
      ))}

      {birlesmisler.length > 0 && (
        <div className="rounded-2xl border border-ink-200 bg-paper-warm p-5">
          <h4 className="mb-3 font-semibold text-ink-900">
            Birleştirdiğiniz ölçümler
          </h4>
          <ul className="space-y-2">
            {birlesmisler.map((s) => (
              <li
                key={s.anahtar}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <span className="text-ink-800">
                  <span className="font-semibold">{s.gosterilenEtiket}</span>
                  <span className="text-ink-600">
                    {" "}
                    · {s.hamEtiketSayisi} farklı yazım
                  </span>
                </span>
                <form action={birlestirmeyiGeriAl}>
                  <input type="hidden" name="danisan" value={consultantId} />
                  <input type="hidden" name="etiket" value={s.anahtar} />
                  <button
                    type="submit"
                    className="min-h-[2.75rem] rounded-lg border-2 border-ink-300 px-4 font-semibold text-ink-700 hover:bg-ink-100"
                  >
                    Geri alın
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
