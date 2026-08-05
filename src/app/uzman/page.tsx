import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Notice,
  Section,
  StepCard,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Bizimle çalışın",
  description:
    "Gerontolog ve ilgili alanlardaki uzmanlar için: Hipokampüs'te nasıl " +
    "çalışılır, ne gösterilir, ne gösterilmez.",
};

export default function UzmanTanitimSayfasi() {
  return (
    <>
      <div className="bg-linear-to-br from-teal-800 to-teal-900 py-16 text-teal-50 sm:py-24">
        <Container width="wide">
          <Logo
            variant="lockupReverse"
            decorative
            className="hk-enter mb-8 h-16 sm:h-20"
          />
          <Eyebrow tone="onDark">Uzmanlar için</Eyebrow>
          <h1
            className="hk-enter mb-6 max-w-3xl text-4xl text-white sm:text-6xl"
            style={{ animationDelay: "70ms" }}
          >
            Danışanla aranıza kimse girmesin
          </h1>
          <p
            className="hk-enter max-w-2xl text-xl text-teal-100"
            style={{ animationDelay: "140ms" }}
          >
            Ücretinizi ve takviminizi siz belirlersiniz; sıralamada yerinizi
            kimse satın alamaz.
          </p>
          <div
            className="hk-enter mt-10 flex flex-wrap gap-4"
            style={{ animationDelay: "210ms" }}
          >
            <ButtonLink href="/uzman/basvuru" variant="onDark" withArrow>
              Ön başvuru yapın
            </ButtonLink>
            <ButtonLink
              href="/dogrulama"
              className="border-2 border-teal-300 bg-transparent text-white hover:-translate-y-px hover:border-white hover:bg-teal-700"
            >
              Doğrulama süreci
            </ButtonLink>
          </div>
        </Container>
      </div>

      <Section tone="paper">
        <Container width="wide">
          <Eyebrow>Nasıl işler</Eyebrow>
          <h2 className="mb-10 max-w-2xl text-3xl sm:text-4xl">
            Üç adım, sonunda yazılı bir plan
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            <StepCard step={1} title="Danışan size ulaşır">
              <p>
                En fazla üç kişilik bir öneri içinde ulaşabilir; seçimi her
                zaman danışan yapar.
              </p>
            </StepCard>

            <StepCard step={2} title="Yazışarak görüşürsünüz">
              <p>
                Görüntülü görüşme ve kayıt yok. Kendi çalışma saatlerinizde
                yanıt verirsiniz.
              </p>
            </StepCard>

            <StepCard step={3} title="Planı siz yazarsınız">
              <p>
                Çıktı, maddeler hâlinde yazılı bir plan. Neyi paylaşacağınıza
                siz karar verirsiniz.
              </p>
            </StepCard>
          </div>
        </Container>
      </Section>

      <Section tone="warm">
        <Container width="wide">
          <div className="grid items-start gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>Sözümüz</Eyebrow>
              <h2 className="mb-6 text-3xl sm:text-4xl">
                Neyi göstermeyeceğimizi de yazıyoruz
              </h2>
              <p className="text-ink-700">
                Bir platformun uzmana verebileceği en somut güvence, neyi
                yapmayacağını baştan söylemesidir.
              </p>
            </div>

            <ul className="grid gap-4">
              {[
                {
                  t: "Sıralamanız satılamaz",
                  d: "Ücret sıralamaya girmez; liste günlük dönüşümlüdür, kimse kalıcı olarak üstte kalmaz.",
                },
                {
                  t: "Puanınız gizli kalır",
                  d: "Adli sicil durumu ve değerlendirme puanı kamuya gösterilmez. Profilde yalnızca “doğrulama sürecini tamamladı” yazar.",
                },
                {
                  t: "Yıldız ve yorum yok",
                  d: "Danışanlar sizi beş yıldız üzerinden oylamaz, profilinizde kullanıcı yorumu yayınlanmaz.",
                },
                {
                  t: "Görüşmeniz kaydedilmez",
                  d: "Yazışmalarınızın ses veya görüntü kaydı alınmaz.",
                },
                {
                  t: "Otomatik atama yok",
                  d: "Size yapay zekâ tarafından danışan atanmaz. Öneri gösterilir, seçimi danışan yapar.",
                },
              ].map((item) => (
                <li key={item.t}>
                  <Card className="p-6">
                    <p className="mb-1 text-lg font-semibold text-ink-900">
                      {item.t}
                    </p>
                    <p className="text-base text-ink-700">{item.d}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Notice tone="teal" title="Şu anda hangi aşamadayız?">
            <p>
              Hipokampüs geliştirme aşamasındadır. Platformda henüz doğrulanmış
              uzman bulunmuyor ve başvuru toplama açılmadı. Ön başvuru formunu
              şimdiden inceleyebilirsiniz.
            </p>
          </Notice>

          <div className="mt-10">
            <ButtonLink href="/uzman/basvuru" withArrow>
              Ön başvuru formu
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
