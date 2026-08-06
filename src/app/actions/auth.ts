"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createAuthSession,
  destroyAuthSession,
  findUserByEmail,
  signUpDanisan,
  signUpUzman,
  verifyPassword,
} from "@/data/auth";
import { AUTH_COOKIE } from "@/data/session";

/**
 * Giriş / kayıt / çıkış.
 *
 * Hata gösterimi projedeki mevcut desenle aynı: `redirect(?hata=...)` ve
 * sayfa bunu okuyup gösterir (bkz. admin/actions.ts, actions/messages.ts).
 * Böylece sessiz başarısızlık olmaz.
 */

const MAX_AGE = 60 * 60 * 24 * 30;

async function startSession(userId: string) {
  const token = await createAuthSession(userId);
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function login(formData: FormData) {
  const email = String(formData.get("eposta") ?? "").trim();
  const password = String(formData.get("parola") ?? "");

  if (!email || !password) redirect("/giris?hata=eksik");

  const user = await findUserByEmail(email);
  // Kullanıcı yok ve parola yanlış aynı mesajı verir: hangi e-postanın
  // kayıtlı olduğunu sızdırmamak için.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/giris?hata=gecersiz");
  }

  await startSession(user.id);
  redirect(user.role === "uzman" ? "/uzman-panel" : "/panel");
}

export async function logout() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (token) await destroyAuthSession(token);
  store.delete(AUTH_COOKIE);
  redirect("/giris");
}

export async function registerDanisan(formData: FormData) {
  const email = String(formData.get("eposta") ?? "").trim();
  const password = String(formData.get("parola") ?? "");
  const name = String(formData.get("ad") ?? "").trim();
  const city = String(formData.get("sehir") ?? "").trim();
  const birthYear = Number(String(formData.get("dogum") ?? ""));

  if (!email || !password || !name || !city || !birthYear) {
    redirect("/kayit?hata=eksik");
  }
  if (password.length < 8) redirect("/kayit?hata=kisa");
  if (birthYear < 1900 || birthYear > new Date().getFullYear()) {
    redirect("/kayit?hata=dogum");
  }

  const result = await signUpDanisan({
    email,
    password,
    name,
    birthYear,
    city,
  });
  if (!result.ok) redirect("/kayit?hata=kayitli");

  await startSession(result.userId);
  redirect("/panel");
}

export async function registerUzman(formData: FormData) {
  const email = String(formData.get("eposta") ?? "").trim();
  const password = String(formData.get("parola") ?? "");
  const name = String(formData.get("ad") ?? "").trim();
  const field = String(formData.get("alan") ?? "").trim();
  const city = String(formData.get("sehir") ?? "").trim();
  const about = String(formData.get("hakkinda") ?? "").trim();
  const specialties = String(formData.get("uzmanliklar") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!email || !password || !name || !field || !city) {
    redirect("/kayit/uzman?hata=eksik");
  }
  if (password.length < 8) redirect("/kayit/uzman?hata=kisa");

  const result = await signUpUzman({
    email,
    password,
    name,
    field,
    city,
    specialties: specialties.length ? specialties : [field],
    about: about || `${field} alanında çalışıyorum.`,
  });
  if (!result.ok) redirect("/kayit/uzman?hata=kayitli");

  await startSession(result.userId);
  redirect("/uzman-panel");
}
