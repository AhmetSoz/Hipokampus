import type { Metadata } from "next";
import { Belirdiginde } from "@/components/Belirdiginde";
import { BrandPath } from "@/components/BrandPath";
import { Logo } from "@/components/Logo";
import { NeedIcon } from "@/components/NeedIcon";
import { SinirBaslik } from "@/components/SinirBaslik";
import { SinirOmurgasi } from "@/components/SinirOmurgasi";
import { VizyonMisyon } from "@/components/VizyonMisyon";
import { ButtonLink, Container, Notice } from "@/components/ui";
import { NEED_AREAS } from "@/data/needs";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Hipokampüs neden var, neye inanıyor ve nasıl çalışıyor. Gerontoloji ve " +
    "ilgili alanlardaki uzmanlarla görüşmenizi sağlayan dijital danışmanlık platformu.",
};

/**
 * Tanıtım sayfası — "Hafıza Yolu" anlatısı.
 *
 * Klasik "solda vizyon, sağda misyon" kutusu bilerek yapılmadı; sahibi
 * "sade bir şekilde değil, güzel animasyonlarla" istedi. Anlatı markanın
 * kendi metaforu üzerine kurulu: tek bir düğümle başlayan ağ, kaydırdıkça
 * genişliyor.
 *
 * Hareket `Belirdiginde` ile IntersectionObserver üzerinden; her bölüm
 * ekrana girince bir kez açılıyor. prefers-reduced-motion'da hiç
 * kurulmuyor.
 *
 * İÇERİK KURALI: buradaki hiçbir cümle doğrulanmamış iddia içermez.
 * "Kaç kişiye ulaştık", "kaç uzmanla çalışıyoruz" gibi sayılar YOK —
 * karar kaydındaki "kabul oranı iddiası kaldırıldı" ve "bilimsel kurul
 * yok" kararlarıyla aynı ilke.
 */

/**
 * İçerik bölümlerinde ağ dokusunun kullanıldığı sınıf.
 *
 * Tam güçte bırakıldığında kartların önüne geçiyor ve okumayı zorluyordu
 * ("karman çorman olmasın" kuralı). Ortadan dışa açılan bir maske,
 * yoğunluğu kenarlarda tutup metnin arkasını boş bırakıyor — doku duruyor,
 * gürültü gidiyor.
 */
const AG_MASKE =
  "absolute inset-0 h-full w-full " +
  "[mask-image:radial-gradient(ellipse_at_center,transparent_12%,rgba(0,0,0,0.3)_46%,#000_88%)] " +
  "[-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_12%,rgba(0,0,0,0.3)_46%,#000_88%)]";

const INANCLAR = [
  {
    baslik: "Kimse puanlanmaz",
    metin:
      "Yıldız, yorum, deneyim yılı, yanıt hızı göstermiyoruz. Bu ölçütler bir sıralama kurar; sıralama da herkesi aynı birkaç kişiye yığar. Doğrulamayı geçen herkes bu iş için yeterlidir.",
  },
  {
    baslik: "Sıra satın alınamaz",
    metin:
      "Uzman sıralaması ücret karşılığı değişmez. Listedeki yer, ödemeyle değil, uygunlukla belirlenir ve her gün dönüşümlü olarak kayar.",
  },
  {
    baslik: "Karar sizindir",
    metin:
      "Otomatik atama yapmıyoruz. En fazla üç öneri sunuyoruz ve her biri için neden o kişi olduğunu yazıyoruz. Seçimi siz yaparsınız.",
  },
  {
    baslik: "Ödeme, görme hakkı vermez",
    metin:
      "Ailede ödemeyi yapan kişi, sağlık ve görüşme verisini otomatik olarak göremez. Bu iki yetki birbirinden bağımsızdır; kimin neyi göreceğine yalnızca panelin sahibi karar verir.",
  },
  {
    baslik: "Elinizde bir şey kalır",
    metin:
      "Görüşmenin çıktısı, yazışmanın içinde kaybolan bir mesaj değil; maddeler hâlinde yazılı, kalıcı bir danışmanlık planıdır. Yazdırabilir, ailenizle paylaşabilirsiniz.",
  },
  {
    baslik: "Söylemediklerimiz de bağlayıcı",
    metin:
      "Hipokampüs bir sağlık kuruluşu değildir; tanı koymaz, tedavi uygulamaz, acil müdahale sunmaz. Puan, yüzde veya risk düzeyi üretmez. Bunlar eksiklik değil, bilinçli sınırlardır.",
  },
];

