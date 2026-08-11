import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
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

  /* Randevu ayarları (2026-08-11). Hiçbiri ücret/puan/sıralama alanı
     değildir; kilitli kararlarla çelişmez. */

  /* Danışan yayınlanmış bir slottan seçtiğinde randevu doğrudan kabul
     olur, dolayısıyla bağlantının hazır olması gerekir. Boşsa randevu
     yine geçerlidir, bağlantı sonradan girilir. */
  defaultMeetingUrl: text("default_meeting_url"),
  /* Bugün tek değer. Kuralların "kimin saatine göre" yorumlandığını
     şemada açık kılmak için var; yurt dışındaki bir uzman eklenirse
     tek satır değişikliğiyle çalışır. */
  timezone: text("timezone").notNull().default("Europe/Istanbul"),
  /** En erken kaç saat sonrasına randevu alınabilir. */
  bookingLeadHours: integer("booking_lead_hours").notNull().default(24),
  /** Takvimin kaç gün ilerisi gösterilir. */
  bookingHorizonDays: integer("booking_horizon_days").notNull().default(28),
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
}, (t) => [index("family_members_consultant_idx").on(t.consultantId)]);

/** Erişim kaydı — kim, ne zaman, hangi bölümü açtı. */
export const accessLog = pgTable("access_log", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => familyMembers.id, { onDelete: "cascade" }),
  scope: text("scope").notNull(),
  section: text("section").notNull(),
  at: timestamp("at", { mode: "date" }).notNull(),
}, (t) => [index("access_log_member_idx").on(t.memberId, t.at)]);

/** Danışmanlık planı maddeleri. */
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
}, (t) => [index("plan_items_consultant_idx").on(t.consultantId)]);

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
}, (t) => [
    index("conversations_expert_idx").on(t.expertId),
    index("conversations_consultant_idx").on(t.consultantId),
  ]);

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
}, (t) => [index("messages_conversation_idx").on(t.conversationId, t.sentAt)]);

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
}, (t) => [index("assessment_items_template_idx").on(t.templateId, t.position)]);

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
}, (t) => [index("assessment_assignments_consultant_idx").on(t.consultantId, t.assignedAt)]);

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
}, (t) => [index("assessment_responses_assignment_idx").on(t.assignmentId)]);

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
}, (t) => [index("session_notes_conversation_idx").on(t.conversationId, t.occurredAt)]);

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
}, (t) => [index("session_measurements_session_idx").on(t.sessionId, t.sortOrder)]);

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
}, (t) => [
    index("users_consultant_idx").on(t.consultantId),
    index("users_expert_idx").on(t.expertId),
  ]);

/* ------------------------------------------------------------------ */
/* BİLDİRİMLER (2026-08-10)                                            */
/*
 * Ürünün en büyük işlevsel boşluğuydu: uzman randevu teklif ediyor,
 * danışan panele girip bakmadıkça haberi olmuyordu. Asenkron bir üründe
 * bu, akışın kopma noktası.
 *
 * Şimdilik YALNIZCA UYGULAMA İÇİ. E-posta/SMS ayrı bir iş (sağlayıcı
 * seçimi, KVKK aydınlatması, gönderim izni). Burada kasıtlı olarak
 * "bildirim tercihi" alanı da yok — kanal tek olduğu sürece gereksiz.
 *
 * `href` bildirime tıklayınca gidilecek yer; `readAt` null ise okunmamış.
 */
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body"),
  href: text("href").notNull(),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
}, (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)]);

export const authSessions = pgTable("auth_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
}, (t) => [
    index("auth_sessions_user_idx").on(t.userId),
    index("auth_sessions_expires_idx").on(t.expiresAt),
  ]);

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

/** Randevuyu kimin başlattığı. Danışan artık yayınlanmış bir slottan
 *  kendisi seçebiliyor; durum etiketi buna göre değişiyor. */
