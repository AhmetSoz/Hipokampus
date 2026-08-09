"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addMessage,
  getConversation,
  setMeetingUrl,
} from "@/data/conversations";
import {
  guvenliBildir,
  notifyConsultant,
  notifyExpert,
} from "@/data/notifications";
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

  const base =
    author === "uzman"
      ? `/uzman-panel/mesajlar/${conversationId}`
      : `/panel/mesajlar/${conversationId}`;

  if (!conversationId) return;
  if (!body.trim()) {
    // Metin alanı `required` ama yalnızca boşluk karakteriyle tarayıcı
    // doğrulamasını geçebiliyor — kullanıcıya sessizce hiçbir şey
    // olmamış gibi görünmesin diye bir hata bayrağıyla geri dönüyoruz.
    redirect(`${base}?hata=bos`);
  }

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

  /* Karşı tarafa haber ver. Mesajı yazan kişiye bildirim gitmez. */
  const dosya = await getConversation(conversationId);
  if (dosya) {
    const ozet = body.trim().split("\n")[0].slice(0, 90);
    await guvenliBildir(
      author === "danisan"
        ? notifyExpert(dosya.expertId, {
            title: `${authorName} mesaj gönderdi`,
            body: ozet,
            href: `/uzman-panel/mesajlar/${conversationId}?sekme=yazisma`,
          })
        : notifyConsultant(dosya.consultantId, {
            title: `${authorName} yanıtladı`,
            body: ozet,
            href: `/panel/mesajlar/${conversationId}`,
          }),
    );
  }

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
