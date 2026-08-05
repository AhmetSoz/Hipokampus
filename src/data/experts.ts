import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { experts } from "@/db/schema";
import type { Availability, Expert, NeedAreaId } from "./types";

/**
 * Uzman verisi veritabanından okunur (bkz. scripts/seed.ts, tohumlama).
 *
 * BİLEREK YOK: deneyim yılı, kişi bazlı yanıt süresi, ücret, yıldız puanı,
 * kullanıcı yorumu, adli sicil durumu, değerlendirme puanı — şemada da
 * (src/db/schema.ts) bu alanlar yok.
 */

function toExpert(row: typeof experts.$inferSelect): Expert {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    field: row.field,
    city: row.city,
    specialties: row.specialties,
    availability: row.availability,
    verifiedAt: row.verifiedAt.toISOString(),
    about: row.about,
    needAreas: row.needAreaIds as NeedAreaId[],
    languages: row.languages,
  };
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  "bu-hafta": "Bu hafta müsait",
  "gelecek-hafta": "Gelecek hafta müsait",
  dolu: "Şu anda dolu",
};

/**
 * Platform yanıt taahhüdü.
 *
 * Kişi bazlı yanıt süresi BİLEREK gösterilmiyor: uzmanları birbiriyle
 * kıyaslatan bir ölçüt olurdu. Bunun yerine tek bir kurumsal taahhüt var —
 * kim olursa olsun aynı söz geçerli.
 */
export const RESPONSE_COMMITMENT = "En geç 2 iş günü içinde";

export async function listFields(): Promise<string[]> {
  const rows = await db.selectDistinct({ field: experts.field }).from(experts);
  return rows.map((r) => r.field).sort((a, b) => a.localeCompare(b, "tr"));
}

export async function listCities(): Promise<string[]> {
  const rows = await db.selectDistinct({ city: experts.city }).from(experts);
  return rows.map((r) => r.city).sort((a, b) => a.localeCompare(b, "tr"));
}

/**
 * Günlük dönüşümlü sıra.
 *
 * Uygun uzmanlar arasında kimse kalıcı olarak üstte kalmasın diye liste her
 * gün kaydırılıyor. Gün içinde sabit, günler arasında dönüşümlü. Ücretin
 * sıralamaya etkisi yok — kilitli karar.
 */
function dailyRotation(count: number): number {
  const day = Math.floor(Date.now() / 86_400_000);
  return count > 0 ? day % count : 0;
}

export async function listExperts(filter?: {
  field?: string;
  city?: string;
  needArea?: NeedAreaId;
}): Promise<Expert[]> {
  const conditions = [];
  if (filter?.field) conditions.push(eq(experts.field, filter.field));
  if (filter?.city) conditions.push(eq(experts.city, filter.city));

  const rows = await db
    .select()
    .from(experts)
    .where(conditions.length ? and(...conditions) : undefined);

  const matched = filter?.needArea
    ? rows.filter((r) => r.needAreaIds.includes(filter.needArea!))
    : rows;

  // Müsait olanlar önce; dolu olanlar sona. Bunun dışında hiyerarşi yok.
  const available = matched.filter((r) => r.availability !== "dolu");
  const busy = matched.filter((r) => r.availability === "dolu");

  const offset = dailyRotation(available.length);
  const rotated = [...available.slice(offset), ...available.slice(0, offset)];

  return [...rotated, ...busy].map(toExpert);
}

export async function getExpert(slug: string): Promise<Expert | null> {
  const [row] = await db.select().from(experts).where(eq(experts.slug, slug));
  return row ? toExpert(row) : null;
}

export async function getExpertById(id: string): Promise<Expert | null> {
  const [row] = await db.select().from(experts).where(eq(experts.id, id));
  return row ? toExpert(row) : null;
}

export async function listExpertSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: experts.slug }).from(experts);
  return rows.map((r) => r.slug);
}
