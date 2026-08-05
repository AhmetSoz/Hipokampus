import type { Metadata } from "next";
import { Notice } from "@/components/ui";
import {
  getConsultant,
  listAccessLog,
  listFamily,
} from "@/data/household";
import { getCurrentMember } from "@/data/session";
import { SCOPE_DESCRIPTION, SCOPE_LABEL } from "@/data/types";
import type { DataScope } from "@/data/types";

export const metadata: Metadata = { title: "Erişim ve izinler" };

const SCOPES: DataScope[] = [
  "saglik-gorusme",
  "gunluk-lojistik",
  "odeme-fatura",
];

const ROLE_LABEL = {
  birey: "Panelin sahibi",
  "bakim-veren": "Birincil bakım veren",
  "aile-uyesi": "Aile üyesi",
} as const;

export default async function ErisimSayfasi() {
  const [member, consultant, family, log] = await Promise.all([
    getCurrentMember(),
    getConsultant(),
    listFamily(),
    listAccessLog(),
  ]);

  const isOwner = member.relationRole === "birey";
  const byId = new Map(family.map((m) => [m.id, m]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-3 text-3xl sm:text-4xl">Erişim ve izinler</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Kimin neyi görebildiği burada tutulur. Yetkiyi yalnızca{" "}
          {consultant.name} verir veya geri alır.
        </p>
      </div>

      <Notice tone="teal" title="İki ayrı şey karıştırılmaz">
        <p>
          <strong>Ödeme yapmak, sağlık ve görüşme verisini görme hakkı
          vermez.</strong> Bunlar birbirinden bağımsız iki yetkidir. Bir kişi
          ödemeyi yapıyor olabilir ve bakım planını hiç görmüyor olabilir.
        </p>
      </Notice>

      {/* Kapsam ızgarası — tek bir "rol" seviyesi yerine iki eksen */}
      <section className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
        <table className="w-full min-w-[46rem] border-collapse">
          <caption className="border-b border-ink-200 p-6 text-left">
            <span className="block text-2xl text-ink-900">Kim neyi görüyor</span>
            <span className="mt-1 block text-base text-ink-600">
              Bir kapsamın açık olması diğerini açmaz.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-ink-200 bg-paper-warm text-left">
              <th scope="col" className="p-5 font-semibold text-ink-900">
                Kişi
              </th>
              {SCOPES.map((s) => (
                <th
                  key={s}
                  scope="col"
                  className="p-5 font-semibold text-ink-900"
                >
                  {SCOPE_LABEL[s]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {family.map((m) => {
              const suspended = m.status === "askida";
              return (
                <tr key={m.id} className="border-b border-ink-100 last:border-0">
                  <th scope="row" className="p-5 text-left align-top">
                    <span className="block text-lg font-semibold text-ink-900">
                      {m.name}
                    </span>
                    <span className="block text-base text-ink-600">
                      {m.relation} · {ROLE_LABEL[m.relationRole]}
                    </span>
                    {m.payer && (
                      <span className="mt-2 inline-block rounded-md bg-sand-100 px-3 py-1 text-base text-ink-700">
                        Ödemeyi bu kişi yapıyor
                      </span>
                    )}
                    {suspended && (
                      <span className="mt-2 inline-block rounded-md bg-ink-100 px-3 py-1 text-base text-ink-700">
                        Erişimi askıda
                      </span>
                    )}
                    {m.expiresAt && !suspended && (
                      <span className="mt-2 block text-base text-ink-600">
                        Bitiş:{" "}
                        {new Date(m.expiresAt).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </th>
                  {SCOPES.map((s) => {
                    const has = !suspended && m.scopes.includes(s);
                    return (
                      <td key={s} className="p-5 align-top">
                        <span
                          className={`inline-flex items-center gap-2 ${
                            has ? "text-teal-800" : "text-ink-600"
                          }`}
                        >
                          <span aria-hidden className="text-xl">
                            {has ? "●" : "○"}
                          </span>
                          {has ? "Görebiliyor" : "Göremiyor"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {SCOPES.map((s) => (
          <div
            key={s}
            className="rounded-lg border border-ink-200 bg-white p-6"
          >
            <p className="mb-2 font-semibold text-teal-800">{SCOPE_LABEL[s]}</p>
            <p className="text-base text-ink-700">{SCOPE_DESCRIPTION[s]}</p>
          </div>
        ))}
      </section>

      {isOwner ? (
        <Notice title="Erişimi durdurmak silmek değildir">
          <p>
            Bir kişinin erişimini durdurduğunuzda hesabı silinmez, askıya
            alınır. İstediğiniz zaman yeniden açabilirsiniz — aile ilişkileri
            geri döner, silme geri dönmez.
          </p>
          <p className="text-ink-600">
            Bu prototipte yetki değiştirme düğmeleri henüz bağlanmadı.
          </p>
        </Notice>
      ) : (
        <Notice title="Bu sayfayı neden değiştiremiyorsunuz?">
          <p>
            Yetkileri yalnızca {consultant.name} belirleyebilir. Erişiminizin
            genişletilmesini istiyorsanız kendisiyle konuşmanız gerekir.
          </p>
        </Notice>
      )}

      {/* Erişim kaydı — sektörde neredeyse hiç yok, en ucuz güven aracı */}
      <section className="rounded-xl border border-ink-200 bg-white p-7">
        <h2 className="mb-2 text-2xl">Erişim kaydı</h2>
        <p className="mb-6 text-ink-600">
          Kim, ne zaman, hangi bölümü açtı. Bu kayıt {consultant.name} ve
          birincil bakım verene görünür.
        </p>
        <ul className="space-y-3">
          {log.map((entry) => {
            const who = byId.get(entry.memberId);
            return (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink-100 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-ink-900">
                  <strong className="font-semibold">
                    {who?.name ?? "Bilinmeyen"}
                  </strong>{" "}
                  <span className="text-ink-600">{entry.section}</span>
                </span>
                <span className="text-base text-ink-600">
                  {new Date(entry.at).toLocaleString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
