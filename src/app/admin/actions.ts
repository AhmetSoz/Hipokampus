"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_COOKIE, EXPERT_SESSION_COOKIE } from "@/data/session";

/**
 * Admin/test kapısı — GERÇEK YETKİLENDİRME DEĞİLDİR.
 *
 * Sahibi 2026-08-05'te bunu bilerek onayladı: test amaçlı tek parola +
 * gizli adres yeterli, asıl işletmede hastalar/uzmanlar/admin için gerçek
 * giriş sistemi kurulacak (ayrı bir iş, bkz. context/04-CURRENT-TASK.md).
 *
 * Parola `ADMIN_PASSWORD` ortam değişkeninde tutulur, kod içinde değil.
 * Kapatmak için: bu değişkeni kaldırın (parola asla eşleşmez) veya
 * `src/app/admin/` klasörünü tamamen silin.
 */

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("parola") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    redirect("/admin?hata=1");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function adminLogout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin");
}

/** Danışan tarafını belirli bir aile üyesi gibi görüntüle. */
export async function viewAsMember(formData: FormData) {
  const id = String(formData.get("uye") ?? "");
  if (!id) return;
  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/panel");
}

/** Uzman tarafını belirli bir uzman gibi görüntüle. */
export async function viewAsExpert(formData: FormData) {
  const id = String(formData.get("uzman") ?? "");
  if (!id) return;
  const store = await cookies();
  store.set(EXPERT_SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/uzman-panel");
}
