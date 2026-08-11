import { gunEkle, trGun, trHaftaBasi, trUzunTarih } from "@/lib/zaman";

/**
 * Son 12 haftada hangi günlerde kayıt oluştu.
 *
 * ADLANDIRMA: "uyum ısı haritası" DEĞİL, "katılım haritası". İki gerekçe:
 * (1) "uyum" Türkçe'de doğrudan *tedaviye uyum* çağrışımı yapar ve
 * projede tıbbi terim kullanılmıyor; (2) bir "uyum oranı" göstermek,
 * yasaklanmış skorun kılık değiştirmiş hâli olurdu.
 *
 * Bu yüzden hücrede YÜZDE veya ORAN YAZILMAZ — yalnızca ham sayı ve
 * tarih. Harita "ne kadar iyi" demiyor, "ne zaman hareket vardı" diyor.
 */

const KADEME = [
  "bg-ink-100",
  "bg-teal-100",
  "bg-teal-300",
  "bg-teal-500",
  "bg-teal-700",
] as const;

const GUN_KISALTMA = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export function KatilimHaritasi({
  tarihler,
  haftaSayisi = 12,
  bugun,
}: {
  /** Her kayıt için bir ISO tarih; aynı güne birden çok düşebilir. */
  tarihler: string[];
  haftaSayisi?: number;
  /** "Bugün" — sunucu bileşeninden geçiriliyor ki render saf kalsın. */
  bugun: string;
}) {
  const sayim = new Map<string, number>();
  for (const t of tarihler) {
    const g = trGun(t);
    sayim.set(g, (sayim.get(g) ?? 0) + 1);
  }

  const sonPazartesi = trHaftaBasi(bugun);
  const ilkPazartesi = gunEkle(sonPazartesi, -(haftaSayisi - 1) * 7);

  const haftalar = Array.from({ length: haftaSayisi }, (_, h) =>
    Array.from({ length: 7 }, (_, g) => gunEkle(ilkPazartesi, h * 7 + g)),
  );

  const enYogun = Math.max(1, ...sayim.values());
  const kademe = (adet: number) => {
    if (adet === 0) return 0;
    return Math.min(4, Math.ceil((adet / enYogun) * 4));
  };

  const toplam = [...sayim.values()].reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <caption className="sr-only">
            Son {haftaSayisi} haftada günlere göre kayıt sayısı. Toplam{" "}
            {toplam} kayıt.
          </caption>
          <thead>
            <tr>
              <th className="sr-only" scope="col">
                Hafta günü
              </th>
              {haftalar.map((h) => (
                <th key={h[0]} className="sr-only" scope="col">
                  {trUzunTarih(`${h[0]}T12:00:00Z`)} haftası
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GUN_KISALTMA.map((ad, gunIndex) => (
              <tr key={ad}>
                <th
                  scope="row"
                  className="pr-2 text-right text-base font-normal whitespace-nowrap text-ink-500"
                >
                  {/* Yalnızca Pzt/Çar/Cum yazılı: her satıra yazmak
                      ızgarayı gürültüye boğuyor. */}
                  {gunIndex % 2 === 0 ? ad : ""}
                </th>
                {haftalar.map((hafta) => {
                  const gun = hafta[gunIndex];
                  const adet = sayim.get(gun) ?? 0;
                  const gelecek = gun > bugun;
                  return (
                    <td key={gun} className="p-0">
                      <span
                        title={`${trUzunTarih(`${gun}T12:00:00Z`)}: ${adet} kayıt`}
                        className={`block size-4 rounded-[4px] ${
                          gelecek ? "bg-transparent" : KADEME[kademe(adet)]
                        }`}
                      >
                        <span className="sr-only">
                          {trUzunTarih(`${gun}T12:00:00Z`)}: {adet} kayıt
                        </span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-center gap-2 text-base text-ink-600">
        Az
        {KADEME.map((k) => (
          <span key={k} className={`block size-4 rounded-[4px] ${k}`} aria-hidden />
        ))}
        Çok
      </p>
    </div>
  );
}
