"use server";

import { revalidatePath } from "next/cache";
import { addMessage, setMeetingUrl } from "@/data/conversations";
import { getCurrentExpert, getCurrentMember } from "@/data/session";
import type { MessageAuthor } from "@/data/types";

/**
 * Danışma dosyasına mesaj gönderir.
 *
 * Prototip: veri veritabanında tutulur. Gerçek kimlik doğrulama yok — kim
 * olarak yazıldığı çerezdeki demo kişisinden veya uzman panelinden gelir.
 */
export async function sendMessage(formData: FormData) {
  const conversationId = String(formData.get("dosya") ?? "");
  const author = String(formData.get("taraf") ?? "") as MessageAuthor;
  const body = String(formData.get("mesaj") ?? "");

  if (!conversationId || !body.trim()) return;

  let authorName: string;
  if (author === "uzman") {
    const expert = await getCurrentExpert();
    authorName = expert.name;
  } else {
    const member = await getCurrentMember();
    // Kimin yazdığı balonda görünür: "Ayşe Demir (Kızı)"
    authorName = `${member.name} (${member.relation})`;
  }

  await addMessage(conversationId, author, authorName, body);

  revalidatePath("/panel/mesajlar");
  revalidatePath(`/panel/mesajlar/${conversationId}`);
  revalidatePath("/uzman-panel");
  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
}

/**
 * Görüntülü görüşme bağlantısını ayarlar. Yalnızca uzman tarafından
 * çağrılabilir. Harici link (Google Meet/Zoom vb.) — bkz. karar kaydı,
 * "Görüntülü görüşme" satırı.
 */
export async function updateMeetingUrl(formData: FormData) {
  const conversationId = String(formData.get("dosya") ?? "");
  const url = String(formData.get("link") ?? "");
  if (!conversationId) return;

  await setMeetingUrl(conversationId, url);

  revalidatePath(`/panel/mesajlar/${conversationId}`);
  revalidatePath(`/uzman-panel/mesajlar/${conversationId}`);
}
