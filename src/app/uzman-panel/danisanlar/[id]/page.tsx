import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OlcumBirlestirme } from "@/components/danisan/OlcumBirlestirme";
import { SekmeCubugu, sekmeCoz } from "@/components/SekmeCubugu";
import { SessionChart } from "@/components/SessionChart";
import { Notice } from "@/components/ui";
import { listAppointmentsForExpert } from "@/data/appointments";
import { listAssignmentsForConsultant } from "@/data/assessments";
import { listConversationsForExpert } from "@/data/conversations";
import { getConsultantForExpert, listPlanItems } from "@/data/household";
import { birlesikSeriler, birlesmeOnerileri, listAliases } from "@/data/measurements";
import { getCurrentExpert } from "@/data/session";
import { listSessionNotesForConsultantAndExpert } from "@/data/sessions";
import { randevuDurumEtiketi } from "@/data/types";
import { formatSayi } from "@/lib/sayi";
import { trTarih, trTarihSaat } from "@/lib/zaman";

export const metadata: Metadata = { title: "Danışan" };

/**
 * Uzman için danışan detay sayfası.
 *
 * Önceden her şey DOSYA bazında parçalıydı: aynı danışanla iki dosya
 * varsa seans notları iki ayrı yerde duruyor, ölçüm trendi dosya
 * sınırında kopuyordu. Burada hepsi tek ekranda.
 *
 * GİZLİLİK SINIRI: "birleşik" = BU UZMANIN bu danışanla olan dosyaları.
 * Danışanın tüm dosyaları değil. Bir danışan birden fazla uzmanla
 * çalışabilir; uzman A'ya uzman B'nin seans notlarını göstermek,
 * "ödeme yapmak sağlık verisini görme hakkı vermez" kilidiyle aynı
 * kategoriden bir ihlal olurdu. Yetki `getConsultantForExpert` ile veri
 * katmanında, sayfada değil.
 */

const SEKMELER = [
  { id: "ozet", label: "Özet" },
  { id: "seanslar", label: "Seanslar" },
  { id: "olcumler", label: "Ölçümler" },
  { id: "formlar", label: "Formlar" },
  { id: "randevular", label: "Randevular" },
] as const;

