import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Veritabanı şeması.
 *
 * Bire bir `src/data/types.ts` ile eşleşir. Buradaki hiçbir alan kilitli
 * kararları ihlal etmez: uzman tablosunda deneyim yılı, yanıt süresi, ücret,
 * yıldız puanı, yorum, adli sicil durumu veya değerlendirme puanı YOKTUR
 * (bkz. karar kaydı, uzman gösterimi kararı).
 *
 * Kayıt kapalıdır (bkz. karar kaydı A2 "Prototip kapsamı") — bu şemada
 * parola, e-posta doğrulama veya oturum tablosu yoktur. `family_members`
 * tablosu gerçek kullanıcı hesabı değil, demo panelin gösterdiği örnek
 * kayıtlardır.
 */

export const availabilityEnum = pgEnum("availability", [
  "bu-hafta",
  "gelecek-hafta",
  "dolu",
]);

export const relationRoleEnum = pgEnum("relation_role", [
  "birey",
  "bakim-veren",
  "aile-uyesi",
]);

export const accessStatusEnum = pgEnum("access_status", [
  "aktif",
  "askida",
  "davet-bekliyor",
]);

export const planStatusEnum = pgEnum("plan_status", [
  "yapilacak",
  "surüyor",
  "tamamlandi",
]);

export const messageAuthorEnum = pgEnum("message_author", [
  "danisan",
  "uzman",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "acik",
  "yanit-bekliyor",
  "tamamlandi",
]);

/* ------------------------------------------------------------------ */

/**
 * İhtiyaç başlıkları TABLOYA ALINMADI — sabit bir taksonomi, `needs.ts`
 * içinde `NeedAreaId` union tipiyle birlikte statik kalıyor. Kullanıcı verisi
 * değil, uygulama sözlüğü; değişmediği sürece DB'de tutmanın getirisi yok.
 */

/**
 * Uzmanlar. specialties ve needAreas ve languages diziler — Postgres'in
 * native text[] tipinde, ayrı bir bağlantı tablosu gerektirmiyor.
 */
export const experts = pgTable("experts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  field: text("field").notNull(),
  city: text("city").notNull(),
  specialties: text("specialties").array().notNull(),
  availability: availabilityEnum("availability").notNull(),
  verifiedAt: timestamp("verified_at", { mode: "date" }).notNull(),
  about: text("about").notNull(),
  needAreaIds: text("need_area_ids").array().notNull(),
  languages: text("languages").array().notNull(),
});

/** Panelin sahibi olan ileri yaştaki birey. */
export const consultants = pgTable("consultants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  birthYear: integer("birth_year").notNull(),
  city: text("city").notNull(),
  summary: text("summary").notNull(),
});

/**
 * Aile üyeleri. `scopes` iki eksenli yetki modelinin kapsam eksenidir
 * (bkz. types.ts DataScope). Bir satırın scopes'u boş olabilir (askıda).
 */
export const familyMembers = pgTable("family_members", {
  id: text("id").primaryKey(),
  consultantId: text("consultant_id")
    .notNull()
    .references(() => consultants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relation: text("relation").notNull(),
  relationRole: relationRoleEnum("relation_role").notNull(),
  scopes: text("scopes").array().notNull(),
  status: accessStatusEnum("status").notNull(),
  payer: boolean("payer").notNull().default(false),
  invitedAt: timestamp("invited_at", { mode: "date" }).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
});

/** Erişim kaydı — kim, ne zaman, hangi bölümü açtı. */
export const accessLog = pgTable("access_log", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => familyMembers.id, { onDelete: "cascade" }),
  scope: text("scope").notNull(),
  section: text("section").notNull(),
  at: timestamp("at", { mode: "date" }).notNull(),
});

