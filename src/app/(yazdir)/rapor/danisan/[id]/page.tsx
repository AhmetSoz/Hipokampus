import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkline } from "@/components/charts/Sparkline";
import { SessionChart } from "@/components/SessionChart";
import { YazdirDugmesi } from "@/components/YazdirDugmesi";
import { listAppointmentsForExpert } from "@/data/appointments";
import { listConversationsForExpert } from "@/data/conversations";
import { getConsultantForExpert, listPlanItems } from "@/data/household";
import { birlesikSeriler, listAliases } from "@/data/measurements";
import { needArea } from "@/data/needs";
import { getCurrentExpert } from "@/data/session";
import { listSessionNotesForConsultantAndExpert } from "@/data/sessions";
import { formatSayi } from "@/lib/sayi";
import { trTarih, trTarihSaat } from "@/lib/zaman";

export const metadata: Metadata = {
  title: "Kayıt özeti",
  robots: { index: false, follow: false },
};

/**
 * Yazdırılabilir kayıt özeti.
 *
 * BELGE KENDİNİ "KAYIT ÖZETİ" OLARAK TANIMLAR — "değerlendirme",
 * "rapor sonucu", "durum raporu" demez. Hiçbir puan, yüzde veya risk
 * düzeyi içermez; yalnızca uzmanın kendi girdiği kayıtları toparlar.
 * Kilitli kararların en kolay delinebileceği yer basılı bir belgedir:
 * eline kağıdı alan kişi onu bir tıbbi rapor sanabilir.
 *
 * Gizlilik sınırı danışan detay sayfasıyla aynı: yalnızca bu uzmanın
 * o danışanla olan dosyaları.
 */
