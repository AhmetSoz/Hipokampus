"use server";

import { revalidatePath } from "next/cache";
import { markAllRead } from "@/data/notifications";
import { getCurrentUser } from "@/data/session";

/**
 * Bildirim listesi açıldığında hepsini okundu sayar.
 *
 * Tek tek okundu işaretlemek kullanıcının ilgilenmediği bir muhasebe işi;
 * buradaki soru "yeni bir şey var mı?" ve panel açılınca yanıtlanmış olur.
 */
export async function tumunuOkunduIsaretle() {
  const user = await getCurrentUser();
  if (!user) return;
  await markAllRead(user.id);
  revalidatePath("/", "layout");
}
