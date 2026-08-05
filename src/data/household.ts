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
 * Kurgu bilinçli olarak "ödeme ≠ veri görme" kuralını görünür kılacak
 * şekilde seçildi: Mehmet ödemeyi yapıyor ama sağlık ve görüşme verisini
 * göremiyor. Sunumda bu farkı göstermek için en net örnek.
 */

// Prototipte tek bir danışan var; panel bu kayıt üzerine kurulu.
const CONSULTANT_ID = "d1";

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

export async function getConsultant(): Promise<Consultant> {
  const [row] = await db
    .select()
    .from(consultants)
    .where(eq(consultants.id, CONSULTANT_ID));
  if (!row) throw new Error("Danışan kaydı bulunamadı");
  return {
    id: row.id,
    name: row.name,
    birthYear: row.birthYear,
    city: row.city,
    summary: row.summary,
  };
}

export async function listFamily(): Promise<FamilyMember[]> {
  const rows = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.consultantId, CONSULTANT_ID));
  return rows.map(toFamilyMember);
}

export async function getFamilyMember(id: string): Promise<FamilyMember | null> {
  const [row] = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.id, id));
  return row ? toFamilyMember(row) : null;
}

export async function listPlanItems(): Promise<PlanItem[]> {
  const rows = await db
    .select()
    .from(planItems)
    .where(eq(planItems.consultantId, CONSULTANT_ID))
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

export async function listAccessLog(): Promise<AccessLogEntry[]> {
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
    .where(eq(familyMembers.consultantId, CONSULTANT_ID))
    .orderBy(desc(accessLog.at));

  return rows.map((row) => ({
    id: row.id,
    memberId: row.memberId,
    scope: row.scope as DataScope,
    section: row.section,
    at: row.at.toISOString(),
  }));
}

/** Bir kişinin verilen kapsama erişimi var mı? */
export function canAccess(member: FamilyMember, scope: DataScope): boolean {
  return member.status === "aktif" && member.scopes.includes(scope);
}