export const appointmentProposerEnum = pgEnum("appointment_proposer", [
  "uzman",
  "danisan",
]);

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  proposedByExpertId: text("proposed_by_expert_id")
    .notNull()
    .references(() => experts.id),
  /* `proposedByExpertId` "kim teklif etti", bu ise "kimin takviminde".
     Ajanda sorgusu ve çakışma kısıtı tek tablo üzerinden çalışabilsin
     diye ayrı kolon; aksi hâlde her ikisi de conversations join'i
     gerektirirdi ve kısmi tekil indeks kurulamazdı.
     GÖÇ: önce nullable eklendi, backfill-appointments.mts çalıştı,
     sonra notNull yapıldı. */
  expertId: text("expert_id")
    .notNull()
    .references(() => experts.id),
  startsAt: timestamp("starts_at", { mode: "date" }).notNull(),
  /* `durationMinutes`'tan türetilebilir ama örtüşme sorgusunu SQL'de
     yazılabilir kılıyor: starts_at < :yeniBitis AND ends_at > :yeniBaslangic */
  endsAt: timestamp("ends_at", { mode: "date" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  proposedBy: appointmentProposerEnum("proposed_by")
    .notNull()
    .default("uzman"),
  status: appointmentStatusEnum("status").notNull().default("teklif"),
  note: text("note"),
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
}, (t) => [
  index("appointments_conversation_idx").on(t.conversationId, t.startsAt),
  index("appointments_expert_idx").on(t.expertId, t.startsAt),
  /* Yarış durumunun SERT garantisi. neon-http'de transaction yok ve
     db.batch() interaktif değil (birinci sorgunun sonucuna bakıp
     ikinciyi kurgulayamazsınız), bu yüzden karar veritabanı kısıtına
     gömülüyor: tek INSERT zaten atomiktir, ikinci istek 23505 alır.
     `where` şart — reddedilen/iptal edilen randevu o slotu yeniden açar.

     SINIR: yalnızca birebir aynı başlangıcı engeller. Rezerve edilebilir
     tüm slotlar kural ızgarasında durduğu için pratikte tam koruma.
     Değişken süreye izin verilirse doğru araç
     `EXCLUDE USING gist (expert_id WITH =, tsrange(...) WITH &&)` +
     btree_gist olur; drizzle şemasında ifade edilemez, ham SQL göçü ister. */
  uniqueIndex("appointments_expert_slot_uq")
    .on(t.expertId, t.startsAt)
    .where(sql`status in ('teklif', 'kabul')`),
]);

/* ------------------------------------------------------------------ */
/* MÜSAİTLİK (2026-08-11)                                              */
/*
 * Uzman haftalık bir kural tanımlar ("her salı 10:00–16:00, 45 dakikalık
 * görüşmeler"), danışan üretilen boş slotlardan seçer.
 *
 * MODEL: tekrarlayan kural + gün bazlı istisna. Somut slot satırı
 * ÜRETİLMEZ. Gerekçe: uzmanın zihnindeki model bu ("salı öğleden
 * sonraları müsaitim, 3 Eylül izinliyim") ve tek doğruluk kaynağı
 * `appointments` olarak kalıyor. Materyalize slot üretmek hem haftada
 * yüzlerce satır demek hem de "kuralı değiştirdim, üretilmiş slotlara ne
 * olacak?" sorusunu sürekli açık bırakır. Slot listesi her istekte saf
 * bir fonksiyonla hesaplanıyor (~220 nesne, ihmal edilebilir).
 *
 * SAAT DİLİMİ: kural kolonları DUVAR SAATİ tutar (Türkiye yerel,
 * gün başından dakika). Uzmanın niyeti "her pazartesi 10:00" — bir an
 * değil, takvimdeki bir saat. `appointments.startsAt` ise mutlak andır.
 * İkisi arasındaki çeviri yalnızca `lib/zaman.ts` üzerinden yapılır.
 *
 * Tamsayı dakika kullanılıyor, `time` kolonu değil: projede tarih
 * kütüphanesi yok ve `time` her kullanımda dize ayrıştırması isterdi;
 * tamsayı ise slot üretimini saf bir döngüye indiriyor.
 */
export const availabilityExceptionKindEnum = pgEnum(
  "availability_exception_kind",
  ["kapali", "ek-slot"],
);

