import Link from "next/link";
import type { Appointment } from "@/data/types";
import { randevuDurumEtiketi } from "@/data/types";
import { bugunTr, trFormat, trGun, trSaat } from "@/lib/zaman";

/**
 * Uzmanın haftalık ajandası.
 *
 * 375px'te SÜTUN IZGARASI KULLANILMIYOR: yedi sütun telefonda ~50px'e
 * düşer ve içindeki hiçbir şey okunmaz. `sm:` altında gün gün liste,
 * üstünde yedi sütun. Kırığı sonradan yamamak yerine baştan önlüyoruz.
 *
 * Sunucu bileşeni — istemci durumu yok, hafta gezinmesi URL üzerinden.
 */

export function HaftaIzgarasi({
  gunler,
  randevular,
  danisanAdlari,
}: {
  gunler: string[];
  randevular: Appointment[];
  /** conversationId -> danışan adı. Ajandada asıl merak edilen bu. */
  danisanAdlari: Map<string, string>;
}) {
  const bugun = bugunTr();

  const gunBazli = new Map<string, Appointment[]>();
  for (const r of randevular) {
    const g = trGun(r.startsAt);
    const liste = gunBazli.get(g) ?? [];
    liste.push(r);
    gunBazli.set(g, liste);
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-7 sm:gap-2">
      {gunler.map((gun) => {
        const gunun = (gunBazli.get(gun) ?? []).sort((a, b) =>
          a.startsAt.localeCompare(b.startsAt),
        );
        const bugunMu = gun === bugun;

        return (
          <li
            key={gun}
            className={`rounded-xl border-2 p-3 ${
              bugunMu
                ? "border-teal-600 bg-teal-50"
                : "border-ink-200 bg-white"
            }`}
          >
            <p className="mb-2 border-b border-ink-100 pb-2">
              <span className="block text-base text-ink-600">
                {trFormat(`${gun}T12:00:00Z`, { weekday: "long" })}
              </span>
              <span className="block font-semibold whitespace-nowrap text-ink-900">
                {trFormat(`${gun}T12:00:00Z`, {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              {/* Kendi satırında: dar sütunda tarihle aynı satıra
                  sığmayıp ortadan bölünüyordu. */}
              {bugunMu && (
                <span className="mt-1 inline-block rounded-full bg-teal-700 px-2 py-0.5 text-base font-semibold text-white">
                  Bugün
                </span>
              )}
            </p>

            {gunun.length === 0 ? (
              <p className="text-base text-ink-500">—</p>
            ) : (
              <ul className="space-y-2">
                {gunun.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/uzman-panel/mesajlar/${r.conversationId}?sekme=yazisma`}
                      className={`block rounded-lg border-2 p-2 transition-[transform,border-color] duration-[var(--dur-fast)] hover:-translate-y-px hover:border-teal-400 ${
                        r.status === "kabul"
                          ? "border-teal-300 bg-white"
                          : "border-sky-300 bg-sky-50"
                      }`}
                    >
                      <span className="block font-semibold text-ink-900">
                        {trSaat(r.startsAt)}
                      </span>
                      <span className="block truncate text-base text-ink-700">
                        {danisanAdlari.get(r.conversationId) ?? "Danışan"}
                      </span>
                      <span className="block text-base text-ink-500">
                        {randevuDurumEtiketi(r.status, r.proposedBy, "uzman")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
