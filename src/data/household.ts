import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { accessLog, consultants, familyMembers, planItems } from "@/db/schema";
import type {
  AccessLogEntry,
  Consultant,
  DataScope,
  FamilyMember,
  PlanItem,
} from "./types";

/**
 * Panel verisi veritabanından okunur (bkz. scripts/seed.ts).
 *
 * Tohum verisindeki kurgu bilinçli olarak "ödeme ≠ veri görme" kuralını
 * görünür kılacak şekilde seçildi: Mehmet ödemeyi yapıyor ama sağlık ve
 * görüşme verisini göremiyor. Sunumda bu farkı göstermek için en net örnek.
 *
 * ÇOK-HANELİ (2026-08-06): gerçek hesaplar eklendiğinde tek sabit hane
 * varsayımı kalktı. Bu modüldeki sorgular artık AÇIKÇA bir `consultantId`
 * alır; çağıran taraf bunu oturumdan çözer (`getCurrentConsultantId`).
 * Parametre burada varsayılan almaz — yanlış hanenin verisini sessizce
 * göstermek, eksik veri göstermekten çok daha kötü olurdu.
 */

function toFamilyMember(row: typeof familyMembers.$inferSelect): FamilyMember {
  return {
    id: row.id,
    name: row.name,
    relation: row.relation,
    relationRole: row.relationRole,
    scopes: row.scopes as DataScope[],
    status: row.status,
    payer: row.payer,
    invitedAt: row.invitedAt.toISOString(),
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
  };
}

export async function getConsultant(
  consultantId: string,
): Promise<Consultant> {
  const [row] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.id, consultantId));
  if (!row) throw new Error("Danışan kaydı bulunamadı");
  return {
    id: row.id,
    name: row.name,
    birthYear: row.birthYear,
    city: row.city,
    summary: row.summary,
  };
}

export async function listFamily(
  consultantId: string,
): Promise<FamilyMember[]> {
  const rows = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.consultantId, consultantId));
  return rows.map(toFamilyMember);
}

export async function getFamilyMember(id: string): Promise<FamilyMember | null> {
  const [row] = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.id, id));
  return row ? toFamilyMember(row) : null;
}

export async function listPlanItems(
  consultantId: string,
): Promise<PlanItem[]> {
  const rows = await db
    .select()
    .from(planItems)
    .where(eq(planItems.consultantId, consultantId))
    .orderBy(planItems.createdAt);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    detail: row.detail,
    needArea: row.needAreaId as PlanItem["needArea"],
    status: row.status,
    authorExpertId: row.authorExpertId,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listAccessLog(
  consultantId: string,
): Promise<AccessLogEntry[]> {
  const rows = await db
    .select({
      id: accessLog.id,
      memberId: accessLog.memberId,
      scope: accessLog.scope,
      section: accessLog.section,
      at: accessLog.at,
    })
    .from(accessLog)
    .innerJoin(familyMembers, eq(accessLog.memberId, familyMembers.id))
    .where(eq(familyMembers.consultantId, consultantId))
    .orderBy(desc(accessLog.at));

  return rows.map((row) => ({
    id: row.id,
    memberId: row.memberId,
    scope: row.scope as DataScope,
    section: row.section,
    at: row.at.toISOString(),
  }));
}

/**
 * Görev/hedef ataması. Uzman bakım planına madde ekler; danışan durumunu
 * günceller. Ayrı bir "görevler" tablosu açılmadı — bakım planı maddesi
 * zaten tam olarak bu: başlığı, açıklaması, ihtiyaç alanı ve durumu olan
 * atanmış bir iş.
 */
export async function createPlanItem(input: {
  consultantId: string;
  title: string;
  detail: string;
  needAreaId: string;
  authorExpertId: string;
}): Promise<void> {
  await db.insert(planItems).values({
    id: `p${Date.now()}`,
    consultantId: input.consultantId,
    title: input.title,
    detail: input.detail,
    needAreaId: input.needAreaId,
    status: "yapilacak",
    authorExpertId: input.authorExpertId,
    createdAt: new Date(),
  });
}

export async function setPlanItemStatus(
  planItemId: string,
  status: PlanItem["status"],
): Promise<void> {
  await db
    .update(planItems)
    .set({ status })
    .where(eq(planItems.id, planItemId));
}

/** Bir kişinin verilen kapsama erişimi var mı? */
export function canAccess(member: FamilyMember, scope: DataScope): boolean {
  return member.status === "aktif" && member.scopes.includes(scope);
}
