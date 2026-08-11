/**
 * TEK SEFERLİK GÖÇ — `appointments` tablosuna `expert_id` ve `ends_at`.
 *
 * ÇALIŞTIRMA SIRASI ÖNEMLİ:
 *   1. npx tsx scripts/backfill-appointments.mts   <-- ÖNCE bu
 *   2. npm run db:push                             <-- sonra bu
 *
 * Neden bu sıra: yeni kolonlar şemada `notNull`. `db:push` önce
 * çalıştırılırsa mevcut satırlarda değer bulamayıp hata verir. Bu betik
 * kolonları önce NULLABLE olarak ekleyip dolduruyor; `db:push` sonra
 * yalnızca NOT NULL kısıtını, yabancı anahtarı ve indeksleri kuruyor.
 *
 * Betik idempotenttir: birden fazla çalıştırmak zararsızdır.
 *
 * Projede migration geçmişi tutulmuyor (yalnızca drizzle-kit push), bu
 * yüzden veri dönüşümleri bu şekilde ayrı betiklerle yapılıyor —
 * `db:seed` kullanılamaz, o TÜM tabloları silip gerçek hesapları da
 * götürür.
 */

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = readFileSync(".env.local", "utf8");
const url = /DATABASE_URL\s*=\s*"?([^"\n\r]+)"?/.exec(env)?.[1]?.trim();
if (!url) throw new Error(".env.local içinde DATABASE_URL bulunamadı.");
const sql = neon(url);

console.log("1) Kolonlar ekleniyor (nullable)…");
await sql`alter table appointments add column if not exists expert_id text`;
await sql`alter table appointments add column if not exists ends_at timestamp`;

console.log("2) Değerler dolduruluyor…");
/* Randevunun uzmanı bugüne kadar yalnızca "teklif eden uzman" olarak
   biliniyordu; ikisi aynı kişi olduğu için doğrudan kopyalanabilir. */
/* `returning` şart: neon sürücüsü RETURNING'siz UPDATE'te boş dizi
   döner, dolayısıyla kaç satırın güncellendiği anlaşılmaz. */
const e1 = await sql`
  update appointments
     set expert_id = proposed_by_expert_id
   where expert_id is null
  returning id`;
const e2 = await sql`
  update appointments
     set ends_at = starts_at + (duration_minutes || ' minutes')::interval
   where ends_at is null
  returning id`;
console.log(`   expert_id: ${e1.length} satır · ends_at: ${e2.length} satır`);

console.log("3) Eksik kalan var mı…");
const [{ eksik }] = await sql`
  select count(*)::int as eksik
    from appointments
   where expert_id is null or ends_at is null`;
if (eksik > 0) {
  throw new Error(
    `${eksik} satır hâlâ boş. db:push çalıştırmayın, önce bunu inceleyin.`,
  );
}
console.log("   eksik yok.");

console.log("4) Kısmi tekil indeksi bozacak çakışma var mı…");
/* db:push, (expert_id, starts_at) üzerinde status in ('teklif','kabul')
   koşullu TEKİL indeks kuracak. Mevcut veride aynı uzman + aynı saatte
   iki aktif randevu varsa indeks kurulamaz. Burada yalnızca RAPORLUYORUZ;
   silmiyoruz — hangisinin kalacağı veri sahibinin kararı. */
const cakisma = await sql`
  select expert_id, starts_at, count(*)::int as adet
    from appointments
   where status in ('teklif', 'kabul')
   group by expert_id, starts_at
  having count(*) > 1
   order by adet desc`;

if (cakisma.length > 0) {
  console.log(`   ⚠ ${cakisma.length} çakışma bulundu:`);
  for (const c of cakisma) {
    console.log(`     ${c.expert_id} · ${c.starts_at} · ${c.adet} kayıt`);
  }
  console.log(
    "   Bunlar temizlenmeden `npm run db:push` tekil indeksi kuramaz.\n" +
      "   Fazlalık randevuların durumunu 'iptal' yapmak yeterli.",
  );
} else {
  console.log("   çakışma yok.");
}

console.log("\nTamam. Şimdi: npm run db:push");
