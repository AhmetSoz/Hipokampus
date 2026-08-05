import type { Metadata } from "next";
import {
  ButtonLink,
  Card,
  Container,
  Eyebrow,
  Notice,
  Section,
} from "@/components/ui";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Uzman doğrulama",
  description:
    "Hipokampüs'te uzmanların nasıl doğrulandığı, kamuya neyin gösterildiği " +
    "ve neden yıldız puanı ile kullanıcı yorumu kullanılmadığı.",
};

export default function DogrulamaSayfasi() {
  return (
    <>
      <div className="hk-atmosphere bg-linear-to-b from-sky-50 to-paper py-16 sm:py-20">
        <Container>
          <h1 className="hk-enter mb-5 text-4xl sm:text-5xl">Uzman doğrulama</h1>
          <p className="hk-enter max-w-2xl text-xl text-ink-700" style={{ animationDelay: "70ms" }}>
            Kimin karşınıza çıktığı, en az ne konuştuğunuz kadar önemli.
            Doğrulamayı nasıl yaptığımızı ve neyi paylaşıp neyi paylaşmadığımızı
            açıkça yazıyoruz.
          </p>
        </Container>
      </div>

      <Section tone="paper">
        <Container>
          <Eyebrow>Süreç</Eyebrow>
          <h2 className="mb-10 text-3xl sm:text-4xl">
            Bir uzman rozete nasıl ulaşır
          </h2>

          <ol className="space-y-5">
            {[
              {
                t: "Ön başvuru",
                d: "Uzman kendi başvurusunu yapar. Davetle veya satın alınarak girilen bir liste değildir.",
              },
              {
                t: "Kimlik ve mesleki belge kontrolü",
                d: "Kimlik bilgileri ve alanına ilişkin mesleki belgeler incelenir.",
              },
              {
                t: "Adli sicil kontrolü",
                d: "Adli sicil durumu incelenir. Sonuç kamuya gösterilmez.",
              },
              {
                t: "Hipokampüs değerlendirmesi",
                d: "Alan bilgisine yönelik bir değerlendirme yapılır. Alınan puan kamuya gösterilmez.",
              },
              {
                t: "Doğrulama rozeti",
                d: "Süreci tamamlayan uzmanın profilinde yalnızca tek bir ifade yer alır: “Hipokampüs doğrulama sürecini tamamladı.”",
              },
            ].map((item, i) => (
              <li key={item.t}>
                <Card className="flex gap-6 p-6">
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-teal-800 font-[family-name:var(--font-display)] text-lg text-white shadow-[var(--shadow-soft)]"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-xl text-ink-900">
                      {item.t}
                    </span>
                    <span className="block text-ink-700">{item.d}</span>
                  </span>
                </Card>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <Notice title="Neden ayrıntıları yayınlamıyoruz?">
              <p>
                Adli sicil durumu ve değerlendirme puanı, uzmanın kişisel
                verisidir. Bunları herkese açık bir profilde yayınlamak, hizmet
                almanıza yaramaz ama uzman için kalıcı bir kayıt oluşturur. Bu
                yüzden sonucu değil, sürecin tamamlandığını gösteriyoruz.
              </p>
            </Notice>
          </div>
        </Container>
      </Section>

      <Section tone="warm">
        <Container width="wide">
          <div className="grid items-start gap-12 md:grid-cols-2">
            <div>
              <Eyebrow>Profilde ne var</Eyebrow>
              <h2 className="mb-5 text-3xl sm:text-4xl">
                Kıyaslatan değil, eşleştiren bilgi
              </h2>
              <p className="mb-4 text-ink-700">
                Yıldız puanı, kullanıcı yorumu, deneyim yılı ve yanıt hızı gibi
                sıralanabilir ölçütler göstermiyoruz. Böyle ölçütler bir
                hiyerarşi kurar; hiyerarşi de herkesi aynı birkaç kişiye yığar.
              </p>
              <p className="text-ink-700">
                Doğrulama sürecini geçen herkes bu iş için yeterlidir. Gösterdiğimiz
                bilgi, kimin daha iyi olduğunu değil, kimin sizin konunuzda
                çalıştığını anlatır.
              </p>
              <p className="mt-5 font-semibold text-ink-900">
                Uzman sıralaması hiçbir koşulda ücret karşılığı değiştirilemez.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)]">
              <div className="mb-6 flex items-center gap-4 border-b border-ink-100 pb-6">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-teal-50">
                  <Logo variant="symbol" decorative className="h-9" />
                </span>
                <span>
                  <span className="block text-lg font-semibold text-ink-900">
                    Örnek profil düzeni
                  </span>
                  <span className="block text-base text-ink-600">
                    Gerçek bir uzman değildir.
                  </span>
                </span>
              </div>

              <dl className="space-y-4">
                {[
                  ["Uzmanlık alanları", "Neyin üzerine çalıştığı"],
                  ["Doğrulama", "Hipokampüs doğrulama sürecini tamamladı"],
                  ["Müsaitlik", "Yakın dönemde görüşmeye açık mı"],
                  ["Görüşme dili", "Hangi dillerde görüşebildiği"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex flex-col gap-1 border-b border-ink-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <dt className="w-40 shrink-0 font-semibold text-teal-800">
                      {k}
                    </dt>
                    <dd className="text-ink-700">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="paper">
        <Container>
          <Notice tone="teal" title="Henüz doğrulanmış uzman bulunmuyor">
            <p>
              Hipokampüs geliştirme aşamasındadır. Doğrulama süreci kuruluyor ve
              şu anda platformda listelenen uzman yoktur. Bu sayfa, sürecin nasıl
              işleyeceğini şimdiden açıkça paylaşmak için yayımlanmıştır.
            </p>
          </Notice>

          <div className="mt-10">
            <ButtonLink href="/uzman/basvuru" withArrow>
              Uzman ön başvurusu
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
