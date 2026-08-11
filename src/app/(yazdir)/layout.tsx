/**
 * Rapor kabuğu.
 *
 * Ayrı bir rota grubu: raporlar `/uzman-panel/...` altında kalsaydı
 * panel kabuğu (menü, arka plan ağı, yüzen mesaj kutusu, yardım paneli)
 * baskıya karışırdı. Rota grubu kendi minimal kabuğunu veriyor ve URL
 * temiz kalıyor (`/rapor/danisan/d1`).
 *
 * Yazdırma stilleri `globals.css` içindeki `@media print` bloğunda.
 */
export default function YazdirLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 print:max-w-none print:px-0 print:py-0">
      {children}
    </div>
  );
}