/** Bakım planı maddeleri. */
export const planItems = pgTable("plan_items", {
  id: text("id").primaryKey(),
  consultantId: text("consultant_id")
    .notNull()
    .references(() => consultants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  needAreaId: text("need_area_id").notNull(),
  status: planStatusEnum("status").notNull(),
  authorExpertId: text("author_expert_id")
    .notNull()
    .references(() => experts.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

/**
 * Danışma dosyaları. "Sohbet" değil, adı olan bir iş — bkz. context/07.
 *
 * meetingUrl: 2026-08-05'te "görüşme yalnızca mesajlaşma" kararı revize
 * edildi — sahibi seans içi görüntülü görüşme istedi. Uygulama biçimi:
 * harici bağlantı (Google Meet/Zoom), gömülü video altyapısı DEĞİL. Uzman
 * bu alanı doldurursa her iki tarafa da "Görüşmeyi başlatın" butonu çıkar.
 * NULL ise buton görünmez, mesajlaşma tek yol olarak kalır.
 */
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey(),
  expertId: text("expert_id")
    .notNull()
    .references(() => experts.id),
  consultantId: text("consultant_id")
    .notNull()
    .references(() => consultants.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  status: conversationStatusEnum("status").notNull(),
  startedAt: timestamp("started_at", { mode: "date" }).notNull(),
  meetingUrl: text("meeting_url"),
});

/**
 * Mesajlar. Okundu bilgisi ve "yazıyor" durumu BİLEREK yok — araştırma
 * bulgusu: asenkron bir üründe senkron beklenti üretip güveni kırıyorlar.
 */
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  author: messageAuthorEnum("author").notNull(),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at", { mode: "date" }).notNull(),
});

/* ------------------------------------------------------------------ */
/* DEĞERLENDİRME İSKELESİ (2026-08-05)                                  */
/*
 * Sahibi "test atamaları / sonuçlar / hedefler / egzersizler" istedi ve
 * ölçek kaynağı sorusuna (kendi orijinal sistemimiz mi, yoksa MMSE/MoCA
 * gibi lisanslı mevcut ölçekler mi) "henüz karar vermedik, ikisini de
 * açık tutalım" dedi.
 *
 * Bu yüzden şema TAMAMEN İÇERİKSİZ: hiçbir gerçek/lisanslı ölçek adı,
 * maddesi veya puanlama formülü YOK — yalnızca herhangi bir soru-cevap
 * formunu taşıyabilecek genel bir kap. Kilitli karar gereği ("v1'de
 * puan/skor YOK") hesaplanmış/saklanmış bir sayısal skor alanı da YOK;
 * yalnızca ham yanıtlar tutuluyor. Puanlama ileride ayrı ve bilinçli bir
 * kararla eklenir, bu şemanın parçası değildir.
 */
export const assessmentResponseTypeEnum = pgEnum("assessment_response_type", [
  "metin",
  "evet-hayir",
  "olcek",
  "cok-secmeli",
]);

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "atandi",
  "tamamlandi",
]);

/** Bir form/anket tanımı. Başlığı ve maddeleri tamamen kullanıcı girer. */
export const assessmentTemplates = pgTable("assessment_templates", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdByExpertId: text("created_by_expert_id")
    .notNull()
    .references(() => experts.id),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const assessmentItems = pgTable("assessment_items", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => assessmentTemplates.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  prompt: text("prompt").notNull(),
  responseType: assessmentResponseTypeEnum("response_type").notNull(),
  /** Yalnızca "cok-secmeli" için kullanılır. */
  options: text("options").array(),
});

/** Bir şablonun belirli bir danışana ataması. */
export const assessmentAssignments = pgTable("assessment_assignments", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => assessmentTemplates.id),
  consultantId: text("consultant_id")
    .notNull()
    .references(() => consultants.id, { onDelete: "cascade" }),
  assignedByExpertId: text("assigned_by_expert_id")
    .notNull()
    .references(() => experts.id),
  assignedAt: timestamp("assigned_at", { mode: "date" }).notNull(),
  dueAt: timestamp("due_at", { mode: "date" }),
  status: assessmentStatusEnum("status").notNull(),
});

/** Ham yanıtlar. Hesaplanmış puan YOK — bkz. yukarıdaki not. */
export const assessmentResponses = pgTable("assessment_responses", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id")
    .notNull()
    .references(() => assessmentAssignments.id, { onDelete: "cascade" }),
  itemId: text("item_id")
    .notNull()
    .references(() => assessmentItems.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
  respondedAt: timestamp("responded_at", { mode: "date" }).notNull(),
});

