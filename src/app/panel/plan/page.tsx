import type { Metadata } from "next";
import { Notice } from "@/components/ui";
import { getExpertById } from "@/data/experts";
import { getConsultant, listPlanItems } from "@/data/household";
import { needArea } from "@/data/needs";
import { getCurrentMember } from "@/data/session";
import type { PlanItemStatus } from "@/data/types";

export const metadata: Metadata = { title: "Bakım planı" };

const STATUS: Record<PlanItemStatus, { label: string; tone: string }> = {
  yapilacak: { label: "Yapılacak", tone: "bg-sky-200 text-ink-900" },
  surüyor: { label: "Sürüyor", tone: "bg-teal-100 text-teal-900" },
  tamamlandi: { label: "Tamamlandı", tone: "bg-teal-700 text-white" },
};

export default async function BakimPlaniSayfasi() {
  const member = await getCurrentMember();

  if (!member.scopes.includes("saglik-gorusme")) {
    return (
      <Notice tone="teal" title="Bu bölümü göremiyorsunuz">
        <p>
          Bakım planı sağlık ve görüşme kapsamındadır. Bu yetkiyi yalnızca panel
          sahibi verebilir.
        </p>
      </Notice>
    );
  }

  const [consultant, plan] = await Promise.all([
    getConsultant(),
    listPlanItems(),
  ]);
  const author = await getExpertById(plan[0]?.authorExpertId ?? "u1");

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
          Bakım planı
        </p>
        <h1 className="mb-3 text-3xl sm:text-4xl">{consultant.name}</h1>
        <p className="max-w-2xl text-lg text-ink-700">
          Bu plan, {author?.name} ile yapılan görüşmenin çıktısıdır. Yazışmanın
          içinde bir mesaj değil, ayrı ve kalıcı bir belgedir.
        </p>
      </div>

      <ol className="space-y-5">
        {plan.map((item, i) => {
          const s = STATUS[item.status];
          return (
            <li
              key={item.id}
              className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)]"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <h2 className="flex gap-4 text-xl text-ink-900">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-100 font-[family-name:var(--font-display)] text-teal-800"
                  >
                    {i + 1}
                  </span>
                  <span>{item.title}</span>
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-base font-semibold ${s.tone}`}
                >
                  {s.label}
                </span>
              </div>
              <p className="mb-4 pl-13 text-ink-700">{item.detail}</p>
              <p className="pl-13 text-base text-ink-600">
                {needArea(item.needArea).label} ·{" "}
                {new Date(item.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                })}{" "}
                tarihinde {author?.name} ekledi
              </p>
            </li>
          );
        })}
      </ol>

      <Notice title="Plan maddesi biçimi henüz standartlaşmadı">
        <p>
          Bir plan maddesinin neyi içermesi gerektiği karara bağlanmadı. Buradaki
          biçim bir öneridir; uzman görüşüyle netleşecektir.
        </p>
      </Notice>
    </div>
  );
}
