import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentPanel } from "@/components/AppointmentPanel";
import {
  ConversationHeader,
  ConversationThread,
} from "@/components/ConversationThread";
import {
  DosyaSekmeleri,
  normalizeSekme,
} from "@/components/DosyaSekmeleri";
import { ExpertTools } from "@/components/ExpertTools";
import { SessionLog } from "@/components/SessionLog";
import { listAppointments } from "@/data/appointments";
import {
  listAssignmentsForConsultant,
  listTemplates,
} from "@/data/assessments";
import { getConversation } from "@/data/conversations";
import { getConsultant, listPlanItems } from "@/data/household";
import { getCurrentExpert } from "@/data/session";
import { listSessionNotes } from "@/data/sessions";

export default async function UzmanDanismaDosyasi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const conversation = await getConversation(id);
  if (!conversation) notFound();

  /* Yetki: dosya bu uzmana ait değilse yokmuş gibi davran — bkz. danışan
     tarafındaki aynı kontrol. */
  const current = await getCurrentExpert();
  if (conversation.expertId !== current.id) notFound();

  const [consultant, sessions, appointments, templates, assignments, tasks] =
    await Promise.all([
      getConsultant(conversation.consultantId),
      listSessionNotes(id),
      listAppointments(id),
      listTemplates(),
      listAssignmentsForConsultant(conversation.consultantId),
      listPlanItems(conversation.consultantId),
    ]);

  const open = conversation.status !== "tamamlandi";
  const sekme = normalizeSekme(sp.sekme);
  const basePath = `/uzman-panel/mesajlar/${id}`;

  return (
    <div className="space-y-6">
      <Link
        href="/uzman-panel"
        className="inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
      >
        ← Genel bakış
      </Link>

      <ConversationHeader
        conversation={conversation}
        counterpartName={consultant.name}
        viewer="uzman"
      />

      <DosyaSekmeleri
        basePath={basePath}
        aktif={sekme}
        rozetler={{
          seanslar: sessions.length,
          formlar: assignments.filter((a) => a.status === "tamamlandi").length,
          gorevler: tasks.filter((t) => t.status !== "tamamlandi").length,
        }}
      />

      {sekme === "yazisma" && (
        <>
          <ConversationThread
            conversation={conversation}
            viewer="uzman"
            bosMesajHatasi={sp.hata === "bos"}
          />
          <AppointmentPanel
            conversationId={id}
            viewer="uzman"
            appointments={appointments}
            canPropose={open}
            hata={
              typeof sp.randevuHata === "string" ? sp.randevuHata : undefined
            }
          />
        </>
      )}

      {sekme === "seanslar" && (
        <SessionLog
          conversationId={id}
          viewer="uzman"
          sessions={sessions}
          canAdd={open}
          seansHata={sp.seansHata === "eksik"}
        />
      )}

      {(sekme === "formlar" || sekme === "gorevler") && (
        <ExpertTools
          conversationId={id}
          consultantId={conversation.consultantId}
          templates={templates}
          assignments={assignments}
          tasks={tasks}
          bolum={sekme === "formlar" ? "formlar" : "gorevler"}
          gorevHata={sp.gorevHata === "eksik"}
        />
      )}
    </div>
  );
}
