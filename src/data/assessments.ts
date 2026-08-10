import { asc, desc, eq, inArray } from "drizzle-orm";
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
import { yeniId } from "@/lib/kimlik";

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

/** Birden çok şablonun maddelerini tek sorguda okuyup şablona göre gruplar. */
async function itemsForMany(
  templateIds: string[],
): Promise<Map<string, AssessmentItem[]>> {
  const grup = new Map<string, AssessmentItem[]>();
  if (templateIds.length === 0) return grup;

  const rows = await db
    .select()
    .from(assessmentItems)
    .where(inArray(assessmentItems.templateId, templateIds))
    .orderBy(asc(assessmentItems.position));

  for (const row of rows) {
    const liste = grup.get(row.templateId) ?? [];
    liste.push(toItem(row));
    grup.set(row.templateId, liste);
  }
  return grup;
}

export async function listTemplates(): Promise<AssessmentTemplate[]> {
  const rows = await db
    .select()
    .from(assessmentTemplates)
    .orderBy(asc(assessmentTemplates.title));

  const maddeler = await itemsForMany(rows.map((r) => r.id));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    items: maddeler.get(row.id) ?? [],
  }));
}

/**
 * Atamalara şablon, madde ve yanıtlarını ekler.
 *
 * Önceden atama başına ÜÇ sorgu atılıyordu (şablon + yanıtlar + maddeler).
 * Artık atama sayısından bağımsız olarak toplam üç sorgu.
 */
async function hydrate(
  rows: (typeof assessmentAssignments.$inferSelect)[],
): Promise<AssessmentAssignment[]> {
  if (rows.length === 0) return [];

  const templateIds = [...new Set(rows.map((r) => r.templateId))];

  const [templateRows, responseRows, maddeler] = await Promise.all([
    db
      .select()
      .from(assessmentTemplates)
      .where(inArray(assessmentTemplates.id, templateIds)),
    db
      .select()
      .from(assessmentResponses)
      .where(
        inArray(
          assessmentResponses.assignmentId,
          rows.map((r) => r.id),
        ),
      ),
    itemsForMany(templateIds),
  ]);

  const sablonlar = new Map(templateRows.map((t) => [t.id, t]));

  const yanitlar = new Map<string, Record<string, string>>();
  for (const r of responseRows) {
    const mevcut = yanitlar.get(r.assignmentId) ?? {};
    mevcut[r.itemId] = r.value;
    yanitlar.set(r.assignmentId, mevcut);
  }

  return rows.map((row) => {
    const template = sablonlar.get(row.templateId);
    return {
      id: row.id,
      templateId: row.templateId,
      templateTitle: template?.title ?? "Form",
      templateDescription: template?.description ?? null,
      consultantId: row.consultantId,
      assignedByExpertId: row.assignedByExpertId,
      assignedAt: row.assignedAt.toISOString(),
      dueAt: row.dueAt ? row.dueAt.toISOString() : null,
      status: row.status,
      items: maddeler.get(row.templateId) ?? [],
      answers: yanitlar.get(row.id) ?? {},
    };
  });
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
  const id = yeniId("aa");
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
        id: yeniId("ar"),
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