const ADIMLAR = [
  {
    no: "01",
    baslik: "Ne fark ettiğinizi söyleyin",
    metin:
      "Hangi başlıkta destek aradığınızı bilmek zorunda değilsiniz. Günlük dilde ne gözlemlediğinizi işaretleyin; başlıkları biz çıkaralım.",
  },
  {
    no: "02",
    baslik: "Uzmanınızı siz seçin",
    metin:
      "Konunuzla çalışan uzmanları görün, profilini okuyun, doğrudan başvurun. Sıralamada kimsenin satın aldığı bir yer yok.",
  },
  {
    no: "03",
    baslik: "Görüşün ve planı alın",
    metin:
      "Yazışın, görüşme saatini birlikte belirleyin. Süreç boyunca seans notları, ölçümler ve grafiklerle nerede olduğunuzu görün.",
  },
];

export default function HakkimizdaSayfasi() {
  return (
    <>
      {/* --- Giriş: tek düğüm ---------------------------------------- */}
      <div className="relative isolate overflow-hidden bg-sky-50">
        <BrandPath animate className="absolute inset-0 h-full w-full opacity-90" />
        <Container width="wide" className="relative py-20 sm:py-28">
          <Belirdiginde>
            <p className="mb-5 text-base font-semibold tracking-[0.14em] text-teal-600 uppercase">
              Hakkımızda
            </p>
            <h1 className="max-w-3xl text-4xl leading-[1.12] sm:text-6xl">
              Bir yakınınız için{" "}
              <span className="text-teal-700">nereden başlayacağınızı</span>{" "}
              bilmemek, yalnız olduğunuz anlamına gelmez.
            </h1>
          </Belirdiginde>
          <Belirdiginde gecikme={0.15}>
            <p className="mt-7 max-w-2xl text-xl text-ink-700">
              Hipokampüs, gerontoloji ve ilgili alanlardaki uzmanlarla
              görüşmenizi sağlayan dijital bir danışmanlık platformudur.
              Kararı sizin yerinize vermez; neyi konuşmanız gerektiğini
              görünür kılar.
            </p>
          </Belirdiginde>
        </Container>
      </div>

      {/* Buradan itibaren anlatı tek bir sinir lifine bağlı: omurga
          kaydırdıkça çiziliyor, her bölüm üzerindeki düğüm yanıyor. */}
      <div className="relative">
        <SinirOmurgasi />

      {/* --- Neden varız --------------------------------------------- */}
      <div className="bg-paper py-20 sm:py-28" data-omurga="Neden varız">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <Belirdiginde>
              <SinirBaslik ustBaslik="Neden varız">
                <h2 className="text-3xl leading-tight sm:text-4xl">
                  Süreç bir teşhisle değil, bir belirsizlikle başlıyor.
                </h2>
              </SinirBaslik>
            </Belirdiginde>

            <div className="space-y-6 text-lg text-ink-700">
              <Belirdiginde gecikme={0.1}>
                <p>
                  Bir yakınının durumunda bir şeylerin değiştiğini fark eden
                  aileler genellikle aynı yerde takılıyor:{" "}
                  <strong className="text-ink-900">
                    kime, neyi soracağını bilememek.
                  </strong>{" "}
                  Hangi uzmana gidileceği, neyin normal neyin değil olduğu,
                  sorumluluğun kimde olacağı — hepsi aynı anda ve dağınık
                  şekilde önlerine geliyor.
                </p>
              </Belirdiginde>
              <Belirdiginde gecikme={0.2}>
                <p>
                  Bu belirsizlik çoğu zaman erteleme üretiyor. Ertelendikçe
                  seçenekler daralıyor ve karar, hazırlıksız yakalanılan bir
                  anda alınmak zorunda kalıyor.
                </p>
              </Belirdiginde>
              <Belirdiginde gecikme={0.3}>
                <p>
                  Hipokampüs bu ilk adımı hedefliyor: dağınık olanı
                  başlıklara ayırmak, doğru uzmanla buluşturmak ve süreci tek
                  bir yerden izlenebilir kılmak.
                </p>
              </Belirdiginde>
            </div>
          </div>
        </Container>
      </div>

      {/* --- Misyon ve vizyon: birbirine bağlı iki düğüm -------------- */}
      <div className="bg-paper-warm py-20 sm:py-28" data-omurga="Misyon ve vizyon">
        <Container width="wide">
          <Belirdiginde>
            <SinirBaslik ustBaslik="Misyon ve vizyon">
              <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
                Bugün yaptığımız iş, varmak istediğimiz yere bağlı.
              </h2>
            </SinirBaslik>
          </Belirdiginde>

          <div className="mt-12">
            <VizyonMisyon
              misyon={{
                baslik: "Misyonumuz",
                metin:
                  "Bir yakınının durumunda değişiklik fark eden ailenin, ilk adımını doğru atmasını sağlamak.",
                maddeler: [
                  "Dağınık kaygıyı konuşulabilir başlıklara ayırmak",
                  "Doğrulanmış uzmanla, karşılaştırma baskısı olmadan buluşturmak",
                  "Süreci tek yerden izlenebilir kılmak",
                  "Kimin neyi göreceğine ailenin kendisinin karar vermesini sağlamak",
                ],
              }}
              vizyon={{
                baslik: "Vizyonumuz",
                metin:
                  "İleri yaş sürecinin, kriz anında değil başında yönetildiği bir düzen.",
                maddeler: [
                  "Tek görüşme değil, izlenebilir ve sürekli bir süreç",
                  "Gerontolojiyle başlayıp ilgili tüm alanları aynı sürece katmak",
                  "Kararın ailede kaldığı, uzmanın yol gösterdiği bir model",
                  "Güvenin ölçütlerle değil, şeffaflıkla kurulduğu bir platform",
                ],
              }}
            />
          </div>
        </Container>
      </div>

      {/* --- Neye inanıyoruz — ağ genişliyor -------------------------- */}
      <div
        className="relative isolate overflow-hidden bg-paper py-20 sm:py-28"
        data-omurga="Neye inanıyoruz"
      >
        <BrandPath soften={false} className={`${AG_MASKE} opacity-30`} />
        <Container width="wide" className="relative">
          <Belirdiginde>
            <SinirBaslik ustBaslik="Neye inanıyoruz">
              <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
                Güven, verdiğimiz sözlerden çok vermediklerimizle kuruluyor.
              </h2>
            </SinirBaslik>
            <p className="mt-5 mb-12 max-w-2xl text-lg text-ink-700">
              Aşağıdakiler pazarlama cümleleri değil; ürünün içine
              yazılmış, değiştirilmesi bilinçli bir karar gerektiren
              kurallar.
            </p>
          </Belirdiginde>

          <ul className="grid gap-5 md:grid-cols-2">
            {INANCLAR.map((k, i) => (
              <li key={k.baslik}>
                <Belirdiginde gecikme={0.06 * i}>
                  <div className="h-full rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)]">
                    <h3 className="mb-2 text-xl text-ink-900">{k.baslik}</h3>
                    <p className="text-ink-700">{k.metin}</p>
                  </div>
                </Belirdiginde>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* --- Nasıl çalışıyoruz --------------------------------------- */}
      <div className="bg-paper-warm py-20 sm:py-28" data-omurga="Nasıl çalışıyoruz">
        <Container width="wide">
          <Belirdiginde>
            <SinirBaslik ustBaslik="Nasıl çalışıyoruz">
              <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
                Üç adım, ve her adımda ne olacağını önceden bilirsiniz.
              </h2>
            </SinirBaslik>
            <div className="mb-12" />
          </Belirdiginde>

          <ol className="grid gap-6 md:grid-cols-3">
            {ADIMLAR.map((a, i) => (
              <li key={a.no}>
                <Belirdiginde gecikme={0.12 * i}>
                  <div className="group h-full rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-1 hover:border-teal-300 hover:shadow-[var(--shadow-lift)]">
                    {/* Adım numarası bir düğüm olarak duruyor — omurgadaki
                        düğümlerle aynı dil. */}
                    <span
                      aria-hidden
                      className="mb-5 flex size-14 items-center justify-center rounded-full bg-teal-50 font-[family-name:var(--font-display)] text-2xl text-teal-700 transition-[background-color,box-shadow] duration-[var(--dur-base)] group-hover:bg-teal-100 group-hover:shadow-[0_0_0_6px_var(--color-teal-50)]"
                    >
                      {a.no}
                    </span>
                    <h3 className="mb-2 text-xl text-ink-900">{a.baslik}</h3>
                    <p className="text-ink-700">{a.metin}</p>
                  </div>
                </Belirdiginde>
              </li>
            ))}
          </ol>
        </Container>
      </div>

      {/* --- Hangi konularda ----------------------------------------- */}
      <div
        className="relative isolate overflow-hidden bg-paper py-20 sm:py-28"
        data-omurga="Hangi konularda"
      >
        <BrandPath soften={false} className={`${AG_MASKE} opacity-25`} />
        <Container width="wide" className="relative">
          <Belirdiginde>
            <SinirBaslik ustBaslik="Hangi konularda">
              <h2 className="max-w-2xl text-3xl leading-tight sm:text-4xl">
                Sekiz başlık — ve hiçbiri bir tanı değil.
              </h2>
            </SinirBaslik>
            <div className="mb-12" />
          </Belirdiginde>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NEED_AREAS.map((n, i) => (
              <li key={n.id}>
                <Belirdiginde gecikme={0.05 * i}>
                  <div className="group h-full rounded-2xl border border-ink-200 bg-white p-6 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:-translate-y-1 hover:border-teal-300 hover:shadow-[var(--shadow-lift)]">
                    <span
                      aria-hidden
                      className="mb-4 flex size-11 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition-[background-color,box-shadow] duration-[var(--dur-base)] group-hover:bg-teal-100 group-hover:shadow-[0_0_0_5px_var(--color-teal-50)]"
                    >
                      <NeedIcon area={n.id} className="size-6" />
                    </span>
                    <p className="mb-1 font-semibold text-ink-900">{n.label}</p>
                    <p className="text-base text-ink-600">{n.hint}</p>
                  </div>
                </Belirdiginde>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* --- Nereye gidiyoruz ---------------------------------------- */}
      <div
        className="relative isolate overflow-hidden bg-teal-800 py-20 text-teal-50 sm:py-28"
        data-omurga="Nereye gidiyoruz"
      >
        <BrandPath soften={false} className={`${AG_MASKE} opacity-30`} />
        <Container width="wide" className="relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <Belirdiginde>
              <Logo variant="lockupReverse" decorative className="mb-8 h-14 sm:h-16" />
              <p className="mb-4 text-base font-semibold tracking-[0.14em] text-sky-300 uppercase">
                Nereye gidiyoruz
              </p>
              <h2 className="text-3xl leading-tight text-white sm:text-4xl">
                Tek bir görüşme değil, izlenebilir bir süreç.
              </h2>
            </Belirdiginde>

            <div className="space-y-6 text-lg text-teal-100">
              <Belirdiginde gecikme={0.1}>
                <p>
                  Gerontoloji ile başlıyoruz. Fizyoterapi, psikoloji, sosyal
                  hizmet ve beslenme gibi alanlardaki uzmanları da aynı
                  sürecin içine katmayı hedefliyoruz — çünkü ailelerin
                  karşılaştığı sorun tek bir mesleğin sınırları içinde
                  durmuyor.
                </p>
              </Belirdiginde>
              <Belirdiginde gecikme={0.2}>
                <p>
                  Uzun vadeli hedefimiz, bir ailenin sürecini baştan sona
                  tek bir yerden izleyebilmesi: seans notları, ölçümlerin
                  zaman içindeki seyri, atanan görevler ve herkesin ne
                  gördüğünü belirleyen açık bir yetki düzeni.
                </p>
              </Belirdiginde>
              <Belirdiginde gecikme={0.3}>
                <div className="flex flex-wrap gap-4 pt-2">
                  <ButtonLink href="/uzmanlar" variant="onDark" withArrow>
                    Uzmanlara göz atın
                  </ButtonLink>
                  <ButtonLink href="/uzman" variant="onDark">
                    Uzman mısınız?
                  </ButtonLink>
                </div>
              </Belirdiginde>
            </div>
          </div>
        </Container>
      </div>

      </div>
      {/* /omurga sarmalayıcısı */}

      {/* --- Sınırlar ------------------------------------------------ */}
      <div className="bg-paper py-16">
        <Container width="wide">
          <Belirdiginde>
            <Notice title="Açık olalım">
              <p>
                Hipokampüs geliştirme aşamasındadır ve şu anda yayında bir
                hizmet sunmamaktadır. Bir sağlık kuruluşu değildir; tanı
                koymaz, tedavi uygulamaz, acil müdahale sunmaz ve 7/24 izleme
                yapmaz. Acil bir durumda{" "}
                <strong className="text-ink-900">112&apos;yi arayın.</strong>{" "}
                Yasal metinler hazırlanma aşamasındadır.
              </p>
            </Notice>
          </Belirdiginde>
        </Container>
      </div>
    </>
  );
}
