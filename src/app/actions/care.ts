"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assignTemplate, getAssignment, submitResponses } from "@/data/assessments";
import {
  guvenliBildir,
  notifyConsultant,
  notifyExpert,
} from "@/data/notifications";
import {
  proposeAppointment,
  setAppointmentStatus,
} from "@/data/appointments";
import { createConversation, getConversation } from "@/data/conversations";
import { createPlanItem, setPlanItemStatus } from "@/data/household";
import {
  getCurrentConsultantId,
  getCurrentExpert,
  getCurrentMember,
} from "@/data/session";
import type { PlanItem } from "@/data/types";
import {
  gunGecerliMi,
  saatToDakika,
  trTarihSaat,
  trYerelToUTC,
} from "@/lib/zaman";

/**
 * Danışmanlık akışının eylemleri: başvuru, randevu, değerlendirme ataması,
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

  await guvenliBildir(
    notifyExpert(expertId, {
      title: "Yeni başvuru",
      body: subject,
      href: `/uzman-panel/mesajlar/${conversationId}`,
    }),
  );

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
  // Sekme korunur; aksi hâlde hata mesajı görünmeyen bir sekmede kalıyor.
  if (!dateRaw || !timeRaw) redirect(`${base}?sekme=yazisma&randevuHata=eksik`);

  /* Uzman Türkiye saatiyle düşünüp yazıyor. `new Date("2026-08-12T14:00")`
     biçimi ofset taşımadığı için SUNUCUNUN yerel saatinde yorumlanır;
     Vercel UTC olduğundan 14:00 → 14:00Z olarak kaydediliyor ve danışana
     17:00 görünüyordu. Çeviri artık tek kapıdan. */
  const dakika = saatToDakika(timeRaw);
  if (!gunGecerliMi(dateRaw) || dakika === null) {
    redirect(`${base}?sekme=yazisma&randevuHata=tarih`);
  }
  const startsAt = trYerelToUTC(dateRaw, dakika);

  /* Geçmişe randevu teklif edilemez. Önceden yalnızca `NaN` kontrolü
     vardı; dünün tarihi sorunsuz kaydediliyordu. */
  if (startsAt.getTime() <= Date.now()) {
    redirect(`${base}?sekme=yazisma&randevuHata=gecmis`);
  }

  const expert = await getCurrentExpert();
  const yazildi = await proposeAppointment({
    conversationId,
    expertId: expert.id,
    startsAt,
    durationMinutes: Number.isFinite(duration) && duration > 0 ? duration : 45,
    note: note || null,
    meetingUrl: meetingUrl || null,
  });

  /* O saatte zaten aktif bir randevu var. Yakalanmazsa kısmi tekil
     indeks hatası kullanıcıya hata sayfası olarak dönüyordu. */
  if (!yazildi) {
    redirect(`${base}?sekme=yazisma&randevuHata=dolu`);
  }

  const dosya = await getConversation(conversationId);
  if (dosya) {
    await guvenliBildir(
      notifyConsultant(dosya.consultantId, {
        title: "Görüşme önerisi geldi",
        body: `${expert.name} bir görüşme saati önerdi: ${trTarihSaat(startsAt)}`,
        href: `/panel/mesajlar/${conversationId}`,
      }),
    );
  }

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

  const dosya = await getConversation(conversationId);
  if (dosya) {
    await guvenliBildir(
      notifyExpert(dosya.expertId, {
        title:
          answer === "kabul"
            ? "Görüşme onaylandı"
            : "Görüşme önerisi reddedildi",
        body: dosya.subject,
        href: `/uzman-panel/mesajlar/${conversationId}?sekme=yazisma`,
      }),
    );
  }

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

  await guvenliBildir(
    notifyConsultant(consultantId, {
      title: "Yeni form atandı",
      body: `${expert.name} doldurmanız için bir form gönderdi.`,
      href: "/panel/formlar",
    }),
  );

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

  const atama = await getAssignment(assignmentId);
  await submitResponses(assignmentId, answers);

  if (atama) {
    await guvenliBildir(
      notifyExpert(atama.assignedByExpertId, {
        title: "Form yanıtlandı",
        body: `${atama.templateTitle} dolduruldu.`,
        href: "/uzman-panel/danisanlar",
      }),
    );
  }

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
    redirect(
      `/uzman-panel/mesajlar/${conversationId}?sekme=gorevler&gorevHata=eksik`,
    );
  }

  const expert = await getCurrentExpert();
  await createPlanItem({
    consultantId,
    title,
    detail,
    needAreaId,
    authorExpertId: expert.id,
  });

  await guvenliBildir(
    notifyConsultant(consultantId, {
      title: "Planınıza yeni madde eklendi",
      body: title,
      href: "/panel/plan",
    }),
  );

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
