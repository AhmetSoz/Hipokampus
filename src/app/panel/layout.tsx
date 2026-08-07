import Link from "next/link";
import { clearDemoMember } from "@/app/giris/actions";
import { BrandPath } from "@/components/BrandPath";
import { PanelNav } from "@/components/PanelNav";
import { YardimPaneli } from "@/components/YardimPaneli";
import { listAssignmentsForConsultant } from "@/data/assessments";
import { listConversationsForConsultant } from "@/data/conversations";
import { getConsultant } from "@/data/household";
import {
  getCurrentConsultantId,
  getCurrentMember,
  getCurrentUser,
} from "@/data/session";

export default async function PanelLayout({
  children,
}: LayoutProps<"/panel">) {
  const consultantId = await getCurrentConsultantId();
  const [member, consultant, user] = await Promise.all([
    getCurrentMember(),
    getConsultant(consultantId),
    getCurrentUser(),
  ]);
  const demoMode = user?.consultantId == null;

  /* Menü rozetleri: bekleyen iş sayısı menüden görünsün ki kullanıcı
     hangi bölüme gitmesi gerektiğini aramasın. */
  const gorebilir = member.scopes.includes("saglik-gorusme");
  const [dosyalar, formlar] = gorebilir
    ? await Promise.all([
        listConversationsForConsultant(consultantId),
        listAssignmentsForConsultant(consultantId),
      ])
    : [[], []];
  const bekleyenMesaj = dosyalar.filter((c) => c.status !== "tamamlandi").length;
  const bekleyenForm = formlar.filter((f) => f.status === "atandi").length;

  /* Askıya alınmış üye hiçbir bölümü göremez. Silinmediği için hesabı
     duruyor; erişimi geri açma yetkisi yalnızca bireyde. */
  if (member.status === "askida") {
    return (
      <div className="bg-paper-warm py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-2xl border-2 border-ink-300 bg-paper-warm p-8 shadow-[var(--shadow-soft)] sm:p-10">
            <h1 className="mb-4 text-3xl">Erişiminiz şu anda askıda</h1>
            <p className="mb-4 text-lg text-ink-800">
              {consultant.name}, bu panele erişiminizi geçici olarak durdurdu.
              Hesabınız silinmedi; erişim yeniden açıldığında kaldığınız yerden
              devam edebilirsiniz.
            </p>
            <p className="mb-8 text-ink-700">
              Erişimi yalnızca {consultant.name} yeniden açabilir.
            </p>
            <Link
              href="/giris"
              className="inline-flex min-h-[3.25rem] items-center rounded-xl border-2 border-ink-300 bg-white px-7 text-lg font-semibold text-ink-800 hover:-translate-y-px hover:bg-white/70 active:scale-[0.97]"
            >
              Başka bir kişiyle bakın
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    /* Yardım paneli BU KAPSAYICININ DIŞINDA duruyor: `isolate` yeni bir
       yığın bağlamı yaratıyor ve içerideki sabit konumlu panel, kök
       seviyedeki yapışkan site başlığının altında kalıyordu. */
    <>
    <div className="relative isolate overflow-hidden bg-paper-warm">
      {/* Marka dili panelde de sürüyor — burada çok daha soluk, çünkü
          panel bir çalışma alanı; ağ dikkat çekmemeli. */}
      {/* Tüm yüksekliği kaplıyor: uzun panel sayfalarında ağ yarıda
          kesilip zemin boşalıyordu. */}
      <BrandPath
        soften={false}
        className="absolute inset-0 h-full w-full opacity-25"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)]">
          <div>
            <p className="text-base text-ink-500">Panel sahibi</p>
            <p className="text-2xl text-ink-900">{consultant.name}</p>
            <p className="mt-1 text-ink-600">
              {consultant.city} · {new Date().getFullYear() - consultant.birthYear} yaşında
            </p>
          </div>
          <div className="text-right">
            <p className="text-base text-ink-500">Şu anda bakan kişi</p>
            <p className="text-xl text-ink-900">{member.name}</p>
            <p className="text-base text-ink-600">{member.relation}</p>
            {/* Kişi değiştirme yalnızca demo hanede anlamlı — gerçek
                hesapta kullanıcı kendisidir. */}
            {demoMode && (
              <form action={clearDemoMember}>
                <button
                  type="submit"
                  className="mt-2 min-h-[2.75rem] text-base text-teal-800 underline underline-offset-4"
                >
                  Başka kişiyle bakın
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <PanelNav
            member={member}
            bekleyenMesaj={bekleyenMesaj}
            bekleyenForm={bekleyenForm}
          />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>

    <YardimPaneli rol="danisan" />
    </>
  );
}
