import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  assessmentAssignments,
  assessmentItems,
  assessmentResponses,
  assessmentTemplates,
} from "@/db/schema";
import type {
  AssessmentAssignment,
  AssessmentItem,
  AssessmentTemplate,
} from "./types";

/**
 * Değerlendirme formları.
 *
 * İÇERİK SERBESTTİR: buradaki hiçbir kod lisanslı bir ölçeğin (MMSE,
 * MoCA vb.) maddesini taşımaz ve HESAPLANMIŞ PUAN ÜRETMEZ — kilitli
 * kararlar gereği. Yalnızca ham yanıtlar saklanır ve gösterilir.
 * Bkz. db/schema.ts "DEĞERLENDİRME İSKELESİ".
 */

function toItem(row: typeof assessmentItems.$inferSelect): AssessmentItem {
  return {
    id: row.id,
    position: row.position,
    prompt: row.prompt,
    responseType: row.responseType,
    options: row.options,
  };
}

async function itemsFor(templateId: string): Promise<AssessmentItem[]> {
  const rows = await db
    .select()
    .from(assessmentItems)
    .where(eq(assessmentItems.templateId, templateId))
    .orderBy(asc(assessmentItems.position));
  return rows.map(toItem);
}

export async function listTemplates(): Promise<AssessmentTemplate[]> {
  const rows = await db
    .select()
    .from(assessmentTemplates)
    .orderBy(asc(assessmentTemplates.title));

  const result: AssessmentTemplate[] = [];
  for (const row of rows) {
    result.push({
      id: row.id,
      title: row.title,
      description: row.description,
      items: await itemsFor(row.id),
    });
  }
  return result;
}

async function hydrate(
  rows: (typeof assessmentAssignments.$inferSelect)[],
): Promise<AssessmentAssignment[]> {
  const result: AssessmentAssignment[] = [];
  for (const row of rows) {
    const [template] = await db
      .select()
      .from(assessmentTemplates)
      .where(eq(assessmentTemplates.id, row.templateId));

    const responseRows = await db
      .select()
      .from(assessmentResponses)
      .where(eq(assessmentResponses.assignmentId, row.id));

    const answers: Record<string, string> = {};
    for (const r of responseRows) answers[r.itemId] = r.value;

    result.push({
      id: row.id,
      templateId: row.templateId,
      templateTitle: template?.title ?? "Form",
      templateDescription: template?.description ?? null,
      consultantId: row.consultantId,
      assignedByExpertId: row.assignedByExpertId,
      assignedAt: row.assignedAt.toISOString(),
      dueAt: row.dueAt ? row.dueAt.toISOString() : null,
      status: row.status,
      items: await itemsFor(row.templateId),
      answers,
    });
  }
  return result;
}

export async function listAssignmentsForConsultant(
  consultantId: string,
): Promise<AssessmentAssignment[]> {
  const rows = await db
    .select()
    .from(assessmentAssignments)
    .where(eq(assessmentAssignments.consultantId, consultantId))
    .orderBy(desc(assessmentAssignments.assignedAt));
  return hydrate(rows);
}

export async function getAssignment(
  id: string,
): Promise<AssessmentAssignment | null> {
  const rows = await db
    .select()
    .from(assessmentAssignments)
    .where(eq(assessmentAssignments.id, id));
  if (rows.length === 0) return null;
  const [full] = await hydrate(rows);
  return full;
}

export async function assignTemplate(input: {
  templateId: string;
  consultantId: string;
  expertId: string;
  dueAt: Date | null;
}): Promise<string> {
  const id = `aa${Date.now()}`;
  await db.insert(assessmentAssignments).values({
    id,
    templateId: input.templateId,
    consultantId: input.consultantId,
    assignedByExpertId: input.expertId,
    assignedAt: new Date(),
    dueAt: input.dueAt,
    status: "atandi",
  });
  return id;
}

/**
 * Yanıtları kaydeder ve atamayı tamamlandı olarak işaretler. Aynı form
 * yeniden gönderilirse eski yanıtlar silinip yenileri yazılır — kısmi
 * güncelleme yerine tam değişim, çünkü form tek seferde gönderiliyor.
 */
export async function submitResponses(
  assignmentId: string,
  answers: { itemId: string; value: string }[],
): Promise<void> {
  await db
    .delete(assessmentResponses)
    .where(eq(assessmentResponses.assignmentId, assignmentId));

  const filled = answers.filter((a) => a.value.trim() !== "");
  if (filled.length > 0) {
    const now = new Date();
    await db.insert(assessmentResponses).values(
      filled.map((a, i) => ({
        id: `ar${Date.now()}-${i}`,
        assignmentId,
        itemId: a.itemId,
        value: a.value.trim(),
        respondedAt: now,
      })),
    );
  }

  await db
    .update(assessmentAssignments)
    .set({ status: "tamamlandi" })
    .where(eq(assessmentAssignments.id, assignmentId));
}
