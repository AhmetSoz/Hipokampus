import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandPath } from "@/components/BrandPath";
import { AvailabilityTag, VerifiedBadge } from "@/components/ExpertCard";
import { NeedIcon } from "@/components/NeedIcon";
import { ButtonLink, Container, DemoNotice, Notice } from "@/components/ui";
import {
  getExpert,
  listExpertSlugs,
  RESPONSE_COMMITMENT,
} from "@/data/experts";
import { needArea } from "@/data/needs";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await listExpertSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const expert = await getExpert(slug);
  if (!expert) return { title: "Uzman bulunamadı" };
  return {
    title: `${expert.name} — ${expert.field}`,
    description: `${expert.field} · ${expert.city}. Çalıştığı konular: ${expert.specialties.join(", ")}.`,
  };
}

export default async function UzmanProfiliSayfasi({ params }: Props) {
  const { slug } = await params;
  const expert = await getExpert(slug);
  if (!expert) notFound();

  const verified = new Date(expert.verifiedAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="relative isolate overflow-hidden bg-linear-to-b from-sky-50 to-paper py-12 sm:py-16">
      <BrandPath className="absolute inset-0 h-full w-full opacity-50" />
      <Container className="relative">
        <Link
          href="/uzmanlar"
          className="mb-8 inline-flex items-center gap-2 text-teal-800 underline underline-offset-4"
        >
          ← Tüm uzmanlar
        </Link>

        <div className="mb-8">
          <DemoNotice>
            Bu profil temsilîdir. Gerçek bir kişiye ait değildir.
          </DemoNotice>
        </div>

        <header className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9">
          <h1 className="mb-2 text-4xl sm:text-5xl">{expert.name}</h1>
          <p className="mb-6 text-xl text-ink-600">
            {expert.field} · {expert.city}
          </p>
          <VerifiedBadge />

          <dl className="mt-7 grid gap-x-8 gap-y-5 border-t border-ink-100 pt-7 sm:grid-cols-3">
            <div>
              <dt className="text-base text-ink-500">Müsaitlik</dt>
              <dd className="mt-1">
                <AvailabilityTag expert={expert} />
              </dd>
            </div>
            <div>
              <dt className="text-base text-ink-500">Doğrulama</dt>
              <dd className="text-xl text-ink-900">{verified}</dd>
            </div>
            <div>
              <dt className="text-base text-ink-500">Görüşme dili</dt>
              <dd className="text-xl text-ink-900">
                {expert.languages.join(", ")}
              </dd>
            </div>
          </dl>
        </header>

        <section className="mt-8 rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9">
          <h2 className="mb-2 text-2xl">Neyin üzerine çalışıyor</h2>
          <p className="mb-6 text-ink-600">
            Bu profilde deneyim yılı, yanıt hızı veya puan yer almaz. Doğrulama
            sürecini geçen herkes bu iş için yeterlidir; önemli olan konunuzun
            burada olup olmadığıdır.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {expert.specialties.map((s) => (
              <li
                key={s}
                className="flex gap-3 rounded-xl border border-ink-200 bg-paper-warm p-5 text-ink-800 shadow-[var(--shadow-soft)]"
              >
                <span
                  aria-hidden
                  className="mt-2.5 size-2 shrink-0 rounded-full bg-sky-500"
                />
                <span className="text-lg">{s}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9">
          <h2 className="mb-4 text-2xl">Kendi ifadesiyle</h2>
          <p className="text-lg text-ink-700">{expert.about}</p>
        </section>

        <section className="mt-8 rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9">
          <h2 className="mb-2 text-2xl">Çalıştığı konular</h2>
          <p className="mb-6 text-ink-600">
            İhtiyaç formunda seçtiğiniz başlıklarla eşleşen konular.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {expert.needAreas.map((id) => {
              const area = needArea(id);
              return (
                <li
                  key={id}
                  className="flex gap-4 rounded-xl border border-ink-200 bg-paper-warm p-5 shadow-[var(--shadow-soft)]"
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-teal-700"
                  >
                    <NeedIcon area={id} className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-teal-800">
                      {area.label}
                    </span>
                    <span className="block text-base text-ink-600">
                      {area.hint}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="mt-8 rounded-2xl border-2 border-teal-300 bg-teal-50 p-7 shadow-[var(--shadow-soft)] sm:p-9">
          <h2 className="mb-3 text-2xl">Görüşme nasıl işler?</h2>
          <p className="mb-4 text-ink-700">
            Görüşmeler site üzerinden <strong>yazışarak</strong> yapılır;
            görüntülü görüşme yoktur. Görüşmenin sonunda size maddeler hâlinde
            yazılı bir danışmanlık planı iletilir. Görüşme kaydı alınmaz.
          </p>
          <p className="mb-6 text-ink-700">
            Yanıt taahhüdü uzmana göre değişmez:{" "}
            <strong>
              {RESPONSE_COMMITMENT.toLocaleLowerCase("tr")} yanıt alırsınız.
            </strong>
          </p>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href={`/basvuru/${expert.slug}`} withArrow>
              {expert.name} ile başlayın
            </ButtonLink>
            <ButtonLink href="/ihtiyac-formu" variant="secondary">
              Önce ihtiyacınızı netleştirin
            </ButtonLink>
          </div>
          <p className="mt-6 text-base text-ink-600">
            Başvuru için bir hesabınız olması gerekir. Hipokampüs geliştirme
            aşamasındadır; buraya gerçek sağlık bilgisi girmeyin.
          </p>
        </div>

        <div className="mt-8">
          <Notice>
            <p>
              Hipokampüs bir sağlık kuruluşu değildir; tanı koymaz, tedavi
              uygulamaz. Acil bir durumda{" "}
              <strong className="text-ink-900">112&apos;yi arayın.</strong>
            </p>
          </Notice>
        </div>
      </Container>
    </div>
  );
}
