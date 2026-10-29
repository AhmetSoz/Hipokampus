# Hipokampüs

İleri yaştaki bireylerin ve ailelerinin ihtiyaçlarını netleştirmesine, doğrulanmış
gerontoloji uzmanlarıyla buluşmasına ve bakım sürecini yazılı bir planla takip
etmesine yardımcı olan bir koordinasyon platformu. Türkçe.

> **Durum: prototip.** Yayında bir hizmet yok. Uzmanlar ve dosyalar örnektir.

Hipokampüs bir sağlık kuruluşu değildir. Tanı koymaz, tedavi uygulamaz, acil
müdahale sunmaz. **Acil bir durumda 112'yi arayın.**

## Claude ne yapıyor

Ürünün giriş noktası bir yazma alanı. Aile fark ettiklerini kendi cümleleriyle
yazar; Claude bunu

- uzmanın ilk okuyacağı, ailenin düzeltebildiği kısa bir özete,
- sabit ihtiyaç başlıklarına (her biri metindeki dayanağıyla),
- görüşmeden önce düşünülecek sorulara,
- bu başlıklarda çalışan en fazla üç uzman önerisine ("neden bu kişi?")

çevirir. Uzman tarafında aynı model, seans notunu ailenin anlayacağı dile çeviren
bir taslak önerir; uzman onaylamadan hiçbir metin değişmez.

Sınırlar koda yazılı: tanı, puan, risk düzeyi ve aciliyet değerlendirmesi
üretilmez; uzman otomatik atanmaz; metin açık onayla gönderilir ve
veritabanına yazılmaz. Claude kapalıyken (anahtar yoksa) aynı akış, hiçbir şey
göndermeyen bir işaretleme listesiyle çalışır.

İlgili kod: [`src/app/actions/netlestir.ts`](src/app/actions/netlestir.ts),
[`src/app/actions/sadelestir.ts`](src/app/actions/sadelestir.ts),
[`src/components/NeedsForm.tsx`](src/components/NeedsForm.tsx).

## Çalıştırma

Next.js 16, Postgres (Neon) ve Drizzle.

```bash
npm install
npm run db:push && npm run db:seed
npm run dev
```

`.env.local` içinde `DATABASE_URL` gerekir. Claude özellikleri için
`ANTHROPIC_API_KEY` eklenir; yoksa site liste yoluyla çalışır. Testler
Playwright ile: `npm test`.

Tasarım yönü [`DESIGN.md`](DESIGN.md) dosyasında.
