import type { Metadata } from "next";
import Link from "next/link";
import { HaftaIzgarasi } from "@/components/ajanda/HaftaIzgarasi";
import { Notice } from "@/components/ui";
import { listAppointmentsForExpert } from "@/data/appointments";
import { listRules } from "@/data/availability";
import { listConversationsForExpert } from "@/data/conversations";
import { getConsultant } from "@/data/household";
import { getCurrentExpert } from "@/data/session";
import {
  bugunTr,
  gunEkle,
  gunGecerliMi,
  haftaGunleri,
  trHaftaBasi,
  trTarih,
  trYerelToUTC,
} from "@/lib/zaman";

export const metadata: Metadata = { title: "Ajandam" };

/**
 * Uzmanın haftalık ajandası.
 *
 * "Bu hafta kaç görüşmem var?" sorusunun yanıtsız kaldığı tek ekrandı:
 * randevular yalnızca dosya içinde görünüyordu, uzman kendi takvimini
 * hiçbir yerde bütün olarak göremiyordu.
 *
 * Hafta gezinmesi URL üzerinden (`?hafta=YYYY-MM-DD`): sunucuda render
 * edilir, bağlantı paylaşılabilir, geri tuşu çalışır, JS gerektirmez.
 */
export default async function AjandaSayfasi({
  searchParams,
}: PageProps<"/uzman-panel/ajanda">) {
  const sp = await searchParams;
  const expert = await getCurrentExpert();

  const istenen =
    typeof sp.hafta === "string" && gunGecerliMi(sp.hafta)
      ? sp.hafta
      : bugunTr();
  const pazartesi = trHaftaBasi(istenen);
  const gunler = haftaGunleri(pazartesi);

  const [randevular, dosyalar, kurallar] = await Promise.all([
    listAppointmentsForExpert(expert.id, {
      from: trYerelToUTC(pazartesi, 0),
      to: trYerelToUTC(gunEkle(pazartesi, 7), 0),
    }),
    listConversationsForExpert(expert.id),
    listRules(expert.id),
  ]);

  /* Ajandada asıl merak edilen "kiminle" — dosya konusu değil, kişi. */
  const danisanAdlari = new Map<string, string>();
  await Promise.all(
    dosyalar.map(async (d) => {
      const c = await getConsultant(d.consultantId);
      danisanAdlari.set(d.id, c.name);
    }),
  );

  const aktif = randevular.filter(
    (r) => r.status === "teklif" || r.status === "kabul",
  );
  const onaylanan = aktif.filter((r) => r.status === "kabul");
  const bekleyen = aktif.filter((r) => r.status === "teklif");
  const toplamDakika = onaylanan.reduce((t, r) => t + r.durationMinutes, 0);

  const buHafta = trHaftaBasi(bugunTr()) === pazartesi;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Ajandam</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          {trTarih(`${pazartesi}T12:00:00Z`)} –{" "}
          {trTarih(`${gunEkle(pazartesi, 6)}T12:00:00Z`)}
        </p>
      </div>

      {/* Hafta gezinmesi */}
      <nav aria-label="Hafta seçimi" className="flex flex-wrap gap-3">
        <Link
          href={`/uzman-panel/ajanda?hafta=${gunEkle(pazartesi, -7)}`}
          className="inline-flex min-h-[3rem] items-center rounded-xl border-2 border-ink-300 bg-white px-5 font-semibold text-ink-800 hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50"
        >
          ← Önceki hafta
        </Link>
        {!buHafta && (
          <Link
            href="/uzman-panel/ajanda"
            className="inline-flex min-h-[3rem] items-center rounded-xl bg-teal-700 px-5 font-semibold text-white hover:-translate-y-px hover:bg-teal-800"
          >
            Bu hafta
          </Link>
        )}
        <Link
          href={`/uzman-panel/ajanda?hafta=${gunEkle(pazartesi, 7)}`}
          className="inline-flex min-h-[3rem] items-center rounded-xl border-2 border-ink-300 bg-white px-5 font-semibold text-ink-800 hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50"
        >
          Sonraki hafta →
        </Link>
      </nav>

      {/* Özet */}
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <dt className="text-ink-600">Onaylanmış görüşme</dt>
          <dd className="text-4xl text-ink-900">{onaylanan.length}</dd>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <dt className="text-ink-600">Yanıt bekleyen</dt>
          <dd className="text-4xl text-ink-900">{bekleyen.length}</dd>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <dt className="text-ink-600">Toplam süre</dt>
          <dd className="text-4xl text-ink-900">
            {Math.floor(toplamDakika / 60)}
            <span className="text-2xl text-ink-600"> sa </span>
            {toplamDakika % 60}
            <span className="text-2xl text-ink-600"> dk</span>
          </dd>
        </div>
      </dl>

      <HaftaIzgarasi
        gunler={gunler}
        randevular={aktif}
        danisanAdlari={danisanAdlari}
      />

      {kurallar.length === 0 && (
        <Notice title="Müsaitliğinizi henüz tanımlamadınız">
          <p className="mb-4">
            Danışanlarınız boş saatlerinizi göremiyor; her görüşmeyi tek tek
            yazışarak ayarlamanız gerekiyor.
          </p>
          <Link
            href="/uzman-panel/musaitlik"
            className="inline-flex min-h-[3rem] items-center rounded-xl bg-teal-700 px-6 font-semibold text-white hover:-translate-y-px hover:bg-teal-800"
          >
            Müsaitliğinizi tanımlayın
          </Link>
        </Notice>
      )}
    </div>
  );
}
