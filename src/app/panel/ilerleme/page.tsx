import type { Metadata } from "next";
import { KatilimHaritasi } from "@/components/charts/KatilimHaritasi";
import { Sparkline } from "@/components/charts/Sparkline";
import { YigiliCubuk } from "@/components/charts/YigiliCubuk";
import {
  ZamanCizelgesi,
  type ZamanOlayi,
} from "@/components/charts/ZamanCizelgesi";
import { ProgressRing } from "@/components/Charts";
import { SessionChart } from "@/components/SessionChart";
import { Notice } from "@/components/ui";
import { listAppointmentsForConsultant } from "@/data/appointments";
import { listAssignmentsForConsultant } from "@/data/assessments";
import { listConversationsForConsultant } from "@/data/conversations";
import { listPlanItems } from "@/data/household";
import { birlesikSeriler, listAliases } from "@/data/measurements";
import { needArea } from "@/data/needs";
import { getCurrentConsultantId, getCurrentMember } from "@/data/session";
import { listSessionNotes } from "@/data/sessions";
import { formatSayi } from "@/lib/sayi";
import { bugunTr, trTarih } from "@/lib/zaman";

export const metadata: Metadata = { title: "İlerlemem" };

/**
 * Danışanın "zaman içinde ne değişti?" ekranı.
 *
 * Bu sayfa BİR DEĞERLENDİRME DEĞİLDİR ve hiçbir yorum cümlesi kurmaz —
 * "iyi gidiyorsunuz", "gelişme var" gibi ifadeler YOK. Kilitli karar:
 * puan/skor üretilmez, yorum uzmana aittir. Gösterilen her şey uzmanın
 * kendi girdiği ham kayıtların zaman içindeki görünümü.
 *
 * Yalnızca YAYINLANMIŞ seanslar görünür: taslak notlar uzmanın kendi
 * çalışma alanıdır.
 */
