"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assignTemplate, submitResponses } from "@/data/assessments";
import {
  proposeAppointment,
  setAppointmentStatus,
} from "@/data/appointments";
import { createConversation } from "@/data/conversations";
import { createPlanItem, setPlanItemStatus } from "@/data/household";
import {
  getCurrentConsultantId,
  getCurrentExpert,
  getCurrentMember,
} from "@/data/session";
import type { PlanItem } from "@/data/types";

/**
 * Bakım akışının eylemleri: başvuru, randevu, değerlendirme ataması,
 * görev ataması.
 *
 * Hata gösterimi projedeki desenle aynı: `redirect(?hata=...)`, sayfa
 * okur ve gösterir — sessiz başarısızlık olmaz.
 */

/** Uygulamayla birlikte gelen ön değerlendirme formu (bkz. scripts/seed.ts). */
const ON_FORM_ID = "t-onform";

/* ------------------------------------------------------------------ */
/* BAŞVURU                                                              */

export async function applyToExpert(formData: FormData) {
  const expertId = String(formData.get("uzman") ?? "");
  const subject = String(formData.get("konu") ?? "").trim();
  const detail = String(formData.get("aciklama") ?? "").trim();
  const slug = String(formData.get("slug") ?? "");

  if (!expertId || !slug) return;
  if (!subject || !detail) redirect(`/basvuru/${slug}?hata=eksik`);

  const [consultantId, member] = await Promise.all([
    getCurrentConsultantId(),
    getCurrentMember(),
  ]);

  const conversationId = await createConversation({
    expertId,
    consultantId,
    subject,
    firstMessage: detail,
    authorName: member.name,
  });

  /* Başvuruyla birlikte ön değerlendirme formu otomatik atanır: danışan
     uzmanı beklerken boş boş oturmasın, uzman da dosyayı açtığında
     bağlamı hazır bulsun. */
  try {
    await assignTemplate({
      templateId: ON_FORM_ID,
      consultantId,
      expertId,
      dueAt: null,
    });
  } catch {
    // Ön form şablonu yoksa başvuru yine de geçerlidir; sessizce geç.
  }

  revalidatePath("/panel");
  revalidatePath("/panel/mesajlar");
  redirect(`/panel/mesajlar/${conversationId}`);
}

/* ------------------------------------------------------------------ */
/* RANDEVU                                                              */

export async function proposeAppointmentAction(formData: FormData) {
  const conversationId = String(formData.get("dosya") ?? "");
  const dateRaw = String(formData.get("tarih") ?? "");
  const timeRaw = String(formData.get("saat") ?? "");
  const duration = Number(String(formData.get("sure") ?? "45"));
  const note = String(formData.get("not") ?? "").trim();
  const meetingUrl = String(formData.get("link") ?? "").trim();

  if (!conversationId) return;
  const base = `/uzman-panel/mesajlar/${conversationId}`;
  if (!dateRaw || !timeRaw) redirect(`${base}?randevuHata=eksik`);

  const startsAt = new Date(`${dateRaw}T${timeRaw}`);
  if (Number.isNaN(startsAt.getTime())) {
    redirect(`${base}?randevuHata=tarih`);
  }

  const expert = await getCurrentExpert();
  await proposeAppointment({
    conversationId,
    expertId: expert.id,
    startsAt,
    durationMinutes: Number.isFinite(duration) && duration > 0 ? duration : 45,
    note: note || null,
    meetingUrl: meetingUrl || null,
  });

  revalidatePath(base);
  revalidatePath(`/panel/mesajlar/${conversationId}`);
  revalidatePath("/panel");
}

export async function respondToAppointment(formData: FormData) {
  const appointmentId = String(formData.get("randevu") ?? "");
  const conversationId = String(formData.get("dosya") ?? "");
  const answer = String(formData.get("yanit") ?? "");

  if (!appointmentId || !conversationId) return;
  if (answer !== "kabul" && answer !== "reddedildi") return;

  await setAppointmentStatus(appointmentId, answer);

  revalidatePath(`/panel/mesajlar/${conversationId}`);
  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
  revalidatePath("/panel");
}

/** Uzman randevuyu iptal eder veya tamamlandı olarak işaretler. */
export async function updateAppointmentByExpert(formData: FormData) {
  const appointmentId = String(formData.get("randevu") ?? "");
  const conversationId = String(formData.get("dosya") ?? "");
  const next = String(formData.get("durum") ?? "");

  if (!appointmentId || !conversationId) return;
  if (next !== "iptal" && next !== "tamamlandi") return;

  await setAppointmentStatus(appointmentId, next);

  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
  revalidatePath(`/panel/mesajlar/${conversationId}`);
}

/* ------------------------------------------------------------------ */
/* DEĞERLENDİRME FORMU                                                  */

export async function assignAssessment(formData: FormData) {
  const templateId = String(formData.get("sablon") ?? "");
  const consultantId = String(formData.get("danisan") ?? "");
  const conversationId = String(formData.get("dosya") ?? "");

  if (!templateId || !consultantId) return;

  const expert = await getCurrentExpert();
  await assignTemplate({ templateId, consultantId, expertId: expert.id, dueAt: null });

  if (conversationId) {
    revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
  }
  revalidatePath("/panel");
  revalidatePath("/panel/formlar");
}

export async function submitAssessment(formData: FormData) {
  const assignmentId = String(formData.get("atama") ?? "");
  if (!assignmentId) return;

  /* Alan adları `yanit-<itemId>` biçiminde; böylece madde sayısı
     değiştiğinde form yapısını elle güncellemek gerekmiyor. */
  const answers: { itemId: string; value: string }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("yanit-")) {
      answers.push({ itemId: key.slice("yanit-".length), value: String(value) });
    }
  }

  await submitResponses(assignmentId, answers);

  revalidatePath("/panel");
  revalidatePath("/panel/formlar");
  revalidatePath(`/panel/formlar/${assignmentId}`);
  redirect("/panel/formlar?durum=tamamlandi");
}

/* ------------------------------------------------------------------ */
/* GÖREV / HEDEF ATAMASI                                                */

export async function createTask(formData: FormData) {
  const consultantId = String(formData.get("danisan") ?? "");
  const conversationId = String(formData.get("dosya") ?? "");
  const title = String(formData.get("baslik") ?? "").trim();
  const detail = String(formData.get("aciklama") ?? "").trim();
  const needAreaId = String(formData.get("alan") ?? "gunluk");

  if (!consultantId || !conversationId) return;
  if (!title || !detail) {
    redirect(`/uzman-panel/mesajlar/${conversationId}?gorevHata=eksik`);
  }

  const expert = await getCurrentExpert();
  await createPlanItem({
    consultantId,
    title,
    detail,
    needAreaId,
    authorExpertId: expert.id,
  });

  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
  revalidatePath("/panel");
  revalidatePath("/panel/plan");
}

export async function updateTaskStatus(formData: FormData) {
  const planItemId = String(formData.get("madde") ?? "");
  const status = String(formData.get("durum") ?? "") as PlanItem["status"];

  if (!planItemId) return;
  if (!["yapilacak", "surüyor", "tamamlandi"].includes(status)) return;

  await setPlanItemStatus(planItemId, status);

  revalidatePath("/panel");
  revalidatePath("/panel/plan");
}
