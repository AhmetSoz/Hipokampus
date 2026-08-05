import "server-only";
import { cookies } from "next/headers";
import { getFamilyMember, listFamily } from "./household";
import type { FamilyMember } from "./types";

/**
 * DEMO OTURUMU — GERÇEK KİMLİK DOĞRULAMA DEĞİLDİR.
 *
 * Kayıt kapalıdır (bkz. karar kaydı A2 "Prototip kapsamı"): gerçek kişisel
 * veri toplanmıyor, parola sorulmuyor, hesap açılmıyor. Kullanıcı yalnızca
 * hangi demo kişi olarak bakacağını seçiyor; seçim bir çerezde tutuluyor.
 *
 * Gerçek kimlik doğrulama, yasal metinler hazır olmadan eklenmeyecek.
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

export { COOKIE as SESSION_COOKIE };
