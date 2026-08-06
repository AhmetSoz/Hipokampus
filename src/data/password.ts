import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Parola özetleme.
 *
 * `auth.ts`'ten AYRI bir dosyada duruyor çünkü o modül `server-only`
 * işaretli ve bakım betiklerinden (scripts/*.mts) çağrılamıyor. Burada
 * React'e veya isteğe bağlı hiçbir şey yok — saf Node kriptosu.
 *
 * Node'un yerleşik `scrypt`'i kullanılır: ek bağımlılık yok. Her kayıt
 * kendi rastgele tuzunu alır; karşılaştırma `timingSafeEqual` ile yapılır.
 */

const scrypt = promisify(_scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEYLEN);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const derived = await scrypt(password, salt, KEYLEN);
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}
