/**
 * Otomatik testlerin açtığı hesapları siler.
 *
 * Yalnızca `@ornek.test` uzantılı e-postalarla açılmış hesapları hedefler
 * — gerçek kayıtlara dokunmaz. `db:seed`'den farkı: tohum verisini ve
 * elle açılmış hesapları KORUR.
 *
 * Çalıştırma: npx tsx scripts/clean-test-accounts.mts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inArray, like } from "drizzle-orm";
import * as schema from "../src/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL tanımlı değil.");
const db = drizzle(neon(connectionString), { schema });

const testUsers = await db
  .select()
  .from(schema.users)
  .where(like(schema.users.email, "%@ornek.test"));

if (testUsers.length === 0) {
  console.log("Silinecek test hesabı yok.");
  process.exit(0);
}

console.log(`${testUsers.length} test hesabı bulundu:`);
for (const u of testUsers) console.log(` - ${u.email} (${u.role})`);

const consultantIds = testUsers.map((u) => u.consultantId).filter((v): v is string => !!v);
const expertIds = testUsers.map((u) => u.expertId).filter((v): v is string => !!v);

// users satırlarını önce sil; consultants/experts silinince cascade zaten
// çalışır ama sırayı açık tutmak beklenmedik FK hatalarını önlüyor.
await db.delete(schema.users).where(inArray(schema.users.id, testUsers.map((u) => u.id)));

if (consultantIds.length > 0) {
  await db.delete(schema.consultants).where(inArray(schema.consultants.id, consultantIds));
  console.log(`${consultantIds.length} hane kaydı silindi.`);
}
if (expertIds.length > 0) {
  await db.delete(schema.experts).where(inArray(schema.experts.id, expertIds));
  console.log(`${expertIds.length} uzman profili silindi.`);
}

console.log("Temizlik tamam.");
