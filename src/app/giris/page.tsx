import type { Metadata } from "next";
import { Container, DemoNotice, Notice } from "@/components/ui";
import { getConsultant } from "@/data/household";
import { listDemoMembers } from "@/data/session";
import { SCOPE_LABEL } from "@/data/types";
import { selectDemoMember } from "./actions";

export const metadata: Metadata = {
  title: "Panele giriş",
  description: "Hipokampüs demo paneline giriş.",
};

const ROLE_LABEL = {
  birey: "Panelin sahibi",
  "bakim-veren": "Birincil bakım veren",
  "aile-uyesi": "Aile üyesi",
} as const;

export default async function GirisSayfasi() {
  const [members, consultant] = await Promise.all([
    listDemoMembers(),
    getConsultant(),
  ]);

  return (
    <div className="bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
      <Container>
        <h1 className="mb-4 text-4xl sm:text-5xl">Panele giriş</h1>
        <p className="mb-8 max-w-2xl text-xl text-ink-700">
          Hipokampüs geliştirme aşamasındadır ve <strong>kayıt kapalıdır</strong>.
          Paneli, {consultant.name} ailesinin örnek kaydı üzerinden
          inceleyebilirsiniz.
        </p>

        <div className="mb-8">
          <DemoNotice>
            Parola sorulmuyor, hesap açılmıyor, hiçbir kişisel veri toplanmıyor.
            Yalnızca hangi kişinin gözünden bakacağınızı seçiyorsunuz.
          </DemoNotice>
        </div>

        <form action={selectDemoMember}>
          <fieldset>
            <legend className="mb-2 text-2xl text-ink-900">
              Kimin gözünden bakmak istersiniz?
            </legend>
            <p className="mb-6 text-ink-600">
              Her kişi farklı şeyler görür. Aradaki farkı görmek için birden
              fazlasını deneyin.
            </p>

            <div className="grid gap-4">
              {members.map((m, i) => {
                const suspended = m.status === "askida";
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-6 transition-colors ${
                      suspended
                        ? "border-ink-200 bg-ink-100"
                        : "border-ink-200 bg-white hover:border-teal-400"
                    } has-checked:border-teal-700 has-checked:bg-teal-50`}
                  >
                    <input
                      type="radio"
                      name="uye"
                      value={m.id}
                      defaultChecked={i === 1}
                      className="mt-1.5 size-5 shrink-0 accent-teal-700"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className="text-xl font-semibold text-ink-900">
                          {m.name}
                        </span>
                        <span className="text-ink-600">{m.relation}</span>
                      </span>
                      <span className="mt-1 block text-base text-teal-800">
                        {ROLE_LABEL[m.relationRole]}
                        {m.payer && " · Ödemeyi bu kişi yapıyor"}
                      </span>

                      {suspended ? (
                        <span className="mt-3 block text-base text-ink-600">
                          Erişimi askıya alınmış — panelde hiçbir bölümü göremez.
                        </span>
                      ) : (
                        <span className="mt-3 flex flex-wrap gap-2">
                          {m.scopes.map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-sand-100 px-3 py-1 text-base text-ink-700"
                            >
                              {SCOPE_LABEL[s]}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-8 min-h-[3.5rem] w-full rounded-lg bg-teal-700 px-7 text-lg font-semibold text-white transition-colors hover:bg-teal-800 sm:w-auto"
          >
            Panele girin
          </button>
        </form>

        <div className="mt-12">
          <Notice tone="teal" title="Neden herkes aynı şeyi görmüyor?">
            <p>
              Hipokampüs&apos;te <strong>ödeme yapmak, sağlık ve görüşme
              verisini görme hakkı vermez.</strong> Bu iki şey ayrı tutulur.
              Mehmet Bey ödemeyi yapıyor ama bakım planını ve uzman
              görüşmelerini göremiyor — çünkü bu yetkiyi yalnızca Fatma Hanım
              verebilir.
            </p>
          </Notice>
        </div>
      </Container>
    </div>
  );
}
