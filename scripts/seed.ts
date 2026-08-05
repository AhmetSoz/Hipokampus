/**
 * Veritabanını örnek (temsilî) verilerle doldurur.
 *
 * Çalıştırma: npm run db:seed
 *
 * Var olan tüm satırları siler ve yeniden yazar — geliştirme ortamı için
 * tekrar tekrar çalıştırılabilir olsun diye. Prototip verisi olduğu için
 * bu güvenlidir; gerçek kullanıcı verisi olsaydı bu betik burada durmazdı.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL tanımlı değil. .env.local dosyasını kontrol edin.");
}

const db = drizzle(neon(connectionString), { schema });

async function main() {
  console.log("Tablolar temizleniyor...");
  await db.delete(schema.messages);
  await db.delete(schema.conversations);
  await db.delete(schema.accessLog);
  await db.delete(schema.planItems);
  await db.delete(schema.familyMembers);
  await db.delete(schema.consultants);
  await db.delete(schema.experts);

  console.log("Uzmanlar ekleniyor...");
  await db.insert(schema.experts).values([
    {
      id: "u1",
      slug: "elif-tanyeri",
      name: "Elif Tanyeri",
      field: "Gerontoloji",
      city: "İstanbul",
      specialties: [
        "Evde bakım düzeni kurma",
        "Bakım seçeneklerinin karşılaştırılması",
        "Aile içi rol paylaşımı",
      ],
      availability: "bu-hafta",
      verifiedAt: new Date("2026-06-14"),
      about:
        "Bakım sürecinin en zor kısmının nereden başlanacağını bilmemek olduğunu düşünüyorum. Görüşmelerimizde önce evdeki günlük akışı konuşuyoruz, sonra neyin gerçekten değişmesi gerektiğine birlikte karar veriyoruz.",
      needAreaIds: ["gunluk", "secenekler", "aile-karar", "bakim-veren"],
      languages: ["Türkçe"],
    },
    {
      id: "u2",
      slug: "murat-sencan",
      name: "Murat Şencan",
      field: "Gerontoloji",
      city: "Ankara",
      specialties: [
        "Hafıza değişikliklerinde ilk adımlar",
        "Hangi uzmana başvurulacağının netleştirilmesi",
        "Tanı sürecinde aileye eşlik etme",
      ],
      availability: "bu-hafta",
      verifiedAt: new Date("2026-06-28"),
      about:
        "Hafızayla ilgili değişiklikler fark edildiğinde ailelerin en çok ihtiyaç duyduğu şey sakin bir açıklama oluyor. Ne olduğunu ve olmadığını konuşuyoruz, ardından hangi uzmana başvurulacağını netleştiriyoruz.",
      needAreaIds: ["hafiza", "saglik-koordinasyon", "aile-karar"],
      languages: ["Türkçe", "İngilizce"],
    },
    {
      id: "u3",
      slug: "ayse-kurtoglu",
      name: "Ayşe Kurtoğlu",
      field: "Sosyal hizmet",
      city: "İzmir",
      specialties: [
        "Ulaşılabilecek destek ve hakların çıkarılması",
        "Kurum bakımına geçiş süreci",
        "Sosyal izolasyonun kırılması",
      ],
      availability: "gelecek-hafta",
      verifiedAt: new Date("2026-05-30"),
      about:
        "Uzun yıllar evde bakım süreçlerinde çalıştım. Ailelerin haklarını ve ulaşabilecekleri destekleri bilmemesi en sık karşılaştığım durum. Konuşmalarımızda seçenekleri tek tek çıkarıyoruz.",
      needAreaIds: ["secenekler", "sosyal", "aile-karar", "bakim-veren"],
      languages: ["Türkçe"],
    },
    {
      id: "u4",
      slug: "hakan-devrim",
      name: "Hakan Devrim",
      field: "Fizyoterapi",
      city: "İstanbul",
      specialties: [
        "Düşme riskinin azaltılması",
        "Ev içi güvenlik düzenlemeleri",
        "Hareket korkusuyla baş etme",
      ],
      availability: "bu-hafta",
      verifiedAt: new Date("2026-07-02"),
      about:
        "Düşme korkusu, hareketi kısıtladığı için çoğu zaman düşmenin kendisinden daha çok zarar veriyor. Evin içindeki günlük hareketi ve güvenliği birlikte gözden geçiriyoruz.",
      needAreaIds: ["ev-guvenlik", "gunluk"],
      languages: ["Türkçe"],
    },
    {
      id: "u5",
      slug: "zeynep-arslan",
      name: "Zeynep Arslan",
      field: "Beslenme ve diyetetik",
      city: "Bursa",
      specialties: [
        "İleri yaşta iştah ve beslenme değişiklikleri",
        "Evdeki mevcut düzeni bozmadan iyileştirme",
      ],
      availability: "dolu",
      verifiedAt: new Date("2026-07-11"),
      about:
        "İleri yaşta iştah ve beslenme alışkanlıkları değişiyor; bu çoğu zaman fark edilmeden ilerliyor. Evdeki mevcut düzeni bozmadan neyin iyileştirilebileceğine bakıyoruz.",
      needAreaIds: ["gunluk", "saglik-koordinasyon"],
      languages: ["Türkçe"],
    },
    {
      id: "u6",
      slug: "necla-boran",
      name: "Necla Boran",
      field: "Psikoloji",
      city: "Ankara",
      specialties: [
        "Bakım verenin tükenmişliği",
        "Sorumluluğun tek kişide toplanması",
        "Aile içi çatışmanın yumuşatılması",
      ],
      availability: "gelecek-hafta",
      verifiedAt: new Date("2026-04-19"),
      about:
        "Bakım veren kişinin yorgunluğu genellikle en son konuşulan konu oluyor. Oysa süreç uzadıkça belirleyici hale geliyor. Bu yükü nasıl paylaşabileceğinizi konuşuyoruz.",
      needAreaIds: ["bakim-veren", "sosyal", "aile-karar"],
      languages: ["Türkçe"],
    },
    {
      id: "u7",
      slug: "serkan-ulutas",
      name: "Serkan Ulutaş",
      field: "Geriatri hemşireliği",
      city: "İzmir",
      specialties: [
        "Çoklu ilaç kullanımının takibi",
        "Randevu takviminin sadeleştirilmesi",
        "Evde işleyen basit düzenler kurma",
      ],
      availability: "bu-hafta",
      verifiedAt: new Date("2026-06-05"),
      about:
        "Birden fazla ilacın birlikte takibi, ailelerin en çok zorlandığı konulardan biri. Evde işleyen basit bir düzen kurmayı ve randevu takvimini sadeleştirmeyi konuşuyoruz.",
      needAreaIds: ["saglik-koordinasyon", "gunluk", "ev-guvenlik"],
      languages: ["Türkçe"],
    },
    {
      id: "u8",
      slug: "pinar-esen",
      name: "Pınar Esen",
      field: "Gerontoloji",
      city: "Antalya",
      specialties: [
        "Kardeşler arası karar ayrılıkları",
        "Herkesin aynı bilgiyle konuşabilmesi",
        "Uzaktan bakım koordinasyonu",
      ],
      availability: "bu-hafta",
      verifiedAt: new Date("2026-07-21"),
      about:
        "Ailelerin çoğu bana kardeşler arasında anlaşamadıkları bir noktada ulaşıyor. Kararı benim yerinize vermem değil, herkesin aynı bilgiyle konuşabilmesi işe yarıyor.",
      needAreaIds: ["aile-karar", "secenekler", "sosyal"],
      languages: ["Türkçe"],
    },
  ]);

  console.log("Danışan ekleniyor...");
  await db.insert(schema.consultants).values({
    id: "d1",
    name: "Fatma Demir",
    birthYear: 1948,
    city: "İzmir",
    summary:
      "Eşini kaybettikten sonra tek başına yaşıyor. Günlük işlerin çoğunu kendisi yapıyor; alışveriş ve ilaç takibinde desteğe ihtiyaç duyuyor.",
  });

  console.log("Aile üyeleri ekleniyor...");
  await db.insert(schema.familyMembers).values([
    {
      id: "a0",
      consultantId: "d1",
      name: "Fatma Demir",
      relation: "Kendisi",
      relationRole: "birey",
      scopes: ["saglik-gorusme", "gunluk-lojistik", "odeme-fatura"],
      status: "aktif",
      payer: false,
      invitedAt: new Date("2026-06-02"),
      expiresAt: null,
    },
    {
      id: "a1",
      consultantId: "d1",
      name: "Ayşe Demir",
      relation: "Kızı",
      relationRole: "bakim-veren",
      scopes: ["saglik-gorusme", "gunluk-lojistik"],
      status: "aktif",
      payer: false,
      invitedAt: new Date("2026-06-02"),
      expiresAt: null,
    },
    {
      id: "a2",
      consultantId: "d1",
      name: "Mehmet Demir",
      relation: "Oğlu",
      relationRole: "aile-uyesi",
      // Ödemeyi yapan kişi. Sağlık ve görüşme kapsamı BİLEREK yok.
      scopes: ["odeme-fatura"],
      status: "aktif",
      payer: true,
      invitedAt: new Date("2026-06-05"),
      expiresAt: null,
    },
    {
      id: "a3",
      consultantId: "d1",
      name: "Zehra Demir",
      relation: "Gelini",
      relationRole: "aile-uyesi",
      scopes: ["gunluk-lojistik"],
      status: "aktif",
      payer: false,
      invitedAt: new Date("2026-06-18"),
      expiresAt: new Date("2026-12-18"),
    },
    {
      id: "a4",
      consultantId: "d1",
      name: "Kemal Demir",
      relation: "Kardeşi",
      relationRole: "aile-uyesi",
      scopes: [],
      // Silinmedi, askıya alındı. Aile ilişkileri geri döner, silme dönmez.
      status: "askida",
      payer: false,
      invitedAt: new Date("2026-06-20"),
      expiresAt: null,
    },
  ]);

  console.log("Erişim kaydı ekleniyor...");
  await db.insert(schema.accessLog).values([
    {
      id: "l1",
      memberId: "a1",
      scope: "saglik-gorusme",
      section: "Bakım planı",
      at: new Date("2026-08-04T19:42:00"),
    },
    {
      id: "l2",
      memberId: "a2",
      scope: "odeme-fatura",
      section: "Ödeme ve abonelik",
      at: new Date("2026-08-04T11:15:00"),
    },
    {
      id: "l3",
      memberId: "a1",
      scope: "saglik-gorusme",
      section: "Danışma dosyası",
      at: new Date("2026-08-03T21:07:00"),
    },
    {
      id: "l4",
      memberId: "a3",
      scope: "gunluk-lojistik",
      section: "Genel bakış",
      at: new Date("2026-08-03T09:30:00"),
    },
  ]);

  console.log("Bakım planı ekleniyor...");
  await db.insert(schema.planItems).values([
    {
      id: "p1",
      consultantId: "d1",
      title: "Haftalık alışveriş için sabit bir gün belirleyin",
      detail:
        "Alışverişin her hafta aynı gün yapılması, hem unutulmayı önlüyor hem de Fatma Hanım'ın kendi listesini önceden hazırlamasına imkân veriyor.",
      needAreaId: "gunluk",
      status: "tamamlandi",
      authorExpertId: "u1",
      createdAt: new Date("2026-07-08"),
    },
    {
      id: "p2",
      consultantId: "d1",
      title: "İlaçlar için haftalık bölmeli kutu kullanın",
      detail:
        "Sabah ve akşam dozları ayrı bölmelerde olacak şekilde pazar günü hazırlanması, günlük takibi tek bakışta yapılabilir hâle getiriyor.",
      needAreaId: "saglik-koordinasyon",
      status: "surüyor",
      authorExpertId: "u1",
      createdAt: new Date("2026-07-08"),
    },
    {
      id: "p3",
      consultantId: "d1",
      title: "Banyoda tutunma barı ve kaymaz paspas",
      detail:
        "Küvete giriş çıkış, evdeki en yüksek düşme riski. Tutunma barının duvara sabitlenmesi ve kaymaz paspas bu riski belirgin biçimde azaltıyor.",
      needAreaId: "ev-guvenlik",
      status: "yapilacak",
      authorExpertId: "u1",
      createdAt: new Date("2026-07-15"),
    },
    {
      id: "p4",
      consultantId: "d1",
      title: "Haftada bir gün komşu ziyareti veya telefon görüşmesi",
      detail:
        "Sosyal temasın takvime yazılması, iyi niyetli ama belirsiz kalan planların gerçekleşme ihtimalini artırıyor.",
      needAreaId: "sosyal",
      status: "yapilacak",
      authorExpertId: "u1",
      createdAt: new Date("2026-07-15"),
    },
  ]);

  console.log("Danışma dosyaları ve mesajlar ekleniyor...");
  await db.insert(schema.conversations).values([
    {
      id: "g1",
      expertId: "u1",
      consultantId: "d1",
      subject: "Annem için evde bakım düzeni",
      status: "tamamlandi",
      startedAt: new Date("2026-07-02"),
    },
    {
      id: "g2",
      expertId: "u4",
      consultantId: "d1",
      subject: "Banyo düzenlemesi ve düşme riski",
      status: "yanit-bekliyor",
      startedAt: new Date("2026-08-03"),
    },
  ]);

  await db.insert(schema.messages).values([
    {
      id: "m1",
      conversationId: "g1",
      author: "danisan",
      authorName: "Ayşe Demir",
      body: "Merhaba, annem İzmir'de tek başına yaşıyor. Günlük işlerin çoğunu kendisi yapıyor ama alışveriş ve ilaç takibinde zorlanmaya başladı. Nereden başlayacağımı bilmiyorum.",
      sentAt: new Date("2026-07-02T14:20:00"),
    },
    {
      id: "m2",
      conversationId: "g1",
      author: "uzman",
      authorName: "Elif Tanyeri",
      body: "Merhaba Ayşe Hanım, ben Elif Tanyeri. Gerontoloji alanında çalışıyorum ve bu süreçte size eşlik edeceğim.\n\nÖnce annenizin günü nasıl geçiyor onu anlamak isterim: sabah kalktığında ilk ne yapıyor, gün içinde evden çıkıyor mu, akşam yemeğini kim hazırlıyor?",
      sentAt: new Date("2026-07-03T09:15:00"),
    },
    {
      id: "m3",
      conversationId: "g1",
      author: "danisan",
      authorName: "Ayşe Demir",
      body: "Sabah erken kalkıyor, kahvaltısını kendi yapıyor. Haftada bir markete gidiyor ama son zamanlarda ağır poşetleri taşımakta zorlanıyor. Akşam yemeğini genelde öğleden kalanla geçiştiriyor.",
      sentAt: new Date("2026-07-03T20:40:00"),
    },
    {
      id: "m4",
      conversationId: "g1",
      author: "uzman",
      authorName: "Elif Tanyeri",
      body: "Teşekkür ederim, bu tablo epey şey anlatıyor. İlaçlar konusunda da birkaç şey sorayım: kaç farklı ilaç kullanıyor ve hangilerini ne zaman alması gerekiyor?",
      sentAt: new Date("2026-07-04T10:05:00"),
    },
    {
      id: "m5",
      conversationId: "g1",
      author: "danisan",
      authorName: "Ayşe Demir",
      body: "Dört ilaç var. İkisi sabah, biri akşam, biri de haftada bir. Bazen aldı mı almadı mı emin olamıyor, ben de her akşam telefonla soruyorum.",
      sentAt: new Date("2026-07-04T19:12:00"),
    },
    {
      id: "m6",
      conversationId: "g1",
      author: "uzman",
      authorName: "Elif Tanyeri",
      body: "Anlıyorum. Sizin her akşam telefonla kontrol etmeniz uzun vadede ikinizi de yoruyor olabilir.\n\nKonuştuklarımızdan bir bakım planı hazırladım. Dört madde var; ikisi hemen uygulanabilir, ikisi biraz hazırlık istiyor. Planı aşağıdan açabilirsiniz.",
      sentAt: new Date("2026-07-08T11:30:00"),
    },
    {
      id: "m7",
      conversationId: "g2",
      author: "danisan",
      authorName: "Ayşe Demir",
      body: "Merhaba, bakım planında banyo için tutunma barı önerilmişti. Nereye ve nasıl monte edileceği konusunda kararsızız. Küvet var, duş kabini yok.",
      sentAt: new Date("2026-08-03T16:45:00"),
    },
    {
      id: "m8",
      conversationId: "g2",
      author: "uzman",
      authorName: "Hakan Devrim",
      body: "Merhaba Ayşe Hanım, ben Hakan Devrim, fizyoterapistim.\n\nKüvetli banyolarda en kritik nokta giriş-çıkış anı. Barın yeri, annenizin hangi tarafa ağırlık vererek girdiğine göre değişiyor. Küveti kullanırken hangi eliyle tutunuyor, biliyor musunuz?",
      sentAt: new Date("2026-08-04T09:20:00"),
    },
  ]);

  console.log("Tamamlandı.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
