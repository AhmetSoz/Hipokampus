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

function Avatar({ name, muted }: { name: string; muted: boolean }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className={`flex size-14 shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-xl text-white shadow-[var(--shadow-soft)] ${
        muted
          ? "bg-ink-300"
          : "bg-linear-to-br from-teal-600 to-teal-800"
      }`}
    >
      {initials}
    </span>
  );
}

export default async function GirisSayfasi() {
  const [members, consultant] = await Promise.all([
    listDemoMembers(),
    getConsultant(),
  ]);

  return (
    <div className="hk-atmosphere bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
      <Container>
        <p className="hk-enter mb-4 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
          Demo panel
        </p>
        <h1 className="hk-enter mb-4 text-4xl sm:text-5xl" style={{ animationDelay: "60ms" }}>
          Anlatmak yerine gösterelim
        </h1>
        <p
          className="hk-enter mb-8 max-w-2xl text-xl text-ink-700"
          style={{ animationDelay: "120ms" }}
        >
          Kayıt kapalı. Paneli, {consultant.name} ailesinin örnek kaydı
          üzerinden hemen inceleyebilirsiniz.
        </p>

        <div className="hk-enter mb-8" style={{ animationDelay: "160ms" }}>
          <DemoNotice>
            Parola sorulmuyor, hesap açılmıyor, hiçbir kişisel veri toplanmıyor.
            Yalnızca hangi kişinin gözünden bakacağınızı seçiyorsunuz.
          </DemoNotice>
        </div>

        <form
          action={selectDemoMember}
          className="hk-enter"
          style={{ animationDelay: "220ms" }}
        >
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
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-6 shadow-[var(--shadow-soft)] ${
                      suspended
                        ? "border-ink-200 bg-ink-100"
                        : "border-ink-200 bg-white hover:-translate-y-px hover:border-teal-300 hover:shadow-[var(--shadow-card)]"
                    } has-checked:border-teal-700 has-checked:bg-teal-50 has-checked:shadow-[var(--shadow-card)]`}
                  >
                    <input
                      type="radio"
                      name="uye"
                      value={m.id}
                      defaultChecked={i === 1}
                      className="peer sr-only"
                    />
                    <Avatar name={m.name} muted={suspended} />
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
                              className="rounded-md bg-sky-100 px-3 py-1 text-base text-ink-700"
                            >
                              {SCOPE_LABEL[s]}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-ink-300 text-white peer-checked:border-teal-700 peer-checked:bg-teal-700"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        className="hidden peer-checked:block"
                      >
                        <path
                          d="M2.5 7.2 5.5 10l6-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-8 min-h-[3.5rem] w-full rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.98] sm:w-auto"
          >
            Panele girin
          </button>
        </form>

        <div className="hk-enter mt-12" style={{ animationDelay: "280ms" }}>
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
