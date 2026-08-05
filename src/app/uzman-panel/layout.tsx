import Link from "next/link";
import { DemoNotice } from "@/components/ui";
import { getExpertById } from "@/data/experts";

/**
 * Uzman paneli.
 *
 * Prototipte sabit bir demo uzman olarak açılıyor (Elif Tanyeri). Danışan
 * tarafındaki gibi kişi seçimi yok — uzman tarafı tek bir görünüm.
 */
export default async function UzmanPanelLayout({
  children,
}: LayoutProps<"/uzman-panel">) {
  const expert = await getExpertById("u1");

  const nav = [
    { href: "/uzman-panel", label: "Genel bakış" },
    { href: "/uzman-panel/danisanlar", label: "Danışanlarım" },
  ];

  return (
    <div className="bg-paper-warm">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
        <div className="mb-6">
          <DemoNotice>
            Uzman panelinin temsilî görünümü. Gerçek bir uzmana ait değildir.
          </DemoNotice>
        </div>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-ink-200 bg-white p-6">
          <div>
            <p className="text-base text-ink-500">Uzman paneli</p>
            <p className="text-2xl text-ink-900">{expert?.name}</p>
            <p className="mt-1 text-ink-600">
              {expert?.field} · {expert?.city}
            </p>
          </div>
          <Link
            href="/panel"
            className="min-h-[2.75rem] text-base text-teal-800 underline underline-offset-4"
          >
            Danışan tarafına geçin
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
          <nav aria-label="Uzman paneli bölümleri">
            <ul className="space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-[3.5rem] items-center rounded-lg border border-ink-200 bg-white px-5 py-4 text-ink-800 transition-colors hover:border-teal-400 hover:bg-teal-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
