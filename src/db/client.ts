import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Veritabanı bağlantısı.
 *
 * Vercel Postgres artık Neon marketplace entegrasyonu üzerinden sağlanıyor;
 * proje Vercel'de bir Postgres storage'a bağlandığında `DATABASE_URL`
 * ortam değişkeni otomatik enjekte edilir.
 *
 * `neon-http` sürücüsü seçildi (WebSocket değil): sunucusuz fonksiyonlarda
 * bağlantı havuzu tutmuyor, her istek kendi HTTP çağrısını yapıyor — bu da
 * Next.js'in App Router sunucu bileşenleriyle doğrudan uyumlu.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL tanımlı değil. Vercel'de proje bir Postgres storage'a " +
      "bağlanmalı, yerelde ise `vercel env pull .env.local` ile çekilmeli.",
  );
}

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });
