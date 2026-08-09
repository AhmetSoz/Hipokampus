import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { notifications, users } from "@/db/schema";

/**
 * Uygulama içi bildirimler.
 *
 * Hedef kullanıcıyı doğrudan almıyoruz; haneye veya uzmana gönderiyoruz
 * ve o kayda bağlı BÜTÜN hesaplara bildirim düşüyor. Sebebi: bir hanede
 * birden fazla aile üyesi hesabı olabilir ve randevu teklifini hepsinin
 * görmesi gerekir.
 *
 * Bildirim üretimi asla akışı kesmemeli: gönderim başarısız olursa asıl
 * işlem (randevu, mesaj) yine de tamamlanır — bkz. `guvenliBildir`.
 */

export type Bildirim = {
  id: string;
  title: string;
  body: string | null;
  href: string;
  okundu: boolean;
  createdAt: string;
};

type Icerik = { title: string; body?: string; href: string };

async function ekle(userIds: string[], icerik: Icerik) {
  if (userIds.length === 0) return;
  const now = new Date();
  await db.insert(notifications).values(
    userIds.map((userId, i) => ({
      id: `n${now.getTime()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      title: icerik.title,
      body: icerik.body ?? null,
      href: icerik.href,
      readAt: null,
      createdAt: now,
    })),
  );
}

/** Bir haneye bağlı tüm hesaplara bildirim düşürür. */
export async function notifyConsultant(consultantId: string, icerik: Icerik) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.consultantId, consultantId));
  await ekle(rows.map((r) => r.id), icerik);
}

/** Bir uzmanın hesabına bildirim düşürür. */
export async function notifyExpert(expertId: string, icerik: Icerik) {
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.expertId, expertId));
  await ekle(rows.map((r) => r.id), icerik);
}

/**
 * Bildirim gönderimini sarmalar. Bildirim ikincil bir yan etkidir;
 * başarısız olursa kullanıcının asıl işlemi başarısız olmamalı.
 */
export async function guvenliBildir(is: Promise<void>) {
  try {
    await is;
  } catch (e) {
    console.error("Bildirim gönderilemedi:", e);
  }
}

export async function listNotifications(
  userId: string,
  limit = 20,
): Promise<Bildirim[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    href: r.href,
    okundu: r.readAt !== null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function countUnread(userId: string): Promise<number> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
  return rows.length;
}

export async function markAllRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
}
