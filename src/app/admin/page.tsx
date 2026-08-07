import type { Metadata } from "next";
import { listConversations } from "@/data/conversations";
import { listExperts } from "@/data/experts";
import { getConsultant, listFamily } from "@/data/household";
import { DEMO_CONSULTANT, isAdmin } from "@/data/session";
import { Card, Container, DemoNotice, Notice } from "@/components/ui";
import { adminLogin, adminLogout, viewAsExpert, viewAsMember } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = {
  birey: "Panelin sahibi",
  "bakim-veren": "Süreci yürüten",
  "aile-uyesi": "Aile üyesi",
} as const;

export default async function AdminSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authed = await isAdmin();
  const sp = await searchParams;
  const failed = sp.hata === "1";

  if (!authed) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper-warm px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-8 shadow-[var(--shadow-card)]">
          <p className="mb-2 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
            Test / admin
          </p>
          <h1 className="mb-6 text-2xl" id="admin-parola-baslik">
            Devam etmek için parola
          </h1>

          <form action={adminLogin} className="space-y-4">
            <input
              type="password"
              name="parola"
              aria-labelledby="admin-parola-baslik"
              autoComplete="current-password"
              required
              autoFocus
              className="min-h-[3.25rem] w-full rounded-xl border-2 border-ink-200 bg-white px-4 text-lg text-ink-900 focus:border-teal-600"
            />
            {failed && (
              <p className="text-base font-semibold text-danger-700">
                Parola yanlış.
              </p>
            )}
            <button
              type="submit"
              className="min-h-[3.25rem] w-full rounded-xl bg-teal-700 px-7 text-lg font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 active:scale-[0.98]"
            >
              Giriş yapın
            </button>
          </form>

          <p className="mt-6 text-base text-ink-500">
            Bu kapı yalnızca ekip içi test içindir; gerçek kullanıcı
            kimlik doğrulaması değildir.
          </p>
        </div>
      </div>
    );
  }

  // Admin/test paneli tohum verisindeki örnek haneyi gösterir; gerçek
  // hesaplar kendi panellerinden girer (bkz. data/session.ts).
  const [family, experts, conversations, consultant] = await Promise.all([
    listFamily(DEMO_CONSULTANT),
    listExperts(),
    listConversations(),
    getConsultant(DEMO_CONSULTANT),
  ]);

  const open = conversations.filter((c) => c.status !== "tamamlandi").length;

  return (
    <div className="bg-paper-warm py-12 sm:py-16">
      <Container width="wide">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
              Test / admin
            </p>
            <h1 className="text-3xl sm:text-4xl">Genel bakış</h1>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="min-h-[3rem] rounded-xl border-2 border-ink-300 bg-white px-5 text-base font-semibold text-ink-800 hover:-translate-y-px hover:bg-white/70"
            >
              Kapatın
            </button>
          </form>
        </div>

        <div className="mb-8">
          <DemoNotice>
            Bu, ekip içi test için geçici bir kapı. Aşağıdaki linkler
            danışan ve uzman panellerine, o kişi gibi bakmanızı sağlar —
            gerçek bir hesaba giriş değildir. Kapatmak için bu sayfadan
            &quot;Kapatın&quot;a basın veya ADMIN_PASSWORD ortam
            değişkenini kaldırın.
          </DemoNotice>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-4">
          {[
            { t: "Danışan", v: 1 },
            { t: "Uzman", v: experts.length },
            { t: "Açık danışma dosyası", v: open },
            { t: "Toplam danışma dosyası", v: conversations.length },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]"
            >
              <p className="text-base text-ink-600">{s.t}</p>
              <p className="font-[family-name:var(--font-display)] text-4xl text-ink-900">
                {s.v}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 text-2xl">
              Danışan tarafı — {consultant.name}
            </h2>
            <p className="mb-5 text-ink-600">
              Bir aile üyesi seçip o kişinin gözünden panele bakın.
            </p>
            <ul className="space-y-3">
              {family.map((m) => (
                <li key={m.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink-900">
                          {m.name}{" "}
                          <span className="font-normal text-ink-600">
                            {m.relation}
                          </span>
                        </p>
                        <p className="text-base text-teal-800">
                          {ROLE_LABEL[m.relationRole]}
                          {m.payer && " · Ödemeyi bu kişi yapıyor"}
                          {m.status === "askida" && " · Erişimi askıda"}
                        </p>
                      </div>
                      <form action={viewAsMember}>
                        <input type="hidden" name="uye" value={m.id} />
                        <button
                          type="submit"
                          className="min-h-[2.75rem] rounded-lg border-2 border-teal-700 px-4 text-base font-semibold text-teal-800 hover:bg-teal-50"
                        >
                          Bu kişi gibi bakın
                        </button>
                      </form>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl">Uzman tarafı</h2>
            <p className="mb-5 text-ink-600">
              Bir uzman seçip o kişinin gözünden uzman paneline bakın.
            </p>
            <ul className="max-h-[36rem] space-y-3 overflow-y-auto pr-1">
              {experts.map((e) => (
                <li key={e.id}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink-900">{e.name}</p>
                        <p className="text-base text-ink-600">
                          {e.field} · {e.city}
                        </p>
                      </div>
                      <form action={viewAsExpert}>
                        <input type="hidden" name="uzman" value={e.id} />
                        <button
                          type="submit"
                          className="min-h-[2.75rem] rounded-lg border-2 border-teal-700 px-4 text-base font-semibold text-teal-800 hover:bg-teal-50"
                        >
                          Bu uzman gibi bakın
                        </button>
                      </form>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-10">
          <Notice title="Henüz burada olmayanlar">
            <p>
              Görüntülü görüşme linki uzman panelinden danışma dosyasına
              eklenir. Değerlendirme/form ataması (hedefler, egzersizler,
              test atamaları) için veritabanı temeli kuruldu ama arayüzü
              henüz yok — ölçek kaynağı (kendi sisteminiz mi, lisanslı
              ölçekler mi) netleşince eklenecek.
            </p>
          </Notice>
        </div>
      </Container>
    </div>
  );
}
