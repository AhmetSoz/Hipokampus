import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { measurementLabelAliases } from "@/db/schema";
import { yeniId } from "@/lib/kimlik";
import type { Alias } from "@/lib/olcum";

/**
 * Ölçüm serilerinin dosyalar arasında birleştirilmesi.
 *
 * Bkz. db/schema.ts "ÖLÇÜM ETİKETİ BİRLEŞTİRME": sistem yalnızca öneri
 * üretir, birleştirmeyi uzman onaylar, ham etiket hiç değişmez.
 */

/* ------------------------------------------------------------------ */
/* Alias kayıtları                                                      */

export async function listAliases(consultantId: string): Promise<Alias[]> {
  const rows = await db
    .select()
    .from(measurementLabelAliases)
    .where(eq(measurementLabelAliases.consultantId, consultantId));
  return rows.map((r) => ({
    id: r.id,
    rawLabel: r.rawLabel,
    canonicalLabel: r.canonicalLabel,
    canonicalUnit: r.canonicalUnit,
  }));
}

/** Bir grup ham etiketi tek bir gösterilen etikete bağlar. */
export async function saveAliases(input: {
  consultantId: string;
  expertId: string;
  rawLabels: string[];
  canonicalLabel: string;
  canonicalUnit: string | null;
}): Promise<void> {
  if (input.rawLabels.length === 0) return;
  const now = new Date();

  await db
    .insert(measurementLabelAliases)
    .values(
      input.rawLabels.map((rawLabel) => ({
        id: yeniId("ma"),
        consultantId: input.consultantId,
        rawLabel,
        canonicalLabel: input.canonicalLabel,
        canonicalUnit: input.canonicalUnit,
        createdByExpertId: input.expertId,
        createdAt: now,
      })),
    )
    /* Aynı etiket ikinci kez birleştirilirse yeni hedefi kazanır —
       uzman fikrini değiştirmiş olabilir. */
    .onConflictDoUpdate({
      target: [
        measurementLabelAliases.consultantId,
        measurementLabelAliases.rawLabel,
      ],
      set: {
        canonicalLabel: input.canonicalLabel,
        canonicalUnit: input.canonicalUnit,
        createdByExpertId: input.expertId,
        createdAt: now,
      },
    });
}

/** Birleştirmeyi geri alır; seriler yeniden ayrılır. */
export async function removeAliasGroup(
  consultantId: string,
  canonicalLabel: string,
): Promise<void> {
  await db
    .delete(measurementLabelAliases)
    .where(
      and(
        eq(measurementLabelAliases.consultantId, consultantId),
        eq(measurementLabelAliases.canonicalLabel, canonicalLabel),
      ),
    );
}


/* Saf mantık `lib/olcum.ts`'te; çağıranlar tek yerden alsın diye
   buradan da dışa aktarılıyor. */
export {
  etiketAnahtari,
  birlesikSeriler,
  birlesmeOnerileri,
} from "@/lib/olcum";
export type {
  Alias,
  OlcumNoktasi,
  OlcumSerisi,
  BirlesmeOnerisi,
} from "@/lib/olcum";
