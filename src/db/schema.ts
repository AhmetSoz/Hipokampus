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

/** Danışma dosyaları. "Sohbet" değil, adı olan bir iş — bkz. context/07. */
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
