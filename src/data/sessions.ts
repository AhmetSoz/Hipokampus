import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { sessionMeasurements, sessionNotes } from "@/db/schema";
import type { SessionNote } from "./types";
import { yeniId } from "@/lib/kimlik";

/**
 * Seans notları — bkz. schema.ts "SEANS NOTLARI" bölümü ve
 * context/02-DECISION-LOG.md "Seans notu" satırı.
 */

/**
 * Seanslara ölçümlerini ekler. Tek `inArray` sorgusu — önceden her seans
 * için ayrı sorgu atılıyordu ve seans sayısı arttıkça istek sayısı da
 * artıyordu.
 */
async function attachMeasurements(
  rows: (typeof sessionNotes.$inferSelect)[],
): Promise<SessionNote[]> {
  if (rows.length === 0) return [];

  const measurementRows = await db
    .select()
    .from(sessionMeasurements)
    .where(
      inArray(
        sessionMeasurements.sessionId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(sessionMeasurements.sortOrder));

  const bySession = new Map<string, SessionNote["measurements"]>();
  for (const m of measurementRows) {
    const liste = bySession.get(m.sessionId) ?? [];
    liste.push({ id: m.id, label: m.label, value: m.value, unit: m.unit });
    bySession.set(m.sessionId, liste);
  }

  return rows.map((row) => ({
    id: row.id,
    conversationId: row.conversationId,
    authorExpertId: row.authorExpertId,
    occurredAt: row.occurredAt.toISOString(),
    title: row.title,
    note: row.note,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    measurements: bySession.get(row.id) ?? [],
  }));
}

/**
 * Bir veya birden çok dosyanın seans notları.
 *
 * Dizi kabul ediyor çünkü aynı danışanın birden fazla dosyası olabilir ve
 * ölçüm trendinin dosya sınırında kopmaması gerekiyor. Tek dize geçen
 * mevcut çağıranlar değişmeden çalışır.
 */
export async function listSessionNotes(
  conversationId: string | string[],
  options?: { onlyPublished?: boolean },
): Promise<SessionNote[]> {
  const ids = Array.isArray(conversationId) ? conversationId : [conversationId];
  if (ids.length === 0) return [];

  /* İkinci sıra ölçütü şart: aynı gün girilen iki seansın `occurredAt`'i
     birebir aynı olur (tarih alanı saat taşımıyor) ve sıra render'lar
     arasında değişebilir. */
  const rows = await db
    .select()
    .from(sessionNotes)
    .where(
      options?.onlyPublished
        ? and(
            inArray(sessionNotes.conversationId, ids),
            eq(sessionNotes.status, "yayinda"),
          )
        : inArray(sessionNotes.conversationId, ids),
    )
    .orderBy(desc(sessionNotes.occurredAt), desc(sessionNotes.createdAt));

  return attachMeasurements(rows);
}

export async function createSessionNote(input: {
  conversationId: string;
  authorExpertId: string;
  occurredAt: Date;
  title: string;
  note: string;
  measurements: { label: string; value: string; unit: string | null }[];
}): Promise<void> {
  const id = yeniId("s");

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
        id: yeniId("sm"),
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
