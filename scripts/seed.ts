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
  /* DİKKAT: bu betik gerçek hesapları da siler. users satırları
     consultants/experts'e cascade ile bağlı; sıfırlama istemiyorsanız
     db:seed çalıştırmayın. */
  await db.delete(schema.authSessions);
  await db.delete(schema.users);
  await db.delete(schema.assessmentResponses);
  await db.delete(schema.assessmentAssignments);
  await db.delete(schema.assessmentItems);
  await db.delete(schema.assessmentTemplates);
  await db.delete(schema.appointments);
  await db.delete(schema.sessionMeasurements);
  await db.delete(schema.sessionNotes);
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
        "Evde günlük düzenin kurulması",
        "Destek seçeneklerinin karşılaştırılması",
        "Aile içi rol paylaşımı",
      ],
      availability: "bu-hafta",
      verifiedAt: new Date("2026-06-14"),
      about:
        "Sürecin en zor kısmının nereden başlanacağını bilmemek olduğunu düşünüyorum. Görüşmelerimizde önce evdeki günlük akışı konuşuyoruz, sonra neyin gerçekten değişmesi gerektiğine birlikte karar veriyoruz.",
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
        "Kuruma geçiş süreci",
        "Sosyal izolasyonun kırılması",
      ],
      availability: "gelecek-hafta",
      verifiedAt: new Date("2026-05-30"),
      about:
        "Uzun yıllar ileri yaş destek süreçlerinde çalıştım. Ailelerin haklarını ve ulaşabilecekleri destekleri bilmemesi en sık karşılaştığım durum. Konuşmalarımızda seçenekleri tek tek çıkarıyoruz.",
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
        "Yakının tükenmişliği",
        "Sorumluluğun tek kişide toplanması",
        "Aile içi çatışmanın yumuşatılması",
      ],
      availability: "gelecek-hafta",
      verifiedAt: new Date("2026-04-19"),
      about:
        "Süreci yürüten kişinin yorgunluğu genellikle en son konuşulan konu oluyor. Oysa süreç uzadıkça belirleyici hale geliyor. Bu yükü nasıl paylaşabileceğinizi konuşuyoruz.",
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
        "Uzaktan süreç koordinasyonu",
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
      section: "Danışmanlık planı",
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

  console.log("Danışmanlık planı ekleniyor...");
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
      subject: "Annem için evde günlük düzen",
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
      body: "Anlıyorum. Sizin her akşam telefonla kontrol etmeniz uzun vadede ikinizi de yoruyor olabilir.\n\nKonuştuklarımızdan bir danışmanlık planı hazırladım. Dört madde var; ikisi hemen uygulanabilir, ikisi biraz hazırlık istiyor. Planı aşağıdan açabilirsiniz.",
      sentAt: new Date("2026-07-08T11:30:00"),
    },
    {
      id: "m7",
      conversationId: "g2",
      author: "danisan",
      authorName: "Ayşe Demir",
      body: "Merhaba, planda banyo için tutunma barı önerilmişti. Nereye ve nasıl monte edileceği konusunda kararsızız. Küvet var, duş kabini yok.",
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

  console.log("Seans notları ekleniyor...");
  await db.insert(schema.sessionNotes).values([
    {
      id: "sn1",
      conversationId: "g2",
      authorExpertId: "u4",
      occurredAt: new Date("2026-07-20T10:00:00"),
      title: "İlk değerlendirme",
      note: "Denge ve yürüyüş değerlendirildi. Küvete giriş-çıkışta destek ihtiyacı gözlendi. Tutunma barı önerildi.",
      status: "yayinda",
      createdAt: new Date("2026-07-20T10:30:00"),
    },
    {
      id: "sn2",
      conversationId: "g2",
      authorExpertId: "u4",
      occurredAt: new Date("2026-07-27T10:00:00"),
      title: "İkinci görüşme",
      note: "Tek ayak üzerinde durma süresi ölçüldü. Geçen haftaya göre hafif iyileşme var; egzersizlere devam.",
      status: "yayinda",
      createdAt: new Date("2026-07-27T10:30:00"),
    },
    {
      id: "sn3",
      conversationId: "g2",
      authorExpertId: "u4",
      occurredAt: new Date("2026-08-03T10:00:00"),
      title: "Üçüncü görüşme",
      note: "Denge belirgin şekilde iyileşti. Banyo düzenlemesinin (bar + kaymaz paspas) tamamlanıp tamamlanmadığı bir sonraki görüşmede sorulacak.",
      status: "taslak",
      createdAt: new Date("2026-08-03T10:30:00"),
    },
  ]);

  await db.insert(schema.sessionMeasurements).values([
    {
      id: "smn1-0",
      sessionId: "sn1",
      label: "Tek ayak durma süresi",
      value: "8",
      unit: "sn",
      sortOrder: 0,
    },
    {
      id: "smn2-0",
      sessionId: "sn2",
      label: "Tek ayak durma süresi",
      value: "11",
      unit: "sn",
      sortOrder: 0,
    },
    {
      id: "smn3-0",
      sessionId: "sn3",
      label: "Tek ayak durma süresi",
      value: "15",
      unit: "sn",
      sortOrder: 0,
    },
  ]);

  /* Değerlendirme formu şablonları.
   *
   * TAMAMEN ÖZGÜN ve GENEL sorulardır. Hiçbiri lisanslı bir ölçekten
   * (MMSE, MoCA, GDS vb.) alınmamıştır — kilitli karar gereği. Puanlama
   * yoktur; yanıtlar uzmana olduğu gibi gösterilir. */
  console.log("Değerlendirme şablonları ekleniyor...");
  await db.insert(schema.assessmentTemplates).values([
    {
      id: "t-onform",
      title: "Ön değerlendirme",
      description:
        "Uzmanınızın sizi tanıması için birkaç soru. Doğru ya da yanlış yanıt yoktur.",
      createdByExpertId: "u1",
      createdAt: new Date("2026-07-01"),
    },
    {
      id: "t-gunluk",
      title: "Günlük yaşam gözlemi",
      description: "Son bir haftadaki günlük düzeni anlamak için.",
      createdByExpertId: "u1",
      createdAt: new Date("2026-07-01"),
    },
    {
      id: "t-takip",
      title: "İki haftalık takip",
      description: "Önerilen düzenlemelerin nasıl gittiğini görmek için.",
      createdByExpertId: "u4",
      createdAt: new Date("2026-07-15"),
    },
  ]);

  await db.insert(schema.assessmentItems).values([
    // Ön değerlendirme
    {
      id: "i-on-1",
      templateId: "t-onform",
      position: 1,
      prompt: "Sizi bugün buraya getiren şeyi kendi cümlelerinizle anlatır mısınız?",
      responseType: "metin",
      options: null,
    },
    {
      id: "i-on-2",
      templateId: "t-onform",
      position: 2,
      prompt: "Şu anda evde birlikte yaşadığınız biri var mı?",
      responseType: "evet-hayir",
      options: null,
    },
    {
      id: "i-on-3",
      templateId: "t-onform",
      position: 3,
      prompt: "Günlük işlerde ne kadar desteğe ihtiyaç duyuyorsunuz?",
      responseType: "cok-secmeli",
      options: [
        "Hiç ihtiyaç duymuyorum",
        "Ara sıra",
        "Çoğu gün",
        "Sürekli destek gerekiyor",
      ],
    },
    {
      id: "i-on-4",
      templateId: "t-onform",
      position: 4,
      prompt: "Son bir ayda kendinizi genel olarak nasıl hissettiniz? (1 çok kötü — 5 çok iyi)",
      responseType: "olcek",
      options: null,
    },
    {
      id: "i-on-5",
      templateId: "t-onform",
      position: 5,
      prompt: "Bu süreçten en çok ne beklediğinizi yazar mısınız?",
      responseType: "metin",
      options: null,
    },
    // Günlük yaşam gözlemi
    {
      id: "i-gun-1",
      templateId: "t-gunluk",
      position: 1,
      prompt: "Geçen hafta evden kaç gün dışarı çıktınız?",
      responseType: "cok-secmeli",
      options: ["Hiç", "1-2 gün", "3-4 gün", "5 gün ve üzeri"],
    },
    {
      id: "i-gun-2",
      templateId: "t-gunluk",
      position: 2,
      prompt: "Öğünlerinizi düzenli saatlerde alabiliyor musunuz?",
      responseType: "evet-hayir",
      options: null,
    },
    {
      id: "i-gun-3",
      templateId: "t-gunluk",
      position: 3,
      prompt: "Uyku düzeninizden ne kadar memnunsunuz? (1 hiç — 5 çok)",
      responseType: "olcek",
      options: null,
    },
    {
      id: "i-gun-4",
      templateId: "t-gunluk",
      position: 4,
      prompt: "Gün içinde en çok zorlandığınız an hangisi?",
      responseType: "metin",
      options: null,
    },
    // İki haftalık takip
    {
      id: "i-tak-1",
      templateId: "t-takip",
      position: 1,
      prompt: "Önerilen düzenlemeleri uygulayabildiniz mi?",
      responseType: "cok-secmeli",
      options: ["Tamamını", "Bir kısmını", "Henüz başlayamadım"],
    },
    {
      id: "i-tak-2",
      templateId: "t-takip",
      position: 2,
      prompt: "İki hafta öncesine göre kendinizi nasıl değerlendirirsiniz? (1 daha kötü — 5 daha iyi)",
      responseType: "olcek",
      options: null,
    },
    {
      id: "i-tak-3",
      templateId: "t-takip",
      position: 3,
      prompt: "Uygulamakta zorlandığınız bir madde varsa yazın.",
      responseType: "metin",
      options: null,
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
