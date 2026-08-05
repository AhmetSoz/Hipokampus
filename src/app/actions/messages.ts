"use server";

import { revalidatePath } from "next/cache";
import { addMessage } from "@/data/conversations";
import { getExpertById } from "@/data/experts";
import { getCurrentMember } from "@/data/session";
import type { MessageAuthor } from "@/data/types";

/**
 * Danışma dosyasına mesaj gönderir.
 *
 * Prototip: veri bellekte tutulur, sunucu yeniden başlayınca sıfırlanır.
 * Gerçek kimlik doğrulama yok — kim olarak yazıldığı çerezdeki demo
 * kişisinden veya uzman panelinden gelir.
 */
export async function sendMessage(formData: FormData) {
  const conversationId = String(formData.get("dosya") ?? "");
  const author = String(formData.get("taraf") ?? "") as MessageAuthor;
  const body = String(formData.get("mesaj") ?? "");

  if (!conversationId || !body.trim()) return;

  let authorName: string;
  if (author === "uzman") {
    const expert = await getExpertById("u1");
    authorName = expert?.name ?? "Uzman";
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
