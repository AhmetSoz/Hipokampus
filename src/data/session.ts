import "server-only";
import { cookies } from "next/headers";
import { getUserBySessionToken, type AuthUser } from "./auth";
import { getExpertById } from "./experts";
import { getFamilyMember, listFamily } from "./household";
import type { Expert, FamilyMember } from "./types";

/**
 * OTURUM ÇÖZÜMLEME — iki katman.
 *
 * 1. GERÇEK HESAP (öncelikli): `hk-oturum` çerezindeki jeton veritabanındaki
 *    bir oturuma karşılık geliyorsa, o kullanıcının kimliği kullanılır.
 *    Bkz. data/auth.ts ve karar kaydı "Gerçek giriş sistemi".
 *
 * 2. DEMO/ADMIN (yedek): gerçek oturum yoksa, admin panelinden seçilen
 *    "o kişi gibi bak" çerezleri (`hk-demo-uye`, `hk-demo-uzman`) devreye
 *    girer. Bu, ekip içi test aracının çalışmaya devam etmesi içindir;
 *    gerçek kimlik doğrulama değildir.
 *
 * Sıralama önemli: giriş yapmış bir kullanıcı admin çerezinden etkilenmez.
 */

const AUTH_COOKIE = "hk-oturum";
const COOKIE = "hk-demo-uye";
const DEFAULT_MEMBER = "a1"; // Ayşe Demir — kızı, birincil bakım veren
const DEMO_CONSULTANT = "d1"; // Tohum verisindeki örnek hane

export async function getCurrentUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return getUserBySessionToken(token);
}

export async function listDemoMembers(): Promise<FamilyMember[]> {
  const family = await listFamily(DEMO_CONSULTANT);
  return family.filter((m) => m.status !== "davet-bekliyor");
}

/**
 * Panelin gösterileceği hane. Giriş yapan danışanın kendi hanesi; yoksa
 * demo hane. Çok-haneli (multi-tenant) sorguların dayanağı budur.
 */
export async function getCurrentConsultantId(): Promise<string> {
  const user = await getCurrentUser();
  if (user?.consultantId) return user.consultantId;
  return DEMO_CONSULTANT;
}

export async function getCurrentMember(): Promise<FamilyMember> {
  const user = await getCurrentUser();
  if (user?.memberId) {
    const own = await getFamilyMember(user.memberId);
    if (own) return own;
  }

  const store = await cookies();
  const id = store.get(COOKIE)?.value ?? DEFAULT_MEMBER;
  const member =
    (await getFamilyMember(id)) ?? (await getFamilyMember(DEFAULT_MEMBER));
  if (!member) throw new Error("Demo üyesi bulunamadı");
  return member;
}

/* ------------------------------------------------------------------ */
/* Uzman tarafı.                                                        */

const EXPERT_COOKIE = "hk-demo-uzman";
const DEFAULT_EXPERT = "u1"; // Elif Tanyeri

export async function getCurrentExpert(): Promise<Expert> {
  const user = await getCurrentUser();
  if (user?.expertId) {
    const own = await getExpertById(user.expertId);
    if (own) return own;
  }

  const store = await cookies();
  const id = store.get(EXPERT_COOKIE)?.value ?? DEFAULT_EXPERT;
  const expert =
    (await getExpertById(id)) ?? (await getExpertById(DEFAULT_EXPERT));
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
  AUTH_COOKIE,
  DEMO_CONSULTANT,
};
