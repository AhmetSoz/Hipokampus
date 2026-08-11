import type { Metadata } from "next";
import { istisnaEkle, istisnaSil } from "@/app/actions/ajanda";
import { MusaitlikDuzenleyici } from "@/components/ajanda/MusaitlikDuzenleyici";
import { FormHatasi } from "@/components/FormHatasi";
import { GonderDugmesi } from "@/components/GonderDugmesi";
import { Notice } from "@/components/ui";
import { listExceptions, listOpenSlots, listRules } from "@/data/availability";
import { getCurrentExpert } from "@/data/session";
import { bugunTr, trUzunTarih, dakikaToSaat, trSaat } from "@/lib/zaman";

export const metadata: Metadata = { title: "Müsaitliğim" };

const HATA: Record<string, string> = {
  slot: "Görüşme süresi 15–240 dakika arasında olmalı.",
  bosluk: "Ara 0–120 dakika arasında olmalı.",
  saat: "Saat biçimi geçerli değil.",
  sira: "Bitiş saati başlangıçtan sonra olmalı.",
  kisa: "Seçtiğiniz aralık bir görüşmeye bile yetmiyor.",
  gun: "Tarih geçerli değil.",
  tur: "İstisna türü geçerli değil.",
};

const GIRDI =
  "min-h-[3rem] w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 focus:border-teal-600";

export default async function MusaitlikSayfasi({
  searchParams,
}: PageProps<"/uzman-panel/musaitlik">) {
  const sp = await searchParams;
  const expert = await getCurrentExpert();

  const [kurallar, istisnalar, slotGunleri] = await Promise.all([
    listRules(expert.id),
    listExceptions(expert.id, { fromDay: bugunTr(), toDay: "2100-01-01" }),
    listOpenSlots(expert.id, { gunSayisi: 14 }),
  ]);

  const hata = typeof sp.hata === "string" ? HATA[sp.hata] : undefined;
  const bosSlot = slotGunleri.reduce(
    (t, g) => t + g.slotlar.filter((s) => s.durum === "bos").length,
    0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Müsaitliğim</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Hangi gün ve saatlerde görüşebileceğinizi tanımlayın. Danışanlarınız
          yalnızca buradan çıkan boş saatleri görür ve doğrudan seçer — her
          randevu için ayrıca yazışmanız gerekmez.
        </p>
      </div>

      {sp.kaydedildi && !hata && (
        <div
          role="status"
          className="rounded-xl border-l-4 border-teal-600 bg-teal-50 px-4 py-3 font-semibold text-teal-900"
        >
          Kaydedildi. Önümüzdeki 14 günde {bosSlot} boş görüşme saatiniz var.
        </div>
      )}
      {hata && <FormHatasi>{hata}</FormHatasi>}

      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h2 className="mb-1 text-2xl">Haftalık düzeniniz</h2>
        <p className="mb-6 text-ink-600">
          Her hafta tekrarlar. Tek seferlik değişiklikleri aşağıdaki
          istisnalarla belirtin.
        </p>
        <MusaitlikDuzenleyici kurallar={kurallar} />
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h2 className="mb-1 text-2xl">Tek seferlik değişiklikler</h2>
        <p className="mb-6 text-ink-600">
          İzinli olduğunuz bir günü kapatın ya da haftalık düzeninizde olmayan
          bir saat açın.
        </p>

        {istisnalar.length > 0 && (
          <ul className="mb-7 space-y-2">
            {istisnalar.map((i) => (
              <li
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper-warm p-4"
              >
                <span className="text-ink-800">
                  <span className="font-semibold">{trUzunTarih(`${i.day}T12:00:00Z`)}</span>
                  {" · "}
                  {i.kind === "kapali"
                    ? "Kapalı"
                    : `Ek saat ${dakikaToSaat(i.startMinute ?? 0)}–${dakikaToSaat(i.endMinute ?? 0)}`}
                  {i.note && (
                    <span className="text-ink-600"> · {i.note}</span>
                  )}
                </span>
                <form action={istisnaSil}>
                  <input type="hidden" name="istisna" value={i.id} />
                  <button
                    type="submit"
                    className="min-h-[2.75rem] rounded-lg border-2 border-ink-300 px-4 font-semibold text-ink-700 hover:bg-ink-100"
                  >
                    Kaldır
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={istisnaEkle} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ist-gun" className="mb-1.5 block font-semibold text-ink-900">
                Tarih
              </label>
              <input
                id="ist-gun"
                name="gun"
                type="date"
                required
                min={bugunTr()}
                className={GIRDI}
              />
            </div>
            <div>
              <label htmlFor="ist-tur" className="mb-1.5 block font-semibold text-ink-900">
                Ne yapmak istiyorsunuz?
              </label>
              <select id="ist-tur" name="tur" className={GIRDI} defaultValue="kapali">
                <option value="kapali">Bu günü tamamen kapat</option>
                <option value="ek-slot">Bu güne ek saat aç</option>
              </select>
            </div>
          </div>

          {/* Ek saat alanları her zaman görünür: `kapali` seçiliyken sunucu
              bunları zaten yok sayıyor. Alanları JS ile gizlemek, JS'siz
              çalışan bu formu bozardı. */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="ist-bas" className="mb-1.5 block font-semibold text-ink-900">
                Ek saat başlangıcı
              </label>
              <input id="ist-bas" name="bas" type="time" step={300} className={GIRDI} />
            </div>
            <div>
              <label htmlFor="ist-bit" className="mb-1.5 block font-semibold text-ink-900">
                Ek saat bitişi
              </label>
              <input id="ist-bit" name="bit" type="time" step={300} className={GIRDI} />
            </div>
            <div>
              <label htmlFor="ist-not" className="mb-1.5 block font-semibold text-ink-900">
                Not (yalnızca siz görürsünüz)
              </label>
              <input
                id="ist-not"
                name="not"
                type="text"
                maxLength={120}
                placeholder="Örn. Kongre"
                className={GIRDI}
              />
            </div>
          </div>

          <GonderDugmesi variant="secondary">İstisna ekleyin</GonderDugmesi>
        </form>
      </section>

      <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h2 className="mb-1 text-2xl">Danışanlarınız ne görüyor?</h2>
        <p className="mb-6 text-ink-600">
          Önümüzdeki 14 gün. Randevusu alınmış saatler listede &quot;dolu&quot;
          görünür, danışan onları seçemez.
        </p>

        {slotGunleri.length === 0 ? (
          <Notice title="Henüz boş saatiniz yok">
            <p>
              Yukarıdan haftalık düzeninizi tanımlayın. Tanımlamadığınız sürece
              danışanlarınız saat seçemez; görüşmeleri tek tek yazışarak
              ayarlamanız gerekir.
            </p>
          </Notice>
        ) : (
          <ul className="space-y-4">
            {slotGunleri.slice(0, 7).map((g) => (
              <li key={g.gun}>
                <p className="mb-2 font-semibold text-ink-900">
                  {trUzunTarih(`${g.gun}T12:00:00Z`)}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {g.slotlar.map((s) => (
                    <li
                      key={s.startsAt}
                      className={`rounded-lg border-2 px-3 py-2 text-base ${
                        s.durum === "bos"
                          ? "border-teal-300 bg-teal-50 text-teal-900"
                          : "border-ink-200 bg-ink-100 text-ink-500 line-through"
                      }`}
                    >
                      {trSaat(s.startsAt)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