/* ------------------------------------------------------------------ */
/* SEANS NOTLARI (2026-08-06)                                          */
/*
 * Sahibinin talebi: danışma dosyası tek baştan-sona yazışmaydı; bunun
 * ALTINDA, zaman içinde tekrarlayan "seans" kayıtları olmalı — her
 * görüşmeden sonra uzmanın bıraktığı bir not, isterse birkaç basit ölçüm.
 * Tablo ve grafiklerle geçmiş izlenebilsin diye.
 *
 * BİLEREK YOK: hesaplanmış puan/skor, sabit bir ölçüm taksonomisi. `label`
 * ve `value` tamamen serbest metin — "Klinik ölçekler" ve "Puan/skor"
 * kilitli kararlarını ihlal etmez, değerlendirme iskelesiyle aynı ilke
 * (bkz. yukarıdaki DEĞERLENDİRME İSKELESİ notu). Grafik, sayıya
 * çevrilebilen değerler üzerinden UI katmanında hesaplanır; DB'de
 * saklanan bir sayı/skor yoktur.
 *
 * Taslak/yayında ayrımı bilerek var: uzman bir notu kaydedip gözden
 * geçirebilsin, danışan yalnızca yayınlanmış olanı görsün.
 */
export const sessionStatusEnum = pgEnum("session_status", [
  "taslak",
  "yayinda",
]);

export const sessionNotes = pgTable("session_notes", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  authorExpertId: text("author_expert_id")
    .notNull()
    .references(() => experts.id),
  occurredAt: timestamp("occurred_at", { mode: "date" }).notNull(),
  title: text("title").notNull(),
  note: text("note").notNull(),
  status: sessionStatusEnum("status").notNull().default("taslak"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

/** Bir seansa bağlı, tamamen serbest etiket/değer/birim ölçümleri. */
export const sessionMeasurements = pgTable("session_measurements", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessionNotes.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* GERÇEK HESAPLAR (2026-08-06)                                        */
/*
 * Sahibi admin panelinden "o kişi gibi bak" ile test etmeyi yetersiz
 * buldu ve gerçek hesap istedi: iki ayrı sekmede, biri hasta biri uzman
 * olarak giriş yapıp uçtan uca akışı denemek için.
 *
 * Bu, "kayıt kapalıdır" kararının (A2 Prototip kapsamı) bilinçli
 * revizyonudur — bkz. karar kaydı "Gerçek giriş sistemi".
 *
 * GÜVENLİK NOTU: parola asla düz metin saklanmaz. Node'un yerleşik
 * `crypto.scrypt`'i kullanılır (bkz. src/data/auth.ts) — ek bağımlılık
 * yok. Oturum, DB'de tutulan rastgele bir jetondur; çıkış yapıldığında
 * gerçekten geçersiz olur (imzalı çerezde bu mümkün olmazdı).
 *
 * Bu hâlâ bir PROTOTİPTİR: yasal metinler hazır değil, bu yüzden kayıt
 * ekranı gerçek kişisel veri istemez ve arayüz "geliştirme aşamasında"
 * uyarısını korur.
 */
export const userRoleEnum = pgEnum("user_role", ["danisan", "uzman"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  /** Danışan hesabıysa: kendi hane kaydı. */
  consultantId: text("consultant_id").references(() => consultants.id, {
    onDelete: "cascade",
  }),
  /** Danışan hesabıysa: panelde kendisini temsil eden aile üyesi satırı. */
  memberId: text("member_id").references(() => familyMembers.id, {
    onDelete: "set null",
  }),
  /** Uzman hesabıysa: uzman profili. */
  expertId: text("expert_id").references(() => experts.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});

/* ------------------------------------------------------------------ */
/* RANDEVULAR (2026-08-06)                                             */
/*
 * Uzman bir saat teklif eder, danışan kabul veya reddeder. Görüşme
 * bağlantısı randevuya bağlıdır (conversations.meetingUrl dosya
 * genelindeydi; randevu bazlı olması takvim akışını mümkün kılıyor).
 *
 * Görüşme kaydı YOK — kilitli karar. Bağlantı harici bir araca çıkar.
 */
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "teklif",
  "kabul",
  "reddedildi",
  "iptal",
  "tamamlandi",
]);

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  proposedByExpertId: text("proposed_by_expert_id")
    .notNull()
    .references(() => experts.id),
  startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  status: appointmentStatusEnum("status").notNull().default("teklif"),
  note: text("note"),
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
});
