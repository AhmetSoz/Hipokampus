/**
 * Sunum/test için üç örnek hesap açar: danışan, aile üyesi ve uzman.
 *
 * Hesaplar BOŞ DEĞİL — tohum verisindeki dolu kayıtlara bağlanır, böylece
 * girer girmez bakım planı, danışma dosyaları, seans notları ve grafik
 * görünür:
 *   danışan     → Fatma Demir (hane sahibi, tüm kapsamlar)
 *   aile üyesi  → Mehmet Demir (ödemeyi yapan, sağlık kapsamı YOK)
 *   uzman       → Hakan Devrim (açık dosya + seans notları + grafik)
 *
 * Aile üyesi hesabı bilerek Mehmet Demir'e bağlandı: "ödeme yapmak sağlık
 * verisini görme hakkı vermez" kilitli kararını tek bakışta gösteriyor.
 *
 * Parola KODA YAZILMAZ (depo public) — `DEMO_PASSWORD` ortam değişkeninden
 * okunur:
 *   DEMO_PASSWORD='...' npx tsx scripts/create-demo-accounts.mts
 *
 * Betik tekrar çalıştırılabilir: aynı e-postalar varsa parolaları ve
 * bağlantıları günceller, kopya kayıt açmaz.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/data/password";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL tanımlı değil.");

const password = process.env.DEMO_PASSWORD;
if (!password || password.length < 8) {
  throw new Error(
    "DEMO_PASSWORD ortam değişkeni gerekli (en az 8 karakter).\n" +
      "Örnek: DEMO_PASSWORD='...' npx tsx scripts/create-demo-accounts.mts",
  );
}

const db = drizzle(neon(connectionString), { schema });

const HESAPLAR = [
  {
    id: "demo-danisan",
    email: "danisan@hipokampus.demo",
    role: "danisan" as const,
    consultantId: "d1",
    memberId: "a0", // Fatma Demir — hane sahibi
    expertId: null,
    aciklama: "Danışan (hane sahibi) — Fatma Demir",
  },
  {
    id: "demo-aile",
    email: "aile@hipokampus.demo",
    role: "danisan" as const,
    consultantId: "d1",
    memberId: "a2", // Mehmet Demir — ödeyen, sağlık kapsamı yok
    expertId: null,
    aciklama: "Aile üyesi (ödemeyi yapan) — Mehmet Demir",
  },
  {
    id: "demo-uzman",
    email: "uzman@hipokampus.demo",
    role: "uzman" as const,
    consultantId: null,
    memberId: null,
    expertId: "u4", // Hakan Devrim — açık dosya, seans notları, grafik
    aciklama: "Uzman — Hakan Devrim",
  },
];

// Bağlanacak tohum kayıtları gerçekten var mı? Yoksa sessizce yanlış
// hesap açmak yerine erken ve açık şekilde duruyoruz.
for (const h of HESAPLAR) {
  if (h.consultantId) {
    const [c] = await db
      .select({ id: schema.consultants.id })
      .from(schema.consultants)
      .where(eq(schema.consultants.id, h.consultantId));
    if (!c) throw new Error(`Hane kaydı yok: ${h.consultantId}. Önce npm run db:seed.`);
  }
  if (h.memberId) {
    const [m] = await db
      .select({ id: schema.familyMembers.id })
      .from(schema.familyMembers)
      .where(eq(schema.familyMembers.id, h.memberId));
    if (!m) throw new Error(`Aile üyesi kaydı yok: ${h.memberId}. Önce npm run db:seed.`);
  }
  if (h.expertId) {
    const [e] = await db
      .select({ id: schema.experts.id })
      .from(schema.experts)
      .where(eq(schema.experts.id, h.expertId));
    if (!e) throw new Error(`Uzman kaydı yok: ${h.expertId}. Önce npm run db:seed.`);
  }
}

for (const h of HESAPLAR) {
  const passwordHash = await hashPassword(password);
  const [mevcut] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, h.email));

  if (mevcut) {
    await db
      .update(schema.users)
      .set({
        passwordHash,
        role: h.role,
        consultantId: h.consultantId,
        memberId: h.memberId,
        expertId: h.expertId,
      })
      .where(eq(schema.users.id, mevcut.id));
    // Eski oturumlar yeni parolayla geçersiz olsun.
    await db
      .delete(schema.authSessions)
      .where(eq(schema.authSessions.userId, mevcut.id));
    console.log(`güncellendi  ${h.email.padEnd(28)} ${h.aciklama}`);
  } else {
    await db.insert(schema.users).values({
      id: h.id,
      email: h.email,
      passwordHash,
      role: h.role,
      consultantId: h.consultantId,
      memberId: h.memberId,
      expertId: h.expertId,
      createdAt: new Date(),
    });
    console.log(`oluşturuldu  ${h.email.padEnd(28)} ${h.aciklama}`);
  }
}

console.log("\nParola: DEMO_PASSWORD ortam değişkeninde verdiğiniz değer.");
