/**
 * Veri modelleri.
 *
 * Ekranlar veriye HER ZAMAN `src/data/` üzerinden erişir; hiçbir sayfa
 * kendi içinde veri tanımlamaz. Bugün bu modüller sahte veri döndürüyor.
 * Veritabanına geçildiğinde yalnızca bu klasördeki uygulamalar değişecek,
 * ekranlara dokunulmayacak. Bu yüzden fonksiyon imzaları baştan
 * eşzamansız (async) tanımlandı.
 */

/** İhtiyaç başlığı. İhtiyaç formu ve uzman eşleşmesi aynı listeyi kullanır. */
export type NeedAreaId =
  | "gunluk"
  | "ev-guvenlik"
  | "hafiza"
  | "saglik-koordinasyon"
  | "bakim-veren"
  | "sosyal"
  | "secenekler"
  | "aile-karar";

export type NeedArea = {
  id: NeedAreaId;
  label: string;
  hint: string;
};

/** Uzmanın yakın dönemdeki durumu. Takvim değil, kaba bir işaret. */
export type Availability = "bu-hafta" | "gelecek-hafta" | "dolu";

export type Expert = {
  id: string;
  slug: string;
  /** Temsilî isim. Gerçek kişi değildir. */
  name: string;
  /** Uzmanlık alanı. Alan listesi TEMSİLÎDİR — açık soru 3 kapanmadı. */
  field: string;
  city: string;
  experienceYears: number;
  /** "Genellikle 1 gün içinde" gibi. Taahhüt değil, gözlem. */
  responseTime: string;
  availability: Availability;
  /** Doğrulama sürecinin tamamlandığı tarih (ISO). */
  verifiedAt: string;
  /** Profil metni, birinci ağızdan. */
  about: string;
  /** Hangi ihtiyaç başlıklarında çalıştığı. */
  needAreas: NeedAreaId[];
  languages: string[];
};

/** Panelde ileri yaştaki bireyin kaydı. Merkezdeki kişi budur. */
export type Consultant = {
  id: string;
  name: string;
  /** Doğum yılı; yaş buradan hesaplanır. */
  birthYear: number;
  city: string;
  /** Süreci başlatan aile üyesinin kayda düştüğü kısa not. */
  summary: string;
};

/**
 * Aile üyesinin yetki seviyesi.
 *
 * ÖNEMLİ: Bu model bir ÖNERİDİR, hukuki model değildir (açık soru 2).
 * "Ödeme yapmak veri görme hakkı vermez" kilidi burada görünür kılınıyor:
 * ödemeyi yapan kişi otomatik olarak "tam" yetki almaz.
 */
export type FamilyRole = "tam" | "plan" | "sinirli";

export type FamilyMember = {
  id: string;
  name: string;
  /** "Kızı", "Oğlu", "Eşi" gibi. */
  relation: string;
  role: FamilyRole;
  /** Ödemeyi bu kişi mi yapıyor? Yetkiden bağımsızdır. */
  payer: boolean;
  invitedAt: string;
  acceptedAt: string | null;
};

export type PlanItemStatus = "yapilacak" | "surüyor" | "tamamlandi";

export type PlanItem = {
  id: string;
  title: string;
  detail: string;
  needArea: NeedAreaId;
  status: PlanItemStatus;
  /** Maddeyi ekleyen uzmanın id'si. */
  authorExpertId: string;
  createdAt: string;
};

export type MessageAuthor = "danisan" | "uzman";

export type Message = {
  id: string;
  author: MessageAuthor;
  /** Danışan tarafında yazan aile üyesinin adı; uzman tarafında boş. */
  authorName: string;
  body: string;
  sentAt: string;
};

export type ConversationStatus = "acik" | "yanit-bekliyor" | "tamamlandi";

export type Conversation = {
  id: string;
  expertId: string;
  consultantId: string;
  subject: string;
  status: ConversationStatus;
  startedAt: string;
  messages: Message[];
};
