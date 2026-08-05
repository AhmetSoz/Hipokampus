import type { Metadata } from "next";
import { ExpertApplicationForm } from "@/components/ExpertApplicationForm";
import { Card, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Uzman ön başvurusu",
  description:
    "Gerontolog ve ilgili alanlardaki uzmanlar için ön başvuru. Hipokampüs " +
    "uzman ve akademisyenlerin katkısıyla geliştiriliyor.",
};

export default function UzmanBasvurusuSayfasi() {
  return (
    <div className="hk-atmosphere bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
      <Container>
        <Eyebrow>Uzmanlar için</Eyebrow>
        <h1 className="hk-enter mb-5 text-4xl sm:text-5xl">
          Uzman ön başvurusu
        </h1>
        <p
          className="hk-enter mb-10 max-w-2xl text-xl text-ink-700"
          style={{ animationDelay: "70ms" }}
        >
          Hipokampüs&apos;ü uzman ve akademisyenlerin katkısıyla geliştiriyoruz.
          Platformun nasıl kurulacağına dair kararlar hâlâ alınıyor; bu süreçte
          yanımızda olmak isterseniz ön başvurunuzu bırakabilirsiniz.
        </p>

        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              t: "Kendi takviminiz",
              d: "Görüşmeye ne zaman açık olacağınıza siz karar verirsiniz.",
            },
            {
              t: "Sıralama satılmaz",
              d: "Hiçbir uzman ücret ödeyerek listede üste çıkamaz.",
            },
            {
              t: "Puanınız gizli kalır",
              d: "Adli sicil durumu ve değerlendirme puanı kamuya gösterilmez.",
            },
          ].map((item) => (
            <Card key={item.t} className="p-6">
              <p className="mb-1 font-semibold text-teal-800">{item.t}</p>
              <p className="text-base text-ink-700">{item.d}</p>
            </Card>
          ))}
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)] sm:p-10">
          <ExpertApplicationForm />
        </div>
      </Container>
    </div>
  );
}
