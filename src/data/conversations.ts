import { asc, desc, eq, inArray, sql as rawSql, type SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { conversations, messages } from "@/db/schema";
import { yeniId } from "@/lib/kimlik";
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

/**
 * Dosyalara mesajlarını ekler.
 *
 * Önceden her dosya için ayrı bir sorgu atılıyordu (N+1). Bu, uzman
 * panelinin HER sayfa yüklemesinde çalışan bir yoldu; dosya sayısı
 * arttıkça istek sayısı doğrusal büyüyordu. Artık tek `inArray` sorgusu
 * atılıp gruplama bellekte yapılıyor.
 */
async function attachMessages(
  rows: (typeof conversations.$inferSelect)[],
): Promise<Conversation[]> {
  if (rows.length === 0) return [];

  const msgRows = await db
    .select()
    .from(messages)
    .where(
      inArray(
        messages.conversationId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(asc(messages.sentAt));

  const byConversation = new Map<string, Conversation["messages"]>();
  for (const m of msgRows) {
    const liste = byConversation.get(m.conversationId) ?? [];
    liste.push({
      id: m.id,
      author: m.author,
      authorName: m.authorName,
      body: m.body,
      sentAt: m.sentAt.toISOString(),
    });
    byConversation.set(m.conversationId, liste);
  }

  return rows.map((row) => ({
    id: row.id,
    expertId: row.expertId,
    consultantId: row.consultantId,
    subject: row.subject,
    status: row.status,
    startedAt: row.startedAt.toISOString(),
    meetingUrl: row.meetingUrl,
    messages: byConversation.get(row.id) ?? [],
  }));
}

/**
 * Dosyaları son hareket sırasına göre okur. `where` verilmezse hepsi.
 *
 * Filtre SQL'de: önceden hane/uzman bazlı listeler ÖNCE tüm tabloyu
 * (ve tüm mesajları) çekip sonra JS'te süzüyordu. Bu hem gereksiz
 * yüktü hem de platformdaki her yazışmayı uygulama katmanına taşıyan
 * kötü bir desendi — filtre kazara kaldırılırsa doğrudan sızıntı olurdu.
 */
async function listBy(where?: SQL): Promise<Conversation[]> {
  const rows = await db
    .select()
    .from(conversations)
    .where(where)
    // Son mesaj zamanına göre; hiç mesajı yoksa açılış tarihine göre.
    .orderBy(
      desc(
        rawSql`coalesce((select max(${messages.sentAt}) from ${messages} where ${messages.conversationId} = ${conversations.id}), ${conversations.startedAt})`,
      ),
    );
  return attachMessages(rows);
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
    id: yeniId("m"),
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
  return listBy();
}

/** Bir hanenin dosyaları. Danışan paneli bunu kullanır. */
export async function listConversationsForConsultant(
  consultantId: string,
): Promise<Conversation[]> {
  return listBy(eq(conversations.consultantId, consultantId));
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
  const id = yeniId("g");
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
      id: yeniId("m"),
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
  return listBy(eq(conversations.expertId, expertId));
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
