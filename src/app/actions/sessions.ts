"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSessionNote, publishSessionNote } from "@/data/sessions";
import { getCurrentExpert } from "@/data/session";

/**
 * Yeni bir seans notu ekler. Yalnızca uzman tarafından çağrılır, taslak
 * olarak kaydedilir — bkz. data/sessions.ts.
 */
export async function addSessionNote(formData: FormData) {
  const conversationId = String(formData.get("dosya") ?? "");
  const title = String(formData.get("baslik") ?? "").trim();
  const note = String(formData.get("not") ?? "").trim();
  const occurredAtRaw = String(formData.get("tarih") ?? "");

  if (!conversationId) return;
  const base = `/uzman-panel/mesajlar/${conversationId}`;

  if (!title || !note) {
    // Sekme korunur; aksi hâlde hata görünmeyen bir sekmede kalıyor.
    redirect(`${base}?sekme=seanslar&seansHata=eksik`);
  }

  const labels = formData.getAll("olcum-etiket").map(String);
  const values = formData.getAll("olcum-deger").map(String);
  const units = formData.getAll("olcum-birim").map(String);
  const measurements = labels
    .map((label, i) => ({
      label: label.trim(),
      value: (values[i] ?? "").trim(),
      unit: (units[i] ?? "").trim() || null,
    }))
    .filter((m) => m.label && m.value);

  const expert = await getCurrentExpert();
  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date();

  await createSessionNote({
    conversationId,
    authorExpertId: expert.id,
    occurredAt,
    title,
    note,
    measurements,
  });

  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
  revalidatePath(`/panel/mesajlar/${conversationId}`);
}

/** Taslak bir seans notunu danışana görünür hale getirir. */
export async function publishSession(formData: FormData) {
  const sessionId = String(formData.get("seans") ?? "");
  const conversationId = String(formData.get("dosya") ?? "");
  if (!sessionId || !conversationId) return;

  await publishSessionNote(sessionId);

  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
  revalidatePath(`/panel/mesajlar/${conversationId}`);
}
