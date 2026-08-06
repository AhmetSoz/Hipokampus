import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessionMeasurements, sessionNotes } from "@/db/schema";
import type { SessionNote } from "./types";

/**
 * Seans notları — bkz. schema.ts "SEANS NOTLARI" bölümü ve
 * context/02-DECISION-LOG.md "Seans notu" satırı.
 */

async function attachMeasurements(
  rows: (typeof sessionNotes.$inferSelect)[],
): Promise<SessionNote[]> {
  const result: SessionNote[] = [];
  for (const row of rows) {
    const measurementRows = await db
      .select()
      .from(sessionMeasurements)
      .where(eq(sessionMeasurements.sessionId, row.id))
      .orderBy(asc(sessionMeasurements.sortOrder));

    result.push({
      id: row.id,
      conversationId: row.conversationId,
      authorExpertId: row.authorExpertId,
      occurredAt: row.occurredAt.toISOString(),
      title: row.title,
      note: row.note,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      measurements: measurementRows.map((m) => ({
        id: m.id,
        label: m.label,
        value: m.value,
        unit: m.unit,
      })),
    });
  }
  return result;
}

export async function listSessionNotes(
  conversationId: string,
  options?: { onlyPublished?: boolean },
): Promise<SessionNote[]> {
  const rows = await db
    .select()
    .from(sessionNotes)
    .where(eq(sessionNotes.conversationId, conversationId))
    .orderBy(desc(sessionNotes.occurredAt));

  const filtered = options?.onlyPublished
    ? rows.filter((r) => r.status === "yayinda")
    : rows;

  return attachMeasurements(filtered);
}

export async function createSessionNote(input: {
  conversationId: string;
  authorExpertId: string;
  occurredAt: Date;
  title: string;
  note: string;
  measurements: { label: string; value: string; unit: string | null }[];
}): Promise<void> {
  const id = `s${Date.now()}`;

  await db.insert(sessionNotes).values({
    id,
    conversationId: input.conversationId,
    authorExpertId: input.authorExpertId,
    occurredAt: input.occurredAt,
    title: input.title,
    note: input.note,
    status: "taslak",
    createdAt: new Date(),
  });

  if (input.measurements.length > 0) {
    await db.insert(sessionMeasurements).values(
      input.measurements.map((m, i) => ({
        id: `sm${Date.now()}-${i}`,
        sessionId: id,
        label: m.label,
        value: m.value,
        unit: m.unit,
        sortOrder: i,
      })),
    );
  }
}

export async function publishSessionNote(sessionId: string): Promise<void> {
  await db
    .update(sessionNotes)
    .set({ status: "yayinda" })
    .where(eq(sessionNotes.id, sessionId));
}
