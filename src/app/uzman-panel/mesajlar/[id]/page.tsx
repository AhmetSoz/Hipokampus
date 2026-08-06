import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentPanel } from "@/components/AppointmentPanel";
import { ConversationThread } from "@/components/ConversationThread";
import { ExpertTools } from "@/components/ExpertTools";
import { SessionLog } from "@/components/SessionLog";
import { listAppointments } from "@/data/appointments";
import {
  listAssignmentsForConsultant,
  listTemplates,
} from "@/data/assessments";
import { getConversation } from "@/data/conversations";
import { getExpertById } from "@/data/experts";
import { listPlanItems } from "@/data/household";
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

  const expert = await getExpertById(conversation.expertId);
  if (!expert) notFound();

  const [sessions, appointments, templates, assignments, tasks] =
    await Promise.all([
      listSessionNotes(id),
      listAppointments(id),
      listTemplates(),
      listAssignmentsForConsultant(conversation.consultantId),
      listPlanItems(conversation.consultantId),
    ]);

  const open = conversation.status !== "tamamlandi";

  return (
    <div className="space-y-6">
      <Link
        href="/uzman-panel"
        className="inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
      >
        ← Genel bakış
      </Link>

      <ConversationThread
        conversation={conversation}
        expert={expert}
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

      <SessionLog
        conversationId={id}
        viewer="uzman"
        sessions={sessions}
        canAdd={open}
        seansHata={sp.seansHata === "eksik"}
      />

      <ExpertTools
        conversationId={id}
        consultantId={conversation.consultantId}
        templates={templates}
        assignments={assignments}
        tasks={tasks}
        gorevHata={sp.gorevHata === "eksik"}
      />
    </div>
  );
}
