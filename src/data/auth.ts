import "server-only";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  authSessions,
  consultants,
  experts,
  familyMembers,
  users,
} from "@/db/schema";
import { hashPassword, verifyPassword } from "./password";

export { hashPassword, verifyPassword };

/**
 * Gerçek hesap sistemi.
 *
 * Parola DÜZ METİN SAKLANMAZ: Node'un yerleşik `crypto.scrypt`'i ile,
 * kayıt başına rastgele bir tuzla (salt) türetilmiş özet saklanır. Ek bir
 * bağımlılık (bcrypt vb.) gerekmez. Karşılaştırma `timingSafeEqual` ile
 * yapılır — zamanlama saldırısına karşı.
 *
 * Oturum, veritabanında tutulan rastgele bir jetondur (imzalı çerez
 * değil): "çıkış yap" gerçekten geçersiz kılabilsin diye.
 *
 * PROTOTİP UYARISI: yasal metinler hazır değil. Kayıt ekranı gerçek
 * kişisel/sağlık verisi istemez; arayüz "geliştirme aşamasındadır"
 * uyarısını korur. Bkz. karar kaydı "Gerçek giriş sistemi".
 */

export type AuthUser = {
  id: string;
  email: string;
  role: "danisan" | "uzman";
  consultantId: string | null;
  memberId: string | null;
  expertId: string | null;
};

function toAuthUser(row: typeof users.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    consultantId: row.consultantId,
    memberId: row.memberId,
    expertId: row.expertId,
  };
}

export async function findUserByEmail(email: string): Promise<
  (AuthUser & { passwordHash: string }) | null
> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()));
  return row ? { ...toAuthUser(row), passwordHash: row.passwordHash } : null;
}

const SESSION_DAYS = 30;

/** Yeni oturum jetonu üretir ve kaydeder. Jeton çerezde saklanacak. */
export async function createAuthSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  await db.insert(authSessions).values({
    token,
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_DAYS * 86_400_000),
  });
  return token;
}

export async function getUserBySessionToken(
  token: string,
): Promise<AuthUser | null> {
  const [row] = await db
    .select()
    .from(authSessions)
    .where(eq(authSessions.token, token));
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(authSessions).where(eq(authSessions.token, token));
    return null;
  }
  const [userRow] = await db.select().from(users).where(eq(users.id, row.userId));
  return userRow ? toAuthUser(userRow) : null;
}

export async function destroyAuthSession(token: string): Promise<void> {
  await db.delete(authSessions).where(eq(authSessions.token, token));
}

/* ------------------------------------------------------------------ */
/* KAYIT                                                                */

export type SignupResult = { ok: true; userId: string } | { ok: false; error: string };

/**
 * Danışan kaydı. Kişinin kendi hane kaydını (consultant) ve panelde
 * kendisini temsil eden aile üyesi satırını da oluşturur — böylece yeni
 * hesap boş bir panele değil, kendi panonuna düşer.
 */
export async function signUpDanisan(input: {
  email: string;
  password: string;
  name: string;
  birthYear: number;
  city: string;
}): Promise<SignupResult> {
  const email = input.email.trim().toLowerCase();
  if (await findUserByEmail(email)) {
    return { ok: false, error: "Bu e-posta zaten kayıtlı." };
  }

  const stamp = Date.now();
  const consultantId = `c${stamp}`;
  const memberId = `fm${stamp}`;
  const userId = `u_${stamp}`;

  await db.insert(consultants).values({
    id: consultantId,
    name: input.name,
    birthYear: input.birthYear,
    city: input.city,
    summary: "Hesap sahibi tarafından oluşturuldu.",
  });

  await db.insert(familyMembers).values({
    id: memberId,
    consultantId,
    name: input.name,
    relation: "Kendisi",
    relationRole: "birey",
    scopes: ["saglik-gorusme", "gunluk-lojistik", "odeme-fatura"],
    status: "aktif",
    payer: true,
    invitedAt: new Date(),
    expiresAt: null,
  });

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash: await hashPassword(input.password),
    role: "danisan",
    consultantId,
    memberId,
    expertId: null,
    createdAt: new Date(),
  });

  return { ok: true, userId };
}

function slugify(value: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return value
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Uzman kaydı. Uzman profilini de oluşturur; profil hemen listede görünür. */
export async function signUpUzman(input: {
  email: string;
  password: string;
  name: string;
  field: string;
  city: string;
  specialties: string[];
  about: string;
}): Promise<SignupResult> {
  const email = input.email.trim().toLowerCase();
  if (await findUserByEmail(email)) {
    return { ok: false, error: "Bu e-posta zaten kayıtlı." };
  }

  const stamp = Date.now();
  const expertId = `e${stamp}`;
  const userId = `u_${stamp}`;
  const baseSlug = slugify(input.name) || `uzman-${stamp}`;

  // Slug benzersiz olmalı (unique kısıt) — çakışırsa sonuna damga eklenir.
  const [clash] = await db
    .select({ slug: experts.slug })
    .from(experts)
    .where(eq(experts.slug, baseSlug));
  const slug = clash ? `${baseSlug}-${stamp}` : baseSlug;

  await db.insert(experts).values({
    id: expertId,
    slug,
    name: input.name,
    field: input.field,
    city: input.city,
    specialties: input.specialties,
    availability: "bu-hafta",
    // Prototip: kayıt olan uzman doğrulanmış sayılır. Gerçek doğrulama
    // süreci (bkz. /dogrulama) ayrı bir iştir.
    verifiedAt: new Date(),
    about: input.about,
    needAreaIds: ["gunluk", "saglik-koordinasyon", "hafiza"],
    languages: ["Türkçe"],
  });

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash: await hashPassword(input.password),
    role: "uzman",
    consultantId: null,
    memberId: null,
    expertId,
    createdAt: new Date(),
  });

  return { ok: true, userId };
}
