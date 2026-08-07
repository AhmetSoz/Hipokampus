/**
 * Veritabanındaki "bakım" dilini temizler — TEK SEFERLİK bakım betiği.
 *
 * Sahibinin konumlandırma düzeltmesi (2026-08-07): "biz bakıcı değiliz,
 * işinde uzman gerontologlarla birlikte çalışıyoruz." Arayüz metinleri
 * kodda düzeltildi; bu betik aynı düzeltmeyi tohumlanmış SATIRLARA
 * uygular.
 *
 * `db:seed` de güncellendi ama onu çalıştırmak gerçek hesapları siler.
 * Bu betik yalnızca metin alanlarını günceller; hesaplar, randevular ve
 * seans notları yerinde kalır.
 *
 * Çalıştırma: npx tsx scripts/rename-care-terms.mts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL tanımlı değil.");
const db = drizzle(neon(connectionString), { schema });

/** Sırası önemli: uzun kalıplar önce, yoksa kısa olan içini bozuyor. */
const REPLACEMENTS: [RegExp, string][] = [
  [/Bakım sürecinin en zor kısmı/g, "Sürecin en zor kısmı"],
  [/Uzun yıllar evde bakım süreçlerinde/g, "Uzun yıllar ileri yaş destek süreçlerinde"],
  [/Bakım veren kişinin yorgunluğu/g, "Süreci yürüten kişinin yorgunluğu"],
  [/Bakım seçeneklerinin karşılaştırılması/g, "Destek seçeneklerinin karşılaştırılması"],
  [/Evde bakım düzeni kurma/g, "Evde günlük düzenin kurulması"],
  [/Kurum bakımına geçiş süreci/g, "Kuruma geçiş süreci"],
  [/Bakım verenin tükenmişliği/g, "Yakının tükenmişliği"],
  [/Uzaktan bakım koordinasyonu/g, "Uzaktan süreç koordinasyonu"],
  [/Annem için evde bakım düzeni/g, "Annem için evde günlük düzen"],
  [/bir bakım planı hazırladım/g, "bir danışmanlık planı hazırladım"],
  [/bakım planında banyo/g, "planda banyo"],
  [/Bakım planı/g, "Danışmanlık planı"],
  [/bakım planı/g, "danışmanlık planı"],
];

function fix(value: string): string {
  let out = value;
  for (const [re, to] of REPLACEMENTS) out = out.replace(re, to);
  return out;
}

let degisen = 0;

// --- Uzmanlar: uzmanlık alanları ve tanıtım metni ---
for (const e of await db.select().from(schema.experts)) {
  const specialties = e.specialties.map(fix);
  const about = fix(e.about);
  if (
    about !== e.about ||
    specialties.some((s, i) => s !== e.specialties[i])
  ) {
    await db
      .update(schema.experts)
      .set({ specialties, about })
      .where(eq(schema.experts.id, e.id));
    degisen++;
    console.log(`uzman güncellendi: ${e.name}`);
  }
}

// --- Danışma dosyası başlıkları ---
for (const c of await db.select().from(schema.conversations)) {
  const subject = fix(c.subject);
  if (subject !== c.subject) {
    await db
      .update(schema.conversations)
      .set({ subject })
      .where(eq(schema.conversations.id, c.id));
    degisen++;
    console.log(`dosya başlığı: ${subject}`);
  }
}

// --- Mesaj gövdeleri ---
for (const m of await db.select().from(schema.messages)) {
  const body = fix(m.body);
  if (body !== m.body) {
    await db
      .update(schema.messages)
      .set({ body })
      .where(eq(schema.messages.id, m.id));
    degisen++;
    console.log(`mesaj güncellendi: ${m.id}`);
  }
}

// --- Erişim kaydındaki bölüm adları ---
for (const a of await db.select().from(schema.accessLog)) {
  const section = fix(a.section);
  if (section !== a.section) {
    await db
      .update(schema.accessLog)
      .set({ section })
      .where(eq(schema.accessLog.id, a.id));
    degisen++;
  }
}

// --- Danışan özeti ve plan maddeleri ---
for (const c of await db.select().from(schema.consultants)) {
  const summary = fix(c.summary);
  if (summary !== c.summary) {
    await db
      .update(schema.consultants)
      .set({ summary })
      .where(eq(schema.consultants.id, c.id));
    degisen++;
  }
}

for (const p of await db.select().from(schema.planItems)) {
  const title = fix(p.title);
  const detail = fix(p.detail);
  if (title !== p.title || detail !== p.detail) {
    await db
      .update(schema.planItems)
      .set({ title, detail })
      .where(eq(schema.planItems.id, p.id));
    degisen++;
  }
}

console.log(`\nToplam ${degisen} satır güncellendi.`);
