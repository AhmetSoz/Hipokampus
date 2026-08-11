import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentPanel } from "@/components/AppointmentPanel";
import {
  ConversationHeader,
  ConversationThread,
} from "@/components/ConversationThread";
import { SessionLog } from "@/components/SessionLog";
import { SlotSecici } from "@/components/ajanda/SlotSecici";
import { FormHatasi } from "@/components/FormHatasi";
import { listAppointments } from "@/data/appointments";
import { listOpenSlots } from "@/data/availability";
import { Notice } from "@/components/ui";
import { getConversation } from "@/data/conversations";
import { getExpertById } from "@/data/experts";
import { getCurrentConsultantId, getCurrentMember } from "@/data/session";
import { listSessionNotes } from "@/data/sessions";

export default async function DanismaDosyasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const member = await getCurrentMember();

  if (!member.scopes.includes("saglik-gorusme")) {
    return (
      <Notice tone="teal" title="Bu dosyayı göremiyorsunuz">
        <p>
          Danışma dosyaları sağlık ve görüşme kapsamındadır. Bu yetkiyi yalnızca
          panel sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const { id } = await params;
  const sp = await searchParams;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  /* Yetki: dosya bu haneye ait değilse yokmuş gibi davran. Gerçek
     hesaplar geldiğinde adres çubuğuna başka bir dosya kimliği yazmak
     mümkün hâle geldi; "bulunamadı" demek, "var ama göremezsin"
     demekten daha az bilgi sızdırır. */
  if (conversation.consultantId !== (await getCurrentConsultantId())) {
    notFound();
  }

  const expert = await getExpertById(conversation.expertId);
  if (!expert) notFound();

  const [sessions, appointments, slotGunleri] = await Promise.all([
    listSessionNotes(id, { onlyPublished: true }),
    listAppointments(id),
    listOpenSlots(conversation.expertId, { gunSayisi: 14 }),
  ]);

  /* Zaten onaylanmış bir görüşme varken yeni slot sunmak, danışanı
     ikinci bir randevu almaya davet ediyor gibi okunuyor. Bekleyen ya da
     onaylanmış bir randevu yoksa gösteriyoruz. */
  const aktifRandevu = appointments.some(
    (a) => a.status === "teklif" || a.status === "kabul",
  );

  return (
    <div className="space-y-6">
      <Link
        href="/panel/mesajlar"
        className="inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
      >
        ← Tüm dosyalar
      </Link>
      <ConversationHeader
        conversation={conversation}
        counterpartName={expert.name}
        viewer="danisan"
      />
      <ConversationThread
        conversation={conversation}
        viewer="danisan"
        bosMesajHatasi={sp.hata === "bos"}
      />
      <AppointmentPanel
        conversationId={id}
        viewer="danisan"
        appointments={appointments}
        canPropose={false}
      />

      {conversation.status !== "tamamlandi" && !aktifRandevu && (
        <section className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-1 text-2xl">Görüşme saati seçin</h2>
          <p className="mb-5 text-ink-600">
            {expert.name} bu saatlerde müsait. Seçtiğiniz saat doğrudan
            onaylanır; ayrıca beklemeniz gerekmez.
          </p>

          {sp.slotHata === "dolu" && (
            <FormHatasi>
              Bu saat az önce doldu. Listeyi güncelledik, lütfen başka bir saat
              seçin.
            </FormHatasi>
          )}
          {sp.slotHata === "gecersiz" && (
            <FormHatasi>Seçilen saat geçerli değil.</FormHatasi>
          )}

          <SlotSecici conversationId={id} gunler={slotGunleri} />
        </section>
      )}

      {sp.slotAlindi && (
        <div
          role="status"
          className="rounded-xl border-l-4 border-teal-600 bg-teal-50 px-4 py-3 font-semibold text-teal-900"
        >
          Görüşme saatiniz onaylandı. Yukarıdaki takvimde görebilirsiniz.
        </div>
      )}
      <SessionLog
        conversationId={id}
        viewer="danisan"
        sessions={sessions}
        canAdd={false}
      />
    </div>
  );
}
