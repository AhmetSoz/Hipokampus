import { asc, desc, eq, sql as rawSql } from "drizzle-orm";
import { db } from "@/db/client";
import { conversations, messages } from "@/db/schema";
import type { Conversation, ConversationStatus, MessageAuthor } from "./types";

/**
 * Danışma dosyaları veritabanından okunur (bkz. scripts/seed.ts).
 *
 * Araştırma bulgularının kod karşılığı (bkz. context/07-RESEARCH.md, A bölümü):
 *  - "Sohbet" değil, adı ve kapsamı olan bir DOSYA. Wellthy'nin Care Project
 *    deseni; mesajlaşma bir işin içinde yaşıyor.
 *  - Okundu bilgisi ve "yazıyor" göstergesi YOK. Asenkron bir üründe senkron
 *    beklentisi üretip güveni kırıyorlar. Yerine dosya durumu var.
 *  - Yanıt taahhüdü kişi bazlı değil, platform taahhüdü (bkz. experts.ts).
 *  - Görüşme kaydı alınmaz — kalıcı çıktı yazılı danışmanlık planıdır.
 */

async function attachMessages(
  rows: (typeof conversations.$inferSelect)[],
): Promise<Conversation[]> {
  const result: Conversation[] = [];
  for (const row of rows) {
    const msgRows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, row.id))
      .orderBy(asc(messages.sentAt));

    result.push({
      id: row.id,
      expertId: row.expertId,
      consultantId: row.consultantId,
      subject: row.subject,
      status: row.status,
      startedAt: row.startedAt.toISOString(),
      meetingUrl: row.meetingUrl,
      messages: msgRows.map((m) => ({
        id: m.id,
        author: m.author,
        authorName: m.authorName,
        body: m.body,
        sentAt: m.sentAt.toISOString(),
      })),
    });
  }
  return result;
}

/**
 * Mesaj ekler.
 *
 * NOT: Riskli ifade tetikleyicisi (anahtar kelime taraması) BİLEREK
 * uygulanmadı. Kilitli karar: "v1'de NLP/otomatik acil durum tespiti yok."
 * Acil durum yalnızca ihtiyaç formunun başındaki tek açık soruyla ele alınır.
 */
export async function addMessage(
  conversationId: string,
  author: MessageAuthor,
  authorName: string,
  body: string,
): Promise<void> {
  const text = body.trim();
  if (!text) return;

  const [conversation] = await db
    .select({ status: conversations.status })
    .from(conversations)
    .where(eq(conversations.id, conversationId));
  if (!conversation || conversation.status === "tamamlandi") return;

  await db.insert(messages).values({
    id: `m${Date.now()}`,
    conversationId,
    author,
    authorName,
    body: text,
    sentAt: new Date(),
  });

  // Danışan yazdıysa top uzmanda; uzman yazdıysa dosya yeniden açık.
  const nextStatus: ConversationStatus =
    author === "danisan" ? "yanit-bekliyor" : "acik";
  await db
    .update(conversations)
    .set({ status: nextStatus })
    .where(eq(conversations.id, conversationId));
}

/**
 * Tüm danışma dosyaları. Yalnızca admin/test panelinde kullanılır —
 * panel ekranları hane veya uzman bazlı olanları çağırmalı.
 */
export async function listConversations(): Promise<Conversation[]> {
  // Son mesaj zamanına göre sırala; hiç mesajı yoksa açılış tarihine göre.
  const rows = await db
    .select()
    .from(conversations)
    .orderBy(
      desc(
        rawSql`coalesce((select max(${messages.sentAt}) from ${messages} where ${messages.conversationId} = ${conversations.id}), ${conversations.startedAt})`,
      ),
    );
  return attachMessages(rows);
}

/** Bir hanenin dosyaları. Danışan paneli bunu kullanır. */
export async function listConversationsForConsultant(
  consultantId: string,
): Promise<Conversation[]> {
  const all = await listConversations();
  return all.filter((c) => c.consultantId === consultantId);
}

/**
 * Yeni başvuru. Danışan bir uzman seçip konusunu yazdığında açılır ve
 * ilk mesaj olarak açıklaması eklenir — uzman dosyayı açtığında boş bir
 * kayıt değil, bağlamıyla birlikte görür.
 */
export async function createConversation(input: {
  expertId: string;
  consultantId: string;
  subject: string;
  firstMessage: string;
  authorName: string;
}): Promise<string> {
  const id = `g${Date.now()}`;
  const now = new Date();

  await db.insert(conversations).values({
    id,
    expertId: input.expertId,
    consultantId: input.consultantId,
    subject: input.subject,
    status: "yanit-bekliyor",
    startedAt: now,
    meetingUrl: null,
  });

  const body = input.firstMessage.trim();
  if (body) {
    await db.insert(messages).values({
      id: `m${Date.now()}`,
      conversationId: id,
      author: "danisan",
      authorName: input.authorName,
      body,
      sentAt: now,
    });
  }

  return id;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const [row] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id));
  if (!row) return null;
  const [full] = await attachMessages([row]);
  return full;
}

export async function listConversationsForExpert(
  expertId: string,
): Promise<Conversation[]> {
  const all = await listConversations();
  return all.filter((c) => c.expertId === expertId);
}

/**
 * Görüşme bağlantısını ayarlar/kaldırır. Yalnızca uzman tarafından
 * çağrılmalı. Harici bir link (Google Meet/Zoom vb.) — uygulama bunu
 * doğrulamaz, yalnızca saklar ve gösterir.
 */
export async function setMeetingUrl(
  conversationId: string,
  url: string,
): Promise<void> {
  const trimmed = url.trim();
  await db
    .update(conversations)
    .set({ meetingUrl: trimmed || null })
    .where(eq(conversations.id, conversationId));
}
