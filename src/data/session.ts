import "server-only";
import { cookies } from "next/headers";
import { getExpertById } from "./experts";
import { getFamilyMember, listFamily } from "./household";
import type { Expert, FamilyMember } from "./types";

/**
 * DEMO OTURUMU — GERÇEK KİMLİK DOĞRULAMA DEĞİLDİR.
 *
 * Kayıt kapalıdır (bkz. karar kaydı A2 "Prototip kapsamı"): gerçek kişisel
 * veri toplanmıyor, parola sorulmuyor, hesap açılmıyor. Kullanıcı yalnızca
 * hangi demo kişi olarak bakacağını seçiyor; seçim bir çerezde tutuluyor.
 *
 * Gerçek kimlik doğrulama, yasal metinler hazır olmadan eklenmeyecek. Sahibi
 * 2026-08-05'te bunu doğruladı: test için parola korumalı basit erişim
 * yeterli; asıl işletmede hastalar/uzmanlar/admin için gerçek giriş sistemi
 * kurulacak — bu ayrı, ilerideki bir iştir (bkz. context/04-CURRENT-TASK.md).
 */

const COOKIE = "hk-demo-uye";
const DEFAULT_MEMBER = "a1"; // Ayşe Demir — kızı, birincil bakım veren

export async function listDemoMembers(): Promise<FamilyMember[]> {
  const family = await listFamily();
  return family.filter((m) => m.status !== "davet-bekliyor");
}

export async function getCurrentMember(): Promise<FamilyMember> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value ?? DEFAULT_MEMBER;
  const member = (await getFamilyMember(id)) ?? (await getFamilyMember(DEFAULT_MEMBER));
  if (!member) throw new Error("Demo üyesi bulunamadı");
  return member;
}

/* ------------------------------------------------------------------ */
/* Uzman tarafı demo oturumu — admin panelinden "bu uzman gibi bak"     */
/* seçildiğinde kullanılır. Aynı ilkeler: parola yok, gerçek hesap yok.  */

const EXPERT_COOKIE = "hk-demo-uzman";
const DEFAULT_EXPERT = "u1"; // Elif Tanyeri

export async function getCurrentExpert(): Promise<Expert> {
  const store = await cookies();
  const id = store.get(EXPERT_COOKIE)?.value ?? DEFAULT_EXPERT;
  const expert = (await getExpertById(id)) ?? (await getExpertById(DEFAULT_EXPERT));
  if (!expert) throw new Error("Demo uzmanı bulunamadı");
  return expert;
}

/* ------------------------------------------------------------------ */
/* Admin/test kapısı çerezi — ayrıntı için src/app/admin/actions.ts.    */

const ADMIN_COOKIE = "hk-admin";

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === "ok";
}

export {
  COOKIE as SESSION_COOKIE,
  EXPERT_COOKIE as EXPERT_SESSION_COOKIE,
  ADMIN_COOKIE,
};
