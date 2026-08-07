import Link from "next/link";
import { BrandPath } from "@/components/BrandPath";
import { MesajKutusu } from "@/components/MesajKutusu";
import { DemoNotice } from "@/components/ui";
import { YardimPaneli } from "@/components/YardimPaneli";
import { listConversationsForExpert } from "@/data/conversations";
import { getConsultant } from "@/data/household";
import { getCurrentExpert, getCurrentUser } from "@/data/session";

/**
 * Uzman paneli.
 *
 * Gerçek hesapla girilmişse kimlik oturumdan gelir. Giriş yoksa panel
 * hâlâ demo/admin çerezleriyle çalışır (`hk-demo-uzman`, varsayılan Elif
 * Tanyeri) — ekip içi test aracı bozulmasın diye.
 *
 * "Temsilî görünüm" uyarısı ve "danışan tarafına geçin" kısayolu YALNIZCA
 * demo modunda gösterilir: gerçek hesapla giren bir uzmana "bu sizin
 * hesabınız değil" demek yanlış olur, danışan paneline geçmek de o hesap
 * için anlamsızdır (kendi hanesi yok).
 */
export default async function UzmanPanelLayout({
  children,
}: LayoutProps<"/uzman-panel">) {
  const [expert, user] = await Promise.all([
    getCurrentExpert(),
    getCurrentUser(),
  ]);
  const demoMode = user?.expertId == null;

  /* Yüzen mesaj kutusu için: karşı taraf danışan olduğundan hane adını
     çözüyoruz. */
  const dosyalar = await listConversationsForExpert(expert.id);
  const kutuDosyalari = await Promise.all(
    dosyalar.map(async (c) => ({
      id: c.id,
      subject: c.subject,
      karsiTaraf: (await getConsultant(c.consultantId)).name,
      durum: c.status,
      messages: c.messages.map((m) => ({
        id: m.id,
        author: m.author,
        authorName: m.authorName,
        body: m.body,
        sentAt: m.sentAt,
      })),
    })),
  );

  const nav = [
    {
      href: "/uzman-panel",
      label: "Genel bakış",
      hint: "Yanıt bekleyenler ve özet",
    },
    {
      href: "/uzman-panel/danisanlar",
      label: "Danışanlarım",
      hint: "Kişiler ve açık dosyalar",
    },
  ];

  return (
    /* Yardım paneli kapsayıcının DIŞINDA — bkz. danışan layout'undaki
       aynı not: `isolate` yığın bağlamı yaratıyor. */
    <>
    <div className="relative isolate overflow-hidden bg-paper-warm">
      {/* Danışan panelindeki gibi çok soluk — çalışma alanı, vitrin değil. */}
      {/* Danışan panelindeki gibi tam yükseklik — bkz. oradaki not. */}
      <BrandPath
        soften={false}
        className="absolute inset-0 h-full w-full opacity-25"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
        {demoMode && (
          <div className="mb-6">
            <DemoNotice>
              Uzman panelinin temsilî görünümü. Gerçek bir uzmana ait değildir.
            </DemoNotice>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] p-6">
          <div>
            <p className="text-base text-ink-500">Uzman paneli</p>
            <p className="text-2xl text-ink-900">{expert?.name}</p>
            <p className="mt-1 text-ink-600">
              {expert?.field} · {expert?.city}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {demoMode && (
              <Link
                href="/panel"
                className="min-h-[2.75rem] text-base text-teal-800 underline underline-offset-4"
              >
                Danışan tarafına geçin
              </Link>
            )}
            <YardimPaneli rol="uzman" />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <nav aria-label="Uzman paneli bölümleri">
            <ul className="space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[3.5rem] items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-5 py-4 text-ink-800 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-px hover:border-teal-300 hover:bg-teal-50"
                  >
                    <span>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="block text-base text-ink-600">
                        {item.hint}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>

    <MesajKutusu
      viewer="uzman"
      dosyalar={kutuDosyalari}
      tumMesajlarHref="/uzman-panel/danisanlar"
    />
    </>
  );
}
