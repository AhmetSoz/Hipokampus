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

/**
 * Uzman.
 *
 * BİLEREK YOK: deneyim yılı, kişi bazlı yanıt süresi, yıldız puanı, yorum,
 * ücret, adli sicil durumu, değerlendirme puanı.
 *
 * Gerekçe: doğrulama sürecini geçen herkes kalifiyedir. Karşılaştırılabilir
 * sayısal ölçüt göstermek zorunlu olarak bir hiyerarşi kurar; bu hem
 * uzmanları değersizleştirir hem de kullanıcıyı tek bir kişiye yığar.
 * Kullanıcının sorusu "kim daha iyi" değil, "kim bana uygun" olmalı.
 *
 * Yanıt süresi kişi bazında değil, PLATFORM TAAHHÜDÜ olarak tek yerde verilir.
 */
export type Expert = {
  id: string;
  slug: string;
  /** Temsilî isim. Gerçek kişi değildir. */
  name: string;
  /** Meslek alanı. Alan listesi TEMSİLÎDİR — açık soru 3 kapanmadı. */
  field: string;
  city: string;
  /** Asıl ayırt edici bilgi: neyin üzerine çalışıyor. Sıralanabilir değil. */
  specialties: string[];
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
 * YETKİ MODELİ — İKİ EKSEN
 *
 * Tek bir "rol" seviyesi yerine iki bağımsız eksen kullanılıyor:
 *   1. İlişki rolü  — kişi kim (birey, süreci yürüten, aile üyesi, uzman)
 *   2. Veri kapsamı — neyi görebiliyor
 *
 * Bunun sebebi kilitli karar: "Ödeme yapmak, sağlık/görüşme verisini görme
 * hakkı vermez." Tek eksenli bir rol listesinde bu kural ifade edilemiyor;
 * ödeme kapsamı ayrı bir eksen olmak zorunda.
 *
 * ÖNEMLİ: Bu model bir ÖNERİDİR, hukuki model değildir (açık soru 2).
 */
export type RelationRole = "birey" | "bakim-veren" | "aile-uyesi";

/** Veri kapsamları. Biri diğerini AÇMAZ. */
export type DataScope = "saglik-gorusme" | "gunluk-lojistik" | "odeme-fatura";

export const SCOPE_LABEL: Record<DataScope, string> = {
  "saglik-gorusme": "Sağlık ve görüşme",
  "gunluk-lojistik": "Günlük yaşam ve lojistik",
  "odeme-fatura": "Ödeme ve fatura",
};

export const SCOPE_DESCRIPTION: Record<DataScope, string> = {
  "saglik-gorusme":
    "Danışmanlık planı, uzman görüşmeleri ve uzmanın paylaştığı notlar.",
  "gunluk-lojistik":
    "Randevu takvimi, günlük durum notları ve yapılacaklar.",
  "odeme-fatura":
    "Fatura geçmişi, yenileme tarihi ve hizmet kalemleri. Görüşme içeriği bu kapsama dahil DEĞİLDİR.",
};

/**
 * Erişim durumu.
 *
 * "askida" bilerek var: erişim kesilirken kişi listeden SİLİNMEZ. Aile
 * ilişkileri geri döner, silme geri dönmez.
 */
export type AccessStatus = "aktif" | "askida" | "davet-bekliyor";

export type FamilyMember = {
  id: string;
  name: string;
  /** "Kızı", "Oğlu", "Eşi" gibi. */
  relation: string;
  relationRole: RelationRole;
  scopes: DataScope[];
  status: AccessStatus;
  /** Ödemeyi bu kişi mi yapıyor? Kapsamdan tamamen bağımsızdır. */
  payer: boolean;
  invitedAt: string;
  /** Erişimin biteceği tarih; null ise süresiz. */
  expiresAt: string | null;
};

/** Erişim kaydı — kim, ne zaman, neyi açtı. Bireye görünür. */
export type AccessLogEntry = {
  id: string;
  memberId: string;
  scope: DataScope;
  section: string;
  at: string;
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
  /**
   * Görüntülü görüşme bağlantısı (Google Meet/Zoom vb.), uzman tarafından
   * girilir. Harici link — uygulama içi video altyapısı DEĞİL. Boşsa görüşme
   * yalnızca mesajlaşmayla sürer.
   */
  meetingUrl: string | null;
};

/**
 * Seans notu. Danışma dosyasının ALTINDA, zaman içinde tekrarlayan kayıt —
 * "sohbet"ten ayrı, her görüşmeden sonra uzmanın bıraktığı bir not.
 *
 * BİLEREK YOK: hesaplanmış puan/skor. `SessionMeasurement.value` serbest
 * metindir; sayıya çevrilebiliyorsa arayüz onu grafikte kullanır, DB'de
 * saklanan bir skor değildir (bkz. schema.ts, aynı bölüm).
 */
export type SessionStatus = "taslak" | "yayinda";

export type SessionMeasurement = {
  id: string;
  label: string;
  value: string;
  unit: string | null;
};

export type SessionNote = {
  id: string;
  conversationId: string;
  authorExpertId: string;
  occurredAt: string;
  title: string;
  note: string;
  status: SessionStatus;
  createdAt: string;
  measurements: SessionMeasurement[];
};

/**
 * Randevu. Uzman bir saat teklif eder, danışan kabul veya reddeder.
 * Görüşme bağlantısı randevuya bağlıdır; kayıt alınmaz (kilitli karar).
 */
export type AppointmentStatus =
  | "teklif"
  | "kabul"
  | "reddedildi"
  | "iptal"
  | "tamamlandi";

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  teklif: "Onayınız bekleniyor",
  kabul: "Onaylandı",
  reddedildi: "Reddedildi",
  iptal: "İptal edildi",
  tamamlandi: "Tamamlandı",
};

export type Appointment = {
  id: string;
  conversationId: string;
  proposedByExpertId: string;
  startsAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  note: string | null;
  meetingUrl: string | null;
  createdAt: string;
};

/**
 * Değerlendirme formu. İÇERİK SERBESTTİR — lisanslı hiçbir ölçek
 * (MMSE/MoCA vb.) maddesi taşımaz ve hesaplanmış puan/skor tutmaz.
 * Bkz. db/schema.ts "DEĞERLENDİRME İSKELESİ" ve kilitli kararlar.
 */
export type AssessmentResponseType =
  | "metin"
  | "evet-hayir"
  | "olcek"
  | "cok-secmeli";

export type AssessmentItem = {
  id: string;
  position: number;
  prompt: string;
  responseType: AssessmentResponseType;
  options: string[] | null;
};

export type AssessmentTemplate = {
  id: string;
  title: string;
  description: string | null;
  items: AssessmentItem[];
};

export type AssessmentAssignmentStatus = "atandi" | "tamamlandi";

export type AssessmentAssignment = {
  id: string;
  templateId: string;
  templateTitle: string;
  templateDescription: string | null;
  consultantId: string;
  assignedByExpertId: string;
  assignedAt: string;
  dueAt: string | null;
  status: AssessmentAssignmentStatus;
  items: AssessmentItem[];
  /** itemId → verilen yanıt. Henüz yanıtlanmamışsa anahtar yoktur. */
  answers: Record<string, string>;
};

/** Görev/hedef ataması. Danışmanlık planı maddeleriyle aynı tabloda tutulur. */
export type TaskAssignment = PlanItem;
