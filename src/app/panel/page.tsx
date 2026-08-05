import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice, Notice } from "@/components/ui";
import { getConsultant, listPlanItems } from "@/data/household";
import { getExpertById } from "@/data/experts";
import { needArea } from "@/data/needs";
import { getCurrentMember } from "@/data/session";

export const metadata: Metadata = { title: "Genel bakış" };

export default async function PanelGenelBakis() {
  const [member, consultant, plan] = await Promise.all([
    getCurrentMember(),
    getConsultant(),
    listPlanItems(),
  ]);

  const canSeeHealth = member.scopes.includes("saglik-gorusme");
  const expert = await getExpertById("u1");
  const open = plan.filter((p) => p.status !== "tamamlandi");
  const done = plan.length - open.length;

  return (
    <div className="space-y-8">
      <DemoNotice>
        Bu panel {consultant.name} ailesinin temsilî kaydıdır. Gerçek bir kişiye
        ait değildir.
      </DemoNotice>

      <div>
        <h1 className="mb-2 text-3xl sm:text-4xl">
          Merhaba {member.name.split(" ")[0]}
        </h1>
        <p className="text-lg text-ink-700">
          {canSeeHealth
            ? `${consultant.name} için hazırlanan bakım planında ${open.length} madde bekliyor.`
            : `${consultant.name} için bir bakım süreci yürüyor. Sağlık ve görüşme bilgilerine erişiminiz bulunmuyor.`}
        </p>
      </div>

      {canSeeHealth ? (
        <>
          <section className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-7">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-2xl">Sıradaki adımlar</h2>
              <Link
                href="/panel/plan"
                className="text-teal-800 underline underline-offset-4"
              >
                Planın tamamı
              </Link>
            </div>

            <p className="mb-6 text-ink-600">
              {plan.length} maddeden {done} tanesi tamamlandı.
            </p>

            <ul className="space-y-4">
              {open.slice(0, 3).map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-ink-200 bg-paper-warm p-5 shadow-[var(--shadow-soft)]"
                >
                  <p className="mb-1 text-lg font-semibold text-ink-900">
                    {item.title}
                  </p>
                  <p className="text-base text-ink-600">
                    {needArea(item.needArea).label}
                    {item.status === "surüyor" && " · sürüyor"}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {expert && (
            <section className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-7">
              <h2 className="mb-4 text-2xl">Görüştüğünüz uzman</h2>
              <p className="text-lg text-ink-900">{expert.name}</p>
              <p className="mb-4 text-ink-600">
                {expert.field} · {expert.city}
              </p>
              <Link
                href="/panel/mesajlar"
                className="inline-flex min-h-[3.25rem] items-center rounded-xl border-2 border-teal-700 px-6 font-semibold text-teal-800 hover:-translate-y-px hover:bg-teal-50 hover:shadow-[var(--shadow-card)] active:scale-[0.97]"
              >
                Danışma dosyasını açın
              </Link>
            </section>
          )}
        </>
      ) : (
        <Notice tone="teal" title="Bu bölümü göremiyorsunuz">
          <p>
            Sağlık ve görüşme bilgilerine erişiminiz bulunmuyor. Bu yetkiyi
            yalnızca {consultant.name} verebilir.
          </p>
          <p>
            {member.payer &&
              "Ödemeyi siz yapıyorsunuz; ödeme yapmak sağlık ve görüşme verisini görme hakkı vermez."}
          </p>
        </Notice>
      )}

      <section className="rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-7">
        <h2 className="mb-4 text-2xl">Erişiminiz</h2>
        <p className="mb-5 text-ink-700">
          Panelde neyi görüp neyi göremediğinizi ve bunu kimin belirlediğini
          erişim sayfasından inceleyebilirsiniz.
        </p>
        <Link
          href="/panel/erisim"
          className="inline-flex min-h-[3.25rem] items-center rounded-xl border-2 border-teal-700 px-6 font-semibold text-teal-800 hover:-translate-y-px hover:bg-teal-50 hover:shadow-[var(--shadow-card)] active:scale-[0.97]"
        >
          Erişim ve izinler
        </Link>
      </section>

      <Notice>
        <p>
          Hipokampüs bir sağlık kuruluşu değildir; tanı koymaz, tedavi uygulamaz,
          acil müdahale sunmaz. Acil bir durumda{" "}
          <strong className="text-ink-900">112&apos;yi arayın.</strong>
        </p>
      </Notice>
    </div>
  );
}
