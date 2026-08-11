import { expect, test, type Page } from "@playwright/test";

/**
 * Ekran testleri: erişim sınırları, mobil kırıklar, klavye davranışı.
 *
 * Kimlik: proje demo çerezleriyle çalışıyor (`hk-demo-uzman`), gerçek
 * oturum açmadan uzman paneline girilebiliyor. Bu bilinen bir açık ve
 * güvenlik fazına ertelendi; testler bugünkü davranışı kullanıyor.
 * Kapı eklendiğinde bu yardımcı gerçek girişe çevrilecek.
 */
async function uzmanOl(page: Page, expertId: string) {
  await page.context().addCookies([
    {
      name: "hk-demo-uzman",
      value: expertId,
      url: page.url().startsWith("http")
        ? new URL(page.url()).origin
        : "http://localhost:3000",
    },
  ]);
}

test.describe("erişim sınırları", () => {
  test("uzman, dosyası olmayan danışanın sayfasını göremez", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    /* u2'nin d1 ile hiç dosyası yok. "Bulunamadı" demek, "var ama
       göremezsin" demekten daha az bilgi sızdırır. */
    await uzmanOl(page, "u2");
    const yanit = await page.goto(`${baseURL}/uzman-panel/danisanlar/d1`);
    expect(yanit?.status()).toBe(404);
  });

  test("dosyası olan uzman aynı sayfayı görebilir", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await uzmanOl(page, "u4");
    const yanit = await page.goto(`${baseURL}/uzman-panel/danisanlar/d1`);
    expect(yanit?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Fatma Demir",
    );
  });
});

test.describe("randevu", () => {
  test("geçmiş tarihe görüşme önerilemez", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await uzmanOl(page, "u4");
    await page.goto(`${baseURL}/uzman-panel/mesajlar/g2?sekme=yazisma`);

    const tarih = page.locator('input[name="tarih"]');
    if ((await tarih.count()) === 0) test.skip(true, "Dosya kapalı");

    await tarih.fill("2020-01-01");
    await page.locator('input[name="saat"]').fill("10:00");
    await page
      .locator('form:has(input[name="tarih"]) button[type="submit"]')
      .first()
      .click();

    await expect(page).toHaveURL(/randevuHata=gecmis/);
    /* Next.js'in kendi rota duyurucusu da role="alert" taşıyor;
       seçici forma daraltılıyor. */
    await expect(
      page.locator('form:has(input[name="tarih"]) [role="alert"]'),
    ).toContainText("Geçmiş bir saate");
  });

  test("girilen saat aynı saat olarak gösterilir", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/`);
    await uzmanOl(page, "u4");
    await page.goto(`${baseURL}/uzman-panel/mesajlar/g2?sekme=yazisma`);

    const tarih = page.locator('input[name="tarih"]');
    if ((await tarih.count()) === 0) test.skip(true, "Dosya kapalı");

    /* Saat dilimi hatasının ekran tarafındaki bekçisi: 14:00 girilip
       17:00 gösterilirse bu test düşer.

       Gün her koşuda farklı: sabit bir gün kullanılırsa ikinci koşu
       (ya da ikinci tarayıcı projesi) aynı slota denk gelip kısmi tekil
       indekse takılıyor ve test kendi kendini bozuyor. */
    const kayma = 30 + (Date.now() % 90);
    const d = new Date(Date.now() + kayma * 864e5);
    const gun = d.toISOString().slice(0, 10);
    await tarih.fill(gun);
    await page.locator('input[name="saat"]').fill("14:00");
    await page
      .locator('form:has(input[name="tarih"]) button[type="submit"]')
      .first()
      .click();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("body")).toContainText("14:00");
    await expect(page.locator("body")).not.toContainText("17:00");
  });
});

test.describe("mobil", () => {
  const yollar = [
    "/panel",
    "/panel/ilerleme",
    "/uzman-panel",
    "/uzman-panel/ajanda",
    "/uzman-panel/musaitlik",
  ];

  for (const yol of yollar) {
    test(`${yol} 375px'te yatay taşmıyor`, async ({ page, baseURL }) => {
      await page.setViewportSize({ width: 375, height: 780 });
      await page.goto(`${baseURL}${yol}`);
      await page.waitForLoadState("networkidle");
      const tasma = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(tasma).toBe(false);
    });
  }

  test("bildirim zili telefonda erişilebilir", async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 375, height: 780 });
    await page.goto(`${baseURL}/panel`);
    /* Zil yalnızca gerçek oturumda render ediliyor; demo çerezinde
       görünmüyor. Burada asıl kontrol: görünüyorsa TIKLANABİLİR olmalı,
       yani `hidden md:flex` kabının içine geri düşmemiş olmalı. */
    const zil = page.getByRole("button", { name: /Bildirim/i });
    if ((await zil.count()) === 0) test.skip(true, "Oturum yok");
    await expect(zil.first()).toBeVisible();
  });
});

test.describe("klavye ve odak", () => {
  test("yardım paneli Esc ile kapanır ve odak düğmeye döner", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/panel`);
    const dugme = page.getByRole("button", { name: /Ne nerede/i });
    if ((await dugme.count()) === 0) test.skip(true, "Panel açılmadı");

    await dugme.first().click();
    const panel = page.getByRole("dialog", { name: /yardım paneli/i });
    await expect(panel).toBeVisible();
    await expect(dugme.first()).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    /* Kapanışta odağın tetikleyiciye dönmesi — daha önce hiçbir
       panelde yoktu, klavye kullanıcısı sayfa başına düşüyordu. */
    await expect(dugme.first()).toBeFocused();
  });

  test("mesaj kutusu Esc ile kapanır", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/panel`);
    const dugme = page.getByRole("button", { name: /^Mesajlar/ });
    if ((await dugme.count()) === 0) test.skip(true, "Kutu yok");

    await dugme.first().click();
    const kutu = page.getByRole("dialog", { name: "Mesajlar" });
    await expect(kutu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(kutu).toBeHidden();
    await expect(dugme.first()).toBeFocused();
  });
});
