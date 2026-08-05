import type { Metadata } from "next";
import { Suspense } from "react";
import { ExpertCard } from "@/components/ExpertCard";
import { ExpertFilters } from "@/components/ExpertFilters";
import { Container, DemoNotice, Notice } from "@/components/ui";
import { listCities, listExperts, listFields } from "@/data/experts";
import { NEED_AREAS } from "@/data/needs";
import type { NeedAreaId } from "@/data/types";

export const metadata: Metadata = {
  title: "Uzmanlar",
  description:
    "Doğrulanmış gerontologlar ve ilgili alanlardaki uzmanlar. Konuya, " +
    "uzmanlık alanına ve şehre göre süzebilirsiniz.",
};

const NEED_IDS = new Set(NEED_AREAS.map((a) => a.id));

export default async function UzmanlarSayfasi({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) || undefined;

  const konu = one(sp.konu);
  const filter = {
    field: one(sp.alan),
    city: one(sp.sehir),
    needArea:
      konu && NEED_IDS.has(konu as NeedAreaId)
        ? (konu as NeedAreaId)
        : undefined,
  };

  const [experts, all, fields, cities] = await Promise.all([
    listExperts(filter),
    listExperts(),
    listFields(),
    listCities(),
  ]);

  return (
    <div className="bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
      <Container width="wide">
        <h1 className="mb-4 text-4xl sm:text-5xl">Uzmanlar</h1>
        <p className="mb-8 max-w-2xl text-xl text-ink-700">
          Doğrulama sürecini tamamlamış uzmanlar. Sıralama; müsaitlik ve deneyim
          yılına göredir, hiçbir uzman ücret ödeyerek üste çıkamaz.
        </p>

        <div className="mb-8">
          <DemoNotice />
        </div>

        <Suspense
          fallback={
            <div className="h-52 rounded-xl border border-ink-200 bg-white" />
          }
        >
          <ExpertFilters
            fields={fields}
            cities={cities}
            needAreas={NEED_AREAS}
            total={all.length}
            shown={experts.length}
          />
        </Suspense>

        {experts.length > 0 ? (
          <ul className="mt-8 grid gap-6 lg:grid-cols-2">
            {experts.map((expert) => (
              <li key={expert.id}>
                <ExpertCard expert={expert} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8">
            <Notice tone="teal" title="Bu süzmeye uyan uzman bulunamadı">
              <p>
                Konuyu veya şehri değiştirerek yeniden deneyebilirsiniz. Uzman
                kadrosu geliştirme aşamasında olduğu için liste henüz dardır.
              </p>
            </Notice>
          </div>
        )}

        <div className="mt-12">
          <Notice title="Ne gösteriyoruz, ne göstermiyoruz">
            <p>
              Profillerde deneyim yılı, yanıt süresi, doğrulama rozeti ve
              müsaitlik yer alır. <strong>Yıldız puanı ve kullanıcı yorumu
              yoktur.</strong> Adli sicil durumu ve değerlendirme puanı da
              kamuya gösterilmez.
            </p>
          </Notice>
        </div>
      </Container>
    </div>
  );
}
