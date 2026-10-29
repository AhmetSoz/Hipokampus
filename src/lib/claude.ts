import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { headers } from "next/headers";

export const CLAUDE_MODEL = "claude-opus-5-5";

/** Anahtar yoksa özellik kapanır; sayfa listeden işaretleme yoluna düşer. */
export function claudeAcikMi(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let istemci: Anthropic | null = null;

export function claude(): Anthropic {
  istemci ??= new Anthropic();
  return istemci;
}

/**
 * Modele gitmeden önce açıkça kimlik bildiren kalıpları siler. Kullanıcıya
 * "isim, telefon, kimlik numarası yazmayın" diyoruz; bu, unutulduğunda
 * ikinci bir emniyet. Ad soyadı yakalamaya çalışmıyoruz — yanlış pozitif
 * metni bozardı.
 */
export function kimlikBilgisiniAyikla(metin: string): string {
  return metin
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[e-posta]")
    .replace(/\b[1-9]\d{10}\b/g, "[kimlik no]")
    .replace(/(\+?90[\s-]?)?\(?0?5\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g, "[telefon]");
}

const pencere = new Map<string, number[]>();

/**
 * Basit, süreç içi istek sınırı. Prototipte herkese açık bir uçtan API
 * bütçesinin tüketilmesini önlemek için yeterli; çok örnekli dağıtımda
 * örnek başına çalışır.
 */
export async function istekSiniriAsildiMi(
  anahtar: string,
  limit = 6,
  sureMs = 10 * 60_000,
): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "yerel";
  const k = `${anahtar}:${ip}`;
  const simdi = Date.now();
  const gecmis = (pencere.get(k) ?? []).filter((t) => simdi - t < sureMs);
  if (gecmis.length >= limit) {
    pencere.set(k, gecmis);
    return true;
  }
  gecmis.push(simdi);
  pencere.set(k, gecmis);
  return false;
}