export default async function IlerlemeSayfasi() {
  const member = await getCurrentMember();

  if (!member.scopes.includes("saglik-gorusme")) {
    return (
      <Notice tone="teal" title="Bu bölümü göremiyorsunuz">
        <p>
          İlerleme kayıtları sağlık ve görüşme kapsamındadır. Bu yetkiyi
          yalnızca panel sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const consultantId = await getCurrentConsultantId();
  const [dosyalar, plan, atamalar, randevular, aliases] = await Promise.all([
    listConversationsForConsultant(consultantId),
    listPlanItems(consultantId),
    listAssignmentsForConsultant(consultantId),
    listAppointmentsForConsultant(consultantId),
    listAliases(consultantId),
  ]);

  const seanslar = await listSessionNotes(
    dosyalar.map((d) => d.id),
    { onlyPublished: true },
  );
  const seriler = birlesikSeriler(seanslar, aliases);

  const dosyaKonusu = new Map(dosyalar.map((d) => [d.id, d.subject]));

  /* Plan maddeleri: ihtiyaç alanı × durum. */
  const alanlar = [...new Set(plan.map((p) => p.needArea))];
  const yigili = alanlar.map((a) => ({
    ad: needArea(a).label,
    degerler: [
      plan.filter((p) => p.needArea === a && p.status === "tamamlandi").length,
      plan.filter((p) => p.needArea === a && p.status === "surüyor").length,
      plan.filter((p) => p.needArea === a && p.status === "yapilacak").length,
    ],
  }));

  const tamamlanan = plan.filter((p) => p.status === "tamamlandi").length;

  const olaylar: ZamanOlayi[] = [
    ...seanslar.map((s) => ({
      id: `s-${s.id}`,
      tarih: s.occurredAt,
      tur: "seans" as const,
      baslik: s.title,
      detay: dosyaKonusu.get(s.conversationId),
    })),
    ...randevular
      .filter((r) => r.status === "kabul" || r.status === "tamamlandi")
      .map((r) => ({
        id: `r-${r.id}`,
        tarih: r.startsAt,
        tur: "randevu" as const,
        baslik: `${r.durationMinutes} dakikalık görüşme`,
        detay: dosyaKonusu.get(r.conversationId),
      })),
    ...atamalar
      .filter((a) => a.status === "tamamlandi")
      .map((a) => ({
        id: `f-${a.id}`,
        tarih: a.assignedAt,
        tur: "form" as const,
        baslik: a.templateTitle,
        detay: "Yanıtladınız",
      })),
    ...plan.map((p) => ({
      id: `p-${p.id}`,
      tarih: p.createdAt,
      tur: "plan" as const,
      baslik: p.title,
      detay: needArea(p.needArea).label,
    })),
  ];

  const bugun = bugunTr();
  const bosMu = seanslar.length === 0 && plan.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">İlerlemem</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Uzmanınızın kaydettiği bilgilerin zaman içindeki görünümü.
        </p>
      </div>

      {/* Bu uyarı kalıcı ve kaldırılmamalı: sayfanın bir değerlendirme
          sanılması, projenin "puan/skor yok" ilkesinin en kolay
          delindiği yer olurdu. */}
      <Notice title="Bu sayfa bir değerlendirme değildir">
        <p>
          Burada hiçbir puan, yüzde veya risk düzeyi hesaplanmaz. Gördüğünüz
          sayılar uzmanınızın seans sırasında kendi girdiği ham ölçümlerdir.
          Bunların ne anlama geldiğini uzmanınız yorumlar.
        </p>
      </Notice>

      {bosMu ? (
        <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-7">
          <h2 className="mb-2 text-xl text-ink-900">Henüz kayıt yok</h2>
          <p className="text-ink-800">
            Uzmanınızla ilk görüşmeniz yapıldığında seans notları ve varsa
            ölçümler burada birikmeye başlar.
          </p>
        </div>
      ) : (
        <>
          {plan.length > 0 && (
            <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <h2 className="mb-5 text-2xl">Danışmanlık planı</h2>
              <div className="flex flex-wrap items-center gap-8">
                <ProgressRing
                  done={tamamlanan}
                  total={plan.length}
                  label="madde tamamlandı"
                />
                <div className="min-w-[16rem] flex-1">
                  <YigiliCubuk
                    seriEtiketleri={["Tamamlandı", "Sürüyor", "Yapılacak"]}
                    satirlar={yigili}
                  />
                </div>
              </div>
            </section>
          )}

          {seriler.length > 0 && (
            <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <h2 className="mb-1 text-2xl">Ölçümler</h2>
              <p className="mb-5 text-ink-600">
                Uzmanınızın seans sırasında kaydettiği değerler.
              </p>

              <ul className="mb-6 space-y-2">
                {seriler.map((s) => (
                  <li
                    key={s.anahtar}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper-warm p-4"
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink-900">
                        {s.gosterilenEtiket}
                      </span>
                      <span className="text-base text-ink-600">
                        Son: {formatSayi(s.noktalar[s.noktalar.length - 1].deger)}
                        {s.birim && ` ${s.birim}`} ·{" "}
                        {trTarih(s.noktalar[s.noktalar.length - 1].tarih)}
                      </span>
                    </span>
                    <Sparkline
                      values={s.noktalar.map((n) => n.deger)}
                      label={s.gosterilenEtiket}
                    />
                  </li>
                ))}
              </ul>

              <div className="grid gap-5 lg:grid-cols-2">
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

          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h2 className="mb-1 text-2xl">Hareket takvimi</h2>
            <p className="mb-5 text-ink-600">
              Son 12 haftada hangi günlerde bir kayıt oluştu.
            </p>
            <KatilimHaritasi
              tarihler={olaylar.map((o) => o.tarih)}
              bugun={bugun}
            />
          </section>

          <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h2 className="mb-1 text-2xl">Neler oldu?</h2>
            <p className="mb-5 text-ink-600">En yeniden eskiye.</p>
            <ZamanCizelgesi olaylar={olaylar} />
          </section>
        </>
      )}
    </div>
  );
}
