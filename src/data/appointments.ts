import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { appointments, conversations } from "@/db/schema";
import type { Appointment, AppointmentStatus } from "./types";

/**
 * Randevular. Akış: uzman saat teklif eder (`teklif`) → danışan kabul
 * (`kabul`) veya reddeder (`reddedildi`). Görüşme bağlantısı randevuya
 * bağlıdır; görüşme kaydı alınmaz (kilitli karar).
 */

function toAppointment(row: typeof appointments.$inferSelect): Appointment {
  return {
    id: row.id,
    conversationId: row.conversationId,
    proposedByExpertId: row.proposedByExpertId,
    startsAt: row.startsAt.toISOString(),
    durationMinutes: row.durationMinutes,
    status: row.status,
    note: row.note,
    meetingUrl: row.meetingUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAppointments(
  conversationId: string,
): Promise<Appointment[]> {
  const rows = await db
    .select()
    .from(appointments)
    .where(eq(appointments.conversationId, conversationId))
    .orderBy(asc(appointments.startsAt));
  return rows.map(toAppointment);
}

/** Bir hanenin tüm dosyalarındaki randevular — panel özeti için. */
export async function listAppointmentsForConsultant(
  consultantId: string,
): Promise<Appointment[]> {
  const convRows = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.consultantId, consultantId));
  if (convRows.length === 0) return [];

  const rows = await db
    .select()
    .from(appointments)
    .where(
      inArray(
        appointments.conversationId,
        convRows.map((c) => c.id),
      ),
    )
    .orderBy(asc(appointments.startsAt));
  return rows.map(toAppointment);
}

export async function proposeAppointment(input: {
  conversationId: string;
  expertId: string;
  startsAt: Date;
  durationMinutes: number;
  note: string | null;
  meetingUrl: string | null;
}): Promise<void> {
  await db.insert(appointments).values({
    id: `r${Date.now()}`,
    conversationId: input.conversationId,
    proposedByExpertId: input.expertId,
    startsAt: input.startsAt,
    durationMinutes: input.durationMinutes,
    status: "teklif",
    note: input.note,
    meetingUrl: input.meetingUrl,
    createdAt: new Date(),
  });
}

export async function setAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<void> {
  await db
    .update(appointments)
    .set({ status })
    .where(eq(appointments.id, appointmentId));
}