export default async function DanisanDetaySayfasi({
  params,
  searchParams,
}: PageProps<"/uzman-panel/danisanlar/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const expert = await getCurrentExpert();

  /* Uzmanın bu danışanla dosyası yoksa "bulunamadı" — "var ama
     göremezsin" demekten daha az bilgi sızdırır (mevcut dosya
     sayfalarındaki desenle aynı). */
  const danisan = await getConsultantForExpert(id, expert.id);
  if (!danisan) notFound();

  const aktif = sekmeCoz(sp.gorunum, SEKMELER);

  const [tumDosyalar, seanslar, aliases, atamalar, plan, randevular] =
    await Promise.all([
      listConversationsForExpert(expert.id),
      listSessionNotesForConsultantAndExpert(id, expert.id),
      listAliases(id),
      listAssignmentsForConsultant(id),
      listPlanItems(id),
      listAppointmentsForExpert(expert.id),
    ]);

  const dosyalar = tumDosyalar.filter((d) => d.consultantId === id);
  const dosyaIdleri = new Set(dosyalar.map((d) => d.id));

  /* Formlar da aynı gizlilik sınırına tabi: başka bir uzmanın attığı
     form bu ekranda görünmez. */
  const kendiAtamalari = atamalar.filter(
    (a) => a.assignedByExpertId === expert.id,
  );
  const kendiRandevulari = randevular.filter((r) =>
    dosyaIdleri.has(r.conversationId),
  );

  const seriler = birlesikSeriler(seanslar, aliases);
  const oneriler = birlesmeOnerileri(seanslar, aliases);

  const dosyaKonusu = new Map(dosyalar.map((d) => [d.id, d.subject]));
  const base = `/uzman-panel/danisanlar/${id}`;

  /* Sunucu bileşeni her istekte yeniden render edildiği için "şimdi"yi
     burada okumak doğru; tek yerde tutuluyor ki aynı render içindeki
     karşılaştırmalar tutarlı olsun. */
  const simdi = new Date();

  const bekleyenForm = kendiAtamalari.filter(
    (a) => a.status !== "tamamlandi",
  ).length;
  const yaklasanRandevu = kendiRandevulari.filter(
    (r) =>
      (r.status === "teklif" || r.status === "kabul") &&
      new Date(r.startsAt) > simdi,
  );

  return (
    <div className="space-y-7">
      <Link
        href="/uzman-panel/danisanlar"
        className="inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
      >
        ← Tüm danışanlarım
      </Link>

      <header className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <h1 className="mb-2 text-3xl sm:text-4xl">{danisan.name}</h1>
        <p className="mb-4 text-lg text-ink-600">
          {danisan.city} · {simdi.getFullYear() - danisan.birthYear} yaşında
        </p>
        <p className="text-ink-700">{danisan.summary}</p>
        <p className="mt-5 border-t border-ink-100 pt-4 text-base text-ink-600">
          Bu sayfada yalnızca <strong>sizinle açılan dosyalar</strong> görünür.
          Danışanın başka uzmanlarla yürüttüğü süreçler burada yer almaz.
        </p>
      </header>

      <SekmeCubugu
        basePath={base}
        param="gorunum"
        sekmeler={SEKMELER}
        aktif={aktif}
        rozetler={{
          seanslar: seanslar.length,
          olcumler: oneriler.length,
          formlar: bekleyenForm,
          randevular: yaklasanRandevu.length,
        }}
        etiket="Danışan bölümleri"
      />

      {aktif === "ozet" && (
        <div className="space-y-6">
          <dl className="grid gap-4 sm:grid-cols-4">
            {[
              ["Açık dosya", dosyalar.filter((d) => d.status !== "tamamlandi").length],
              ["Seans", seanslar.length],
              ["Bekleyen form", bekleyenForm],
              ["Yaklaşan görüşme", yaklasanRandevu.length],
            ].map(([etiket, deger]) => (
              <div
                key={etiket}
                className="rounded-2xl border border-ink-200 bg-white p-5 shadow-[var(--shadow-soft)]"
              >
                <dt className="text-ink-600">{etiket}</dt>
                <dd className="text-3xl text-ink-900">{deger}</dd>
              </div>
            ))}
          </dl>

          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-4 text-2xl">Dosyalarınız</h2>
            <ul className="space-y-3">
              {dosyalar.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/uzman-panel/mesajlar/${d.id}?sekme=yazisma`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper-warm p-4 transition-[transform,border-color] duration-[var(--dur-fast)] hover:-translate-y-px hover:border-teal-300"
                  >
                    <span className="font-semibold text-ink-900">
                      {d.subject}
                    </span>
                    <span className="text-base text-ink-600">
                      {d.messages.length} mesaj · {trTarih(d.startedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {plan.length > 0 && (
            <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="mb-4 text-2xl">Danışmanlık planı</h2>
              <ul className="space-y-2">
                {plan.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper-warm p-4"
                  >
                    <span className="text-ink-800">{p.title}</span>
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-base font-semibold text-teal-900">
                      {p.status === "tamamlandi"
                        ? "Tamamlandı"
                        : p.status === "surüyor"
                          ? "Sürüyor"
                          : "Yapılacak"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {aktif === "seanslar" && (
        <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-1 text-2xl">Tüm seanslar</h2>
          <p className="mb-5 text-ink-600">
            Dosya fark etmeksizin, en yeniden eskiye.
          </p>
          {seanslar.length === 0 ? (
            <p className="text-ink-600">Henüz seans notu yok.</p>
          ) : (
            <ul className="space-y-4">
              {seanslar.map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-ink-200 bg-paper-warm p-5"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-semibold text-ink-900">
                      {s.title}
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-base text-ink-700">
                        {s.conversationSubject}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-base font-semibold ${
                          s.status === "yayinda"
                            ? "bg-teal-100 text-teal-900"
                            : "bg-ink-100 text-ink-700"
                        }`}
                      >
                        {s.status === "yayinda" ? "Yayında" : "Taslak"}
                      </span>
                    </span>
                  </div>
                  <p className="mb-2 text-base text-ink-600">
                    {trTarih(s.occurredAt)}
                  </p>
                  <p className="text-ink-700">{s.note}</p>
                  {s.measurements.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {s.measurements.map((m) => (
                        <li
                          key={m.id}
                          className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-base text-ink-800"
                        >
                          {m.label}: <strong>{m.value}</strong>
                          {m.unit && ` ${m.unit}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {aktif === "olcumler" && (
        <div className="space-y-6">
          <OlcumBirlestirme
            consultantId={id}
            oneriler={oneriler}
            seriler={seriler}
          />

          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="mb-1 text-2xl">Ölçüm trendleri</h2>
            <p className="mb-5 text-ink-600">
              Tüm dosyalarınızdaki ölçümler birlikte. Bu bir değerlendirme
              değildir; girdiğiniz ham değerlerin zaman içindeki seyridir.
            </p>

            {seriler.length === 0 ? (
              <p className="text-ink-600">
                Sayısal ölçüm girilmiş bir seans yok.
              </p>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {seriler.map((s) =>
                  s.noktalar.length >= 2 ? (
                    <SessionChart
                      key={s.anahtar}
                      label={s.gosterilenEtiket}
                      unit={s.birim}
                      points={s.noktalar.map((n) => ({
                        date: n.tarih,
                        value: n.deger,
                      }))}
                    />
                  ) : (
                    <div
                      key={s.anahtar}
                      className="rounded-xl border border-ink-200 bg-paper-warm p-4"
                    >
                      <p className="font-semibold text-ink-900">
                        {s.gosterilenEtiket}
                        {s.birim && (
                          <span className="font-normal text-ink-600">
                            {" "}
                            ({s.birim})
                          </span>
                        )}
                      </p>
                      <p className="text-3xl text-ink-900">
                        {formatSayi(s.noktalar[0].deger)}
                      </p>
                      <p className="text-base text-ink-600">
                        Tek ölçüm — trend için en az iki kayıt gerekir.
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {aktif === "formlar" && (
        <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-1 text-2xl">Gönderdiğiniz formlar</h2>
          <p className="mb-5 text-ink-600">
            Yalnızca sizin atadıklarınız görünür.
          </p>
          {kendiAtamalari.length === 0 ? (
            <p className="text-ink-600">Henüz form göndermediniz.</p>
          ) : (
            <ul className="space-y-3">
              {kendiAtamalari.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper-warm p-4"
                >
                  <span>
                    <span className="block font-semibold text-ink-900">
                      {a.templateTitle}
                    </span>
                    <span className="text-base text-ink-600">
                      {trTarih(a.assignedAt)} tarihinde gönderildi
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-base font-semibold ${
                      a.status === "tamamlandi"
                        ? "bg-teal-100 text-teal-900"
                        : "bg-sky-200 text-ink-900"
                    }`}
                  >
                    {a.status === "tamamlandi" ? "Yanıtlandı" : "Bekliyor"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {aktif === "randevular" && (
        <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-1 text-2xl">Görüşme geçmişi</h2>
          <p className="mb-5 text-ink-600">
            Bu danışanla olan tüm görüşmeleriniz.
          </p>
          {kendiRandevulari.length === 0 ? (
            <p className="text-ink-600">Henüz görüşme planlanmadı.</p>
          ) : (
            <ul className="space-y-3">
              {[...kendiRandevulari]
                .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
                .map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper-warm p-4"
                  >
                    <span>
                      <span className="block font-semibold text-ink-900">
                        {trTarihSaat(r.startsAt)}
                      </span>
                      <span className="text-base text-ink-600">
                        {r.durationMinutes} dakika ·{" "}
                        {dosyaKonusu.get(r.conversationId) ?? "Dosya"}
                      </span>
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-base font-semibold text-ink-800">
                      {randevuDurumEtiketi(r.status, r.proposedBy, "uzman")}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      )}

      {seanslar.length === 0 && aktif === "ozet" && (
        <Notice title="Henüz seans notu yok">
          <p>
            Seans notlarını dosyanın içinden ekliyorsunuz. Eklediğiniz ölçümler
            burada birleşik bir trend olarak görünür.
          </p>
        </Notice>
      )}
    </div>
  );
}
