"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/data/session";

/**
 * Demo kişisini seçer. Parola yok, hesap yok, kişisel veri yok —
 * yalnızca hangi görünümden bakılacağını belirleyen bir çerez.
 */
export async function selectDemoMember(formData: FormData) {
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

export async function clearDemoMember() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/giris");
}