export default async function DanisanRaporu({
  params,
}: PageProps<"/rapor/danisan/[id]">) {
  const { id } = await params;
  const expert = await getCurrentExpert();

  const danisan = await getConsultantForExpert(id, expert.id);
  if (!danisan) notFound();

  const [tumDosyalar, seanslar, aliases, plan, randevular] = await Promise.all([
    listConversationsForExpert(expert.id),
    listSessionNotesForConsultantAndExpert(id, expert.id),
    listAliases(id),
    listPlanItems(id),
    listAppointmentsForExpert(expert.id),
  ]);

  const dosyalar = tumDosyalar.filter((d) => d.consultantId === id);
  const dosyaIdleri = new Set(dosyalar.map((d) => d.id));
  const kendiRandevulari = randevular.filter((r) =>
    dosyaIdleri.has(r.conversationId),
  );
  const seriler = birlesikSeriler(seanslar, aliases);
  const simdi = new Date();

  return (
    <article className="space-y-8 text-ink-900">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <a
          href={`/uzman-panel/danisanlar/${id}`}
          className="text-teal-800 underline underline-offset-4"
        >
          ← Danışan sayfasına dönün
        </a>
        <YazdirDugmesi>Yazdırın veya PDF olarak kaydedin</YazdirDugmesi>
      </div>

      <header className="border-b-2 border-ink-200 pb-6">
        <p className="mb-1 text-base tracking-[0.14em] text-teal-700 uppercase">
          Hipokampüs · Kayıt özeti
        </p>
        <h1 className="mb-3 text-3xl">{danisan.name}</h1>
        <dl className="grid gap-x-8 gap-y-1 text-ink-700 sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-ink-600">Şehir:</dt>
            <dd>{danisan.city}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-600">Doğum yılı:</dt>
            <dd>{danisan.birthYear}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-600">Uzman:</dt>
            <dd>
              {expert.name} · {expert.field}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-600">Belge tarihi:</dt>
            <dd>{trTarih(simdi)}</dd>
          </div>
        </dl>
      </header>

      {/* Zorunlu ibare — belgenin başında, göz kaçırmasın diye. */}
      <p className="rounded-xl border-l-4 border-teal-600 bg-teal-50 px-4 py-3 text-ink-800 print:border print:border-ink-300 print:bg-transparent">
        Hipokampüs bir sağlık kuruluşu değildir. Bu belge tanı, teşhis veya
        tedavi önerisi içermez; uzmanın görüşme sırasında tuttuğu kayıtların
        özetidir. Hiçbir puan veya risk düzeyi hesaplanmamıştır.
      </p>

      <section className="break-inside-avoid">
        <h2 className="mb-3 border-b border-ink-200 pb-1 text-2xl">
          Dosyalar
        </h2>
        <ul className="space-y-1 text-ink-800">
          {dosyalar.map((d) => (
            <li key={d.id}>
              {d.subject}{" "}
              <span className="text-ink-600">
                · {trTarih(d.startedAt)} tarihinde açıldı
              </span>
            </li>
          ))}
        </ul>
      </section>

      {seriler.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="mb-3 border-b border-ink-200 pb-1 text-2xl">
            Ölçümler
          </h2>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-ink-200">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Ölçüm
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  İlk
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Son
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Kayıt
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Seyir
                </th>
              </tr>
            </thead>
            <tbody>
              {seriler.map((s) => {
                const ilk = s.noktalar[0];
                const son = s.noktalar[s.noktalar.length - 1];
                return (
                  <tr key={s.anahtar} className="border-b border-ink-100">
                    <td className="py-2 pr-4">
                      {s.gosterilenEtiket}
                      {s.birim && (
                        <span className="text-ink-600"> ({s.birim})</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{formatSayi(ilk.deger)}</td>
                    <td className="py-2 pr-4">{formatSayi(son.deger)}</td>
                    <td className="py-2 pr-4">{s.noktalar.length}</td>
                    <td className="py-2">
                      <Sparkline
                        values={s.noktalar.map((n) => n.deger)}
                        label={s.gosterilenEtiket}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {seriler
              .filter((s) => s.noktalar.length >= 2)
              .map((s) => (
                <SessionChart
                  key={s.anahtar}
                  label={s.gosterilenEtiket}
                  unit={s.birim}
                  points={s.noktalar.map((n) => ({
                    date: n.tarih,
                    value: n.deger,
                  }))}
                />
              ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 border-b border-ink-200 pb-1 text-2xl">
          Seans notları
        </h2>
        {seanslar.length === 0 ? (
          <p className="text-ink-600">Kayıtlı seans notu yok.</p>
        ) : (
          <ul className="space-y-5">
            {seanslar.map((s) => (
              <li key={s.id} className="break-inside-avoid">
                <p className="font-semibold">
                  {trTarih(s.occurredAt)} · {s.title}
                  <span className="ml-2 font-normal text-ink-600">
                    ({s.conversationSubject}
                    {s.status === "taslak" && " · taslak"})
                  </span>
                </p>
                <p className="text-ink-800">{s.note}</p>
                {s.measurements.length > 0 && (
                  <p className="mt-1 text-base text-ink-700">
                    {s.measurements
                      .map(
                        (m) => `${m.label}: ${m.value}${m.unit ? ` ${m.unit}` : ""}`,
                      )
                      .join(" · ")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {plan.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="mb-3 border-b border-ink-200 pb-1 text-2xl">
            Danışmanlık planı
          </h2>
          <ul className="space-y-2">
            {plan.map((p) => (
              <li key={p.id}>
                <span className="font-semibold">{p.title}</span>
                <span className="text-ink-600">
                  {" "}
                  · {needArea(p.needArea).label} ·{" "}
                  {p.status === "tamamlandi"
                    ? "tamamlandı"
                    : p.status === "surüyor"
                      ? "sürüyor"
                      : "yapılacak"}
                </span>
                <p className="text-ink-800">{p.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {kendiRandevulari.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="mb-3 border-b border-ink-200 pb-1 text-2xl">
            Görüşmeler
          </h2>
          <ul className="space-y-1 text-ink-800">
            {[...kendiRandevulari]
              .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
              .map((r) => (
                <li key={r.id}>
                  {trTarihSaat(r.startsAt)} · {r.durationMinutes} dakika ·{" "}
                  {r.status === "tamamlandi"
                    ? "yapıldı"
                    : r.status === "kabul"
                      ? "planlandı"
                      : r.status === "iptal"
                        ? "iptal"
                        : r.status === "reddedildi"
                          ? "reddedildi"
                          : "teklif"}
                </li>
              ))}
          </ul>
        </section>
      )}

      <footer className="border-t border-ink-200 pt-4 text-base text-ink-600">
        <p>
          Bu belge {trTarihSaat(simdi)} tarihinde Hipokampüs üzerinden
          oluşturuldu. Acil bir durumda 112&apos;yi arayın.
        </p>
      </footer>
    </article>
  );
}
