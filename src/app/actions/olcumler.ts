"use server";

import { revalidatePath } from "next/cache";
import { getConsultantForExpert } from "@/data/household";
import { removeAliasGroup, saveAliases } from "@/data/measurements";
import { getCurrentExpert } from "@/data/session";

/**
 * Ölçüm etiketi birleştirme.
 *
 * Sistem yalnızca ÖNERİR (bkz. lib/olcum.ts `birlesmeOnerileri`);
 * birleştirmeyi uzman onaylar ve istediğinde geri alır. Ham
 * `session_measurements.label` hiçbir zaman değişmez — geçmiş seans
 * notu ne yazdıysa öyle kalır.
 */

export async function etiketleriBirlestir(formData: FormData) {
  const expert = await getCurrentExpert();
  const consultantId = String(formData.get("danisan") ?? "");
  const canonicalLabel = String(formData.get("etiket") ?? "").trim();
  const canonicalUnit = String(formData.get("birim") ?? "").trim();
  const rawLabels = formData.getAll("ham").map(String).filter(Boolean);

  if (!consultantId || !canonicalLabel || rawLabels.length < 2) return;

  /* Yetki veri katmanında: uzmanın bu danışanla dosyası yoksa
     birleştirme yapamaz. `consultantId` istemciden geliyor. */
  const danisan = await getConsultantForExpert(consultantId, expert.id);
  if (!danisan) return;

  await saveAliases({
    consultantId,
    expertId: expert.id,
    rawLabels,
    canonicalLabel,
    canonicalUnit: canonicalUnit || null,
  });

  revalidatePath(`/uzman-panel/danisanlar/${consultantId}`);
  revalidatePath("/panel/ilerleme");
}

export async function birlestirmeyiGeriAl(formData: FormData) {
  const expert = await getCurrentExpert();
  const consultantId = String(formData.get("danisan") ?? "");
  const canonicalLabel = String(formData.get("etiket") ?? "");
  if (!consultantId || !canonicalLabel) return;

  const danisan = await getConsultantForExpert(consultantId, expert.id);
  if (!danisan) return;

  await removeAliasGroup(consultantId, canonicalLabel);

  revalidatePath(`/uzman-panel/danisanlar/${consultantId}`);
  revalidatePath("/panel/ilerleme");
}
