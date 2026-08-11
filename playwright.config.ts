import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright yapılandırması.
 *
 * Bu projenin en büyük altyapı boşluğu hiç otomatik test olmamasıydı;
 * doğrulama her seferinde geçici betiklerle yapılıyor ve versiyonlanmıyordu.
 *
 * DİKKAT — TESTLER VERİTABANINA YAZAR. `DATABASE_URL` ayrı bir Neon
 * branch'ine bakmalı; aksi hâlde demo verisi kirlenir. Testler kendi
 * açtıkları kayıtları temizler ama tohum verisine dokunmazlar.
 *
 * `@axe-core/playwright` bilerek eklenmedi: bağımlılık politikası
 * "yalnızca test paketi". Erişilebilirlik kontrolleri elle assert
 * ediliyor (odak iadesi, Esc, aria-expanded, yatay taşma).
 */
export default defineConfig({
  testDir: "./tests",
  /* Yarış testi aynı slota eşzamanlı istek atıyor; dosyalar paralel
     çalışırsa birbirinin verisini bozabilir. */
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.TEST_URL ?? "http://localhost:3000",
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "masaustu", use: { ...devices["Desktop Chrome"] } },
    { name: "mobil", use: { ...devices["Pixel 7"] } },
  ],
  /* TEST_URL verilmişse (canlı doğrulama) sunucu başlatma. */
  webServer: process.env.TEST_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
