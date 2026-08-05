import type { Conversation, MessageAuthor } from "./types";

/**
 * ÖRNEK DANIŞMA DOSYALARI — TEMSİLÎDİR.
 *
 * Araştırma bulgularının kod karşılığı (bkz. context/07-RESEARCH.md, A bölümü):
 *  - "Sohbet" değil, adı ve kapsamı olan bir DOSYA. Wellthy'nin Care Project
 *    deseni; mesajlaşma bir işin içinde yaşıyor.
 *  - Okundu bilgisi ve "yazıyor" göstergesi YOK. Asenkron bir üründe senkron
 *    beklentisi üretip güveni kırıyorlar. Yerine dosya durumu var.
 *  - Yanıt taahhüdü kişi bazlı değil, platform taahhüdü (bkz. experts.ts).
 *  - Görüşme kaydı alınmaz — kalıcı çıktı yazılı bakım planıdır.
 */

const CONVERSATIONS: Conversation[] = [
  {
    id: "g1",
    expertId: "u1",
    consultantId: "d1",
    subject: "Annem için evde bakım düzeni",
    status: "tamamlandi",
    startedAt: "2026-07-02",
    messages: [
      {
        id: "m1",
        author: "danisan",
        authorName: "Ayşe Demir",
        body: "Merhaba, annem İzmir'de tek başına yaşıyor. Günlük işlerin çoğunu kendisi yapıyor ama alışveriş ve ilaç takibinde zorlanmaya başladı. Nereden başlayacağımı bilmiyorum.",
        sentAt: "2026-07-02T14:20:00",
      },
      {
        id: "m2",
        author: "uzman",
        authorName: "Elif Tanyeri",
        body: "Merhaba Ayşe Hanım, ben Elif Tanyeri. Gerontoloji alanında çalışıyorum ve bu süreçte size eşlik edeceğim.\n\nÖnce annenizin günü nasıl geçiyor onu anlamak isterim: sabah kalktığında ilk ne yapıyor, gün içinde evden çıkıyor mu, akşam yemeğini kim hazırlıyor?",
        sentAt: "2026-07-03T09:15:00",
      },
      {
        id: "m3",
        author: "danisan",
        authorName: "Ayşe Demir",
        body: "Sabah erken kalkıyor, kahvaltısını kendi yapıyor. Haftada bir markete gidiyor ama son zamanlarda ağır poşetleri taşımakta zorlanıyor. Akşam yemeğini genelde öğleden kalanla geçiştiriyor.",
        sentAt: "2026-07-03T20:40:00",
      },
      {
        id: "m4",
        author: "uzman",
        authorName: "Elif Tanyeri",
        body: "Teşekkür ederim, bu tablo epey şey anlatıyor. İlaçlar konusunda da birkaç şey sorayım: kaç farklı ilaç kullanıyor ve hangilerini ne zaman alması gerekiyor?",
        sentAt: "2026-07-04T10:05:00",
      },
      {
        id: "m5",
        author: "danisan",
        authorName: "Ayşe Demir",
        body: "Dört ilaç var. İkisi sabah, biri akşam, biri de haftada bir. Bazen aldı mı almadı mı emin olamıyor, ben de her akşam telefonla soruyorum.",
        sentAt: "2026-07-04T19:12:00",
      },
      {
        id: "m6",
        author: "uzman",
        authorName: "Elif Tanyeri",
        body: "Anlıyorum. Sizin her akşam telefonla kontrol etmeniz uzun vadede ikinizi de yoruyor olabilir.\n\nKonuştuklarımızdan bir bakım planı hazırladım. Dört madde var; ikisi hemen uygulanabilir, ikisi biraz hazırlık istiyor. Planı aşağıdan açabilirsiniz.",
        sentAt: "2026-07-08T11:30:00",
      },
    ],
  },
  {
    id: "g2",
    expertId: "u4",
    consultantId: "d1",
    subject: "Banyo düzenlemesi ve düşme riski",
    status: "yanit-bekliyor",
    startedAt: "2026-08-03",
    messages: [
      {
        id: "m7",
        author: "danisan",
        authorName: "Ayşe Demir",
        body: "Merhaba, bakım planında banyo için tutunma barı önerilmişti. Nereye ve nasıl monte edileceği konusunda kararsızız. Küvet var, duş kabini yok.",
        sentAt: "2026-08-03T16:45:00",
      },
      {
        id: "m8",
        author: "uzman",
        authorName: "Hakan Devrim",
        body: "Merhaba Ayşe Hanım, ben Hakan Devrim, fizyoterapistim.\n\nKüvetli banyolarda en kritik nokta giriş-çıkış anı. Barın yeri, annenizin hangi tarafa ağırlık vererek girdiğine göre değişiyor. Küveti kullanırken hangi eliyle tutunuyor, biliyor musunuz?",
        sentAt: "2026-08-04T09:20:00",
      },
    ],
  },
];

/**
 * Mesaj ekler.
 *
 * Prototipte veri bellekte tutuluyor; sunucu yeniden başlayınca sıfırlanır.
 * Veritabanına geçildiğinde yalnızca bu fonksiyonun içi değişecek —
 * çağıran ekranlar aynı kalacak.
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
  const conversation = CONVERSATIONS.find((c) => c.id === conversationId);
  if (!conversation || conversation.status === "tamamlandi") return;

  const text = body.trim();
  if (!text) return;

  conversation.messages.push({
    id: `m${Date.now()}`,
    author,
    authorName,
    body: text,
    sentAt: new Date().toISOString(),
  });

  // Danışan yazdıysa top uzmanda; uzman yazdıysa dosya yeniden açık.
  conversation.status = author === "danisan" ? "yanit-bekliyor" : "acik";
}

export async function listConversations(): Promise<Conversation[]> {
  return [...CONVERSATIONS].sort((a, b) => {
    const aLast = a.messages.at(-1)?.sentAt ?? a.startedAt;
    const bLast = b.messages.at(-1)?.sentAt ?? b.startedAt;
    return bLast.localeCompare(aLast);
  });
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return CONVERSATIONS.find((c) => c.id === id) ?? null;
}

export async function listConversationsForExpert(
  expertId: string,
): Promise<Conversation[]> {
  const all = await listConversations();
  return all.filter((c) => c.expertId === expertId);
}