export const expertAvailabilityRules = pgTable(
  "expert_availability_rules",
  {
    id: text("id").primaryKey(),
    expertId: text("expert_id")
      .notNull()
      .references(() => experts.id, { onDelete: "cascade" }),
    /** ISO hafta günü: 1 = Pazartesi … 7 = Pazar. */
    weekday: integer("weekday").notNull(),
    /** Türkiye yerel saatiyle gün başından dakika (0–1440). */
    startMinute: integer("start_minute").notNull(),
    endMinute: integer("end_minute").notNull(),
    slotMinutes: integer("slot_minutes").notNull().default(45),
    /** Görüşmeler arası nefes payı. */
    gapMinutes: integer("gap_minutes").notNull().default(15),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  },
  (t) => [index("availability_rules_expert_idx").on(t.expertId, t.weekday)],
);

/* ------------------------------------------------------------------ */
/* ÖLÇÜM ETİKETİ BİRLEŞTİRME (2026-08-11)                              */
/*
 * `session_measurements.label` serbest metindir ve seriler etiketin
 * BİREBİR aynı olmasına göre gruplanır. "Tek ayak durma süresi" ile
 * "tek ayak durma" iki ayrı seri olur ve trend kaybolur. Sorun tek dosya
 * içinde `datalist` önerisiyle azalıyordu; dosyalar arası birleşik
 * trendde ise tam olarak burada patlıyor.
 *
 * Bu tablo, "bu iki etiket aynı ölçümü anlatıyor" tespitini saklar.
 *
 * OTOMATİK BİRLEŞTİRME YAPILMAZ: sistem yalnızca ÖNERİR, uzman onaylar.
 * Ham `label` hiçbir zaman değiştirilmez — geçmiş seans notu ne yazdıysa
 * öyle kalır. Gerekçe proje boyunca uygulanan ilkenin aynısı: sistem
 * yorum yapmaz, uzman yapar (puan yok, "iyi/kötü" yok, tanı yok).
 * Etiketleri sessizce birleştirmek de bir yorumdur ve yanlışsa uzmanın
 * göremediği bir veri hatası bırakır.
 *
 * `consultantId` bazlı, `expertId` bazlı DEĞİL: birleştirme verinin
 * kendisi hakkında bir tespittir, bakan kişi hakkında değil. Uzman bazlı
 * olsaydı iki uzman aynı veriyi farklı görürdü ve danışanın kendi
 * ilerleme ekranı hiçbir birleştirmeyi göremezdi. Kimin yaptığı
 * `createdByExpertId` ile izlenebilir kalıyor.
 */
export const measurementLabelAliases = pgTable(
  "measurement_label_aliases",
  {
    id: text("id").primaryKey(),
    /* NOT NULL şart: Postgres'te NULL ≠ NULL olduğu için nullable
       olsaydı tekil indeks o satırlarda hiç çalışmazdı. */
    consultantId: text("consultant_id")
      .notNull()
      .references(() => consultants.id, { onDelete: "cascade" }),
    rawLabel: text("raw_label").notNull(),
    canonicalLabel: text("canonical_label").notNull(),
    canonicalUnit: text("canonical_unit"),
    createdByExpertId: text("created_by_expert_id")
      .notNull()
      .references(() => experts.id),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  },
  (t) => [
    uniqueIndex("measurement_alias_uq").on(t.consultantId, t.rawLabel),
  ],
);

export const expertAvailabilityExceptions = pgTable(
  "expert_availability_exceptions",
  {
    id: text("id").primaryKey(),
    expertId: text("expert_id")
      .notNull()
      .references(() => experts.id, { onDelete: "cascade" }),
    /* `date`, `timestamp` DEĞİL: bu bir takvim günü, bir an değil.
       `timestamp` kullanmak saat dilimi belirsizliğini geri getirirdi. */
    day: date("day", { mode: "string" }).notNull(),
    kind: availabilityExceptionKindEnum("kind").notNull(),
    /** Yalnızca `ek-slot` için; `kapali`da null. */
    startMinute: integer("start_minute"),
    endMinute: integer("end_minute"),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  },
  (t) => [index("availability_exceptions_expert_idx").on(t.expertId, t.day)],
);
