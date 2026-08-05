import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// `vercel env pull` .env.local dosyasına yazıyor; drizzle-kit'in kendisi
// yalnızca .env'i otomatik okuyor, bu yüzden burada elle yükleniyor.
config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tanımlı değil.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
