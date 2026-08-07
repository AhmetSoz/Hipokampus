import type { Metadata } from "next";
import Link from "next/link";
import { BarChart, ProgressRing } from "@/components/Charts";
import { NeedIcon } from "@/components/NeedIcon";
import { DemoNotice, Notice } from "@/components/ui";
import { listAppointmentsForConsultant } from "@/data/appointments";
import { listAssignmentsForConsultant } from "@/data/assessments";
import { getConsultant, listPlanItems } from "@/data/household";
import { getExpertById } from "@/data/experts";
import { needArea } from "@/data/needs";
import {
  getCurrentConsultantId,
  getCurrentMember,
  getCurrentUser,
} from "@/data/session";

export const metadata: Metadata = { title: "Genel bakış" };

function formatRandevu(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PanelGenelBakis() {
  const consultantId = await getCurrentConsultantId();
  const [member, consultant, plan, user] = await Promise.all([
    getCurrentMember(),
    getConsultant(consultantId),
    listPlanItems(consultantId),
    getCurrentUser(),
  ]);

  const demoMode = user?.consultantId == null;
  const canSeeHealth = member.scopes.includes("saglik-gorusme");

  /* Bekleyen işler yalnızca sağlık kapsamı olan kişiye gösterilir —
     randevu ve formlar bu kapsamın içinde. */
  const [randevular, formlar] = canSeeHealth
    ? await Promise.all([
        listAppointmentsForConsultant(consultantId),
        listAssignmentsForConsultant(consultantId),
      ])
    : [[], []];
  const bekleyenRandevular = randevular.filter((r) => r.status === "teklif");
  const bekleyenFormlar = formlar.filter((f) => f.status === "atandi");

  /* Plan maddelerinin hangi konularda yoğunlaştığı — çubuk grafik için. */
  const konuSayilari = new Map<string, number>();
  for (const p of plan) {
    const ad = needArea(p.needArea).label;
    konuSayilari.set(ad, (konuSayilari.get(ad) ?? 0) + 1);
  }
  const konuDagilimi = [...konuSayilari.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  // Planı yazan uzman; yeni hesapta plan boş olabilir.
  const expert = plan[0]
    ? await getExpertById(plan[0].authorExpertId)
    : null;
  const open = plan.filter((p) => p.status !== "tamamlandi");
  const done = plan.length - open.length;

  return (
    <div className="space-y-8">
      {/* "Temsilî kayıt" uyarısı yalnızca demo hanede anlamlı; gerçek
          hesapla giren kişiye kendi kaydı için bunu söylemek yanlış. */}
      {demoMode && (
        <DemoNotice>
          Bu panel {consultant.name} ailesinin temsilî kaydıdır. Gerçek bir
          kişiye ait değildir.
        </DemoNotice>
      )}

      <div>
        <h1 className="mb-2 text-3xl sm:text-4xl">
          Merhaba {member.name.split(" ")[0]}
        </h1>
        <p className="text-lg text-ink-700">
          {canSeeHealth
            ? `${consultant.name} için hazırlanan planda ${open.length} madde bekliyor.`
            : `${consultant.name} için bir danışmanlık süreci yürüyor. Sağlık ve görüşme bilgilerine erişiminiz bulunmuyor.`}
        </p>
      </div>

      {canSeeHealth ? (
        <>
          {/* Bekleyen işler en üstte: panele giren kişi önce "benden ne
              bekleniyor" sorusunun cevabını görmeli. Ana sayfadaki devam
              kartıyla aynı mantık; panelde de olmalıydı. */}
          {(bekleyenRandevular.length > 0 || bekleyenFormlar.length > 0) && (
            <section className="rounded-2xl border-2 border-teal-300 bg-teal-50 p-7 shadow-[var(--shadow-soft)]">
              <h2 className="mb-4 text-2xl">Sizden bekleniyor</h2>
              <ul className="space-y-3">
                {bekleyenRandevular.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/panel/mesajlar/${r.conversationId}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-white px-5 py-4 hover:-translate-y-px hover:shadow-[var(--shadow-soft)]"
                    >
                      <span className="text-ink-900">
                        <strong className="font-semibold">Görüşme önerisi</strong>{" "}
                        · {formatRandevu(r.startsAt)}
                      </span>
                      <span className="font-semibold text-teal-800">
                        Onaylayın →
                      </span>
                    </Link>
                  </li>
                ))}
                {bekleyenFormlar.map((f) => (
                  <li key={f.id}>
                    <Link
                      href={`/panel/formlar/${f.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal-200 bg-white px-5 py-4 hover:-translate-y-px hover:shadow-[var(--shadow-soft)]"
                    >
                      <span className="text-ink-900">
                        <strong className="font-semibold">Form</strong> ·{" "}
                        {f.templateTitle} ({f.items.length} soru)
                      </span>
                      <span className="font-semibold text-teal-800">
                        Doldurun →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-7">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-2xl">Sıradaki adımlar</h2>
              <Link
                href="/panel/plan"
                className="text-teal-800 underline underline-offset-4"
              >
                Planın tamamı
              </Link>
            </div>

            {/* İlerleme: halka + konu dağılımı. Düz metin ("4 maddeden 1
                tanesi") oranı da dağılımı da anlatmıyordu. */}
            {plan.length > 0 && (
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <ProgressRing
                  done={done}
                  total={plan.length}
                  label="plan maddesi tamamlandı"
                />
                <BarChart
                  title="Konu dağılımı"
                  items={konuDagilimi}
                  unit="madde"
                />
              </div>
            )}

            <ul className="space-y-4">
              {open.slice(0, 3).map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-ink-200 bg-paper-warm p-5 shadow-[var(--shadow-soft)]"
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-700"
                  >
                    <NeedIcon area={item.needArea} className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="mb-1 block text-lg font-semibold text-ink-900">
                      {item.title}
                    </span>
                    <span className="block text-base text-ink-600">
                      {needArea(item.needArea).label}
                      {item.status === "surüyor" && " · sürüyor"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {expert && (
            <section className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-7">
              <h2 className="mb-4 text-2xl">Görüştüğünüz uzman</h2>
              <p className="text-lg text-ink-900">{expert.name}</p>
              <p className="mb-4 text-ink-600">
                {expert.field} · {expert.city}
              </p>
              <Link
                href="/panel/mesajlar"
                className="inline-flex min-h-[3.25rem] items-center rounded-xl border-2 border-teal-700 px-6 font-semibold text-teal-800 hover:-translate-y-px hover:bg-teal-50 hover:shadow-[var(--shadow-card)] active:scale-[0.97]"
              >
                Danışma dosyasını açın
              </Link>
            </section>
          )}
        </>
      ) : (
        <Notice tone="teal" title="Bu bölümü göremiyorsunuz">
          <p>
            Sağlık ve görüşme bilgilerine erişiminiz bulunmuyor. Bu yetkiyi
            yalnızca {consultant.name} verebilir.
          </p>
          <p>
            {member.payer &&
              "Ödemeyi siz yapıyorsunuz; ödeme yapmak sağlık ve görüşme verisini görme hakkı vermez."}
          </p>
        </Notice>
      )}

      <section className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-7">
        <h2 className="mb-4 text-2xl">Erişiminiz</h2>
        <p className="mb-5 text-ink-700">
          Panelde neyi görüp neyi göremediğinizi ve bunu kimin belirlediğini
          erişim sayfasından inceleyebilirsiniz.
        </p>
        <Link
          href="/panel/erisim"
          className="inline-flex min-h-[3.25rem] items-center rounded-xl border-2 border-teal-700 px-6 font-semibold text-teal-800 hover:-translate-y-px hover:bg-teal-50 hover:shadow-[var(--shadow-card)] active:scale-[0.97]"
        >
          Erişim ve izinler
        </Link>
      </section>

      <Notice>
        <p>
          Hipokampüs bir sağlık kuruluşu değildir; tanı koymaz, tedavi uygulamaz,
          acil müdahale sunmaz. Acil bir durumda{" "}
          <strong className="text-ink-900">112&apos;yi arayın.</strong>
        </p>
      </Notice>
    </div>
  );
}
