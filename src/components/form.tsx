/**
 * Form primitifleri.
 *
 * NEDEN: `min-h-[3rem] w-full rounded-xl border-2 border-ink-200 …` sınıf
 * dizesi altı ayrı dosyada elle kopyalanmıştı; iki kopya birbirinden
 * ayrılınca form alanları farklı görünüyordu. Daha önemlisi, kopyaların
 * çoğunda etiket yoktu — yalnızca `placeholder`. Placeholder bir etiket
 * değildir (WCAG 3.3.2): odaklanınca kaybolur, ekran okuyucu güvenilir
 * biçimde okumaz ve kontrastı düşüktür.
 *
 * `Alan` bu yüzden etiketi ZORUNLU tutuyor. Görsel olarak gizlemek
 * mümkün (`etiketGizli`), ama etiketsiz alan üretmek mümkün değil.
 *
 * `ui.tsx` sunum bileşenlerini taşıyor; bunlar girdi bileşenleri. Ayrı
 * dosyada çünkü `ui.tsx` tamamen sunucu tarafı kalabilirken buradaki
 * bazı bileşenler istemci davranışı taşıyor.
 */

const GIRDI =
  "w-full rounded-xl border-2 border-ink-200 bg-white px-3 text-ink-900 " +
  "transition-[border-color,box-shadow] duration-[var(--dur-fast)] " +
  "focus:border-teal-600 aria-[invalid=true]:border-danger-600";

let sayac = 0;
/** Kararlı olması gerekmeyen yerel kimlik. `useId` gerektirmeyen sunucu
 *  bileşenlerinde de çalışsın diye basit bir sayaç. */
function yerelId(onEk: string): string {
  sayac += 1;
  return `${onEk}-${sayac}`;
}

/**
 * Etiket + kontrol + açıklama + hata sarmalayıcısı.
 *
 * `aria-describedby` ve `aria-invalid` bağlamayı kendisi üstlenir; çağıran
 * bunları elle kurmayı unutamaz.
 */
export function Alan({
  etiket,
  children,
  id,
  aciklama,
  hata,
  etiketGizli = false,
  className = "",
}: {
  etiket: string;
  /** Kontrolü, kendisine geçilen id/aria niteliklerini alarak render eder. */
  children: (nitelikler: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: true;
    className: string;
  }) => React.ReactNode;
  id?: string;
  aciklama?: string;
  hata?: string;
  etiketGizli?: boolean;
  className?: string;
}) {
  const alanId = id ?? yerelId("alan");
  const aciklamaId = aciklama ? `${alanId}-aciklama` : undefined;
  const hataId = hata ? `${alanId}-hata` : undefined;
  const describedBy = [aciklamaId, hataId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={alanId}
        className={
          etiketGizli
            ? "sr-only"
            : "mb-1.5 block font-semibold text-ink-900"
        }
      >
        {etiket}
      </label>
      {aciklama && (
        <p id={aciklamaId} className="mb-1.5 text-base text-ink-600">
          {aciklama}
        </p>
      )}
      {children({
        id: alanId,
        "aria-describedby": describedBy,
        "aria-invalid": hata ? true : undefined,
        className: GIRDI,
      })}
      {hata && (
        <p id={hataId} className="mt-1.5 font-semibold text-danger-700">
          {hata}
        </p>
      )}
    </div>
  );
}

type GirdiProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Tek satırlık girdi. Dokunma hedefi 3rem — ileri yaş kullanıcı için. */
export function Girdi({ className = "", ...rest }: GirdiProps) {
  return <input {...rest} className={`min-h-[3rem] ${className}`} />;
}

export function MetinAlani({
  className = "",
  rows = 4,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} rows={rows} className={`py-3 ${className}`} />;
}

export function Secim({
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...rest} className={`min-h-[3rem] ${className}`}>
      {children}
    </select>
  );
}

/**
 * Form düğmesi. `ui.tsx`'teki `ButtonLink` yalnızca `Link` sarar; gerçek
 * bir `<button type="submit">` primitifi yoktu ve her formda elle
 * yazılıyordu.
 */
export function Dugme({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
}) {
  const tonlar = {
    primary:
      "bg-teal-700 text-white hover:bg-teal-800 hover:shadow-[var(--shadow-pop)]",
    secondary:
      "border-2 border-ink-300 bg-white text-ink-800 hover:border-teal-300 hover:bg-teal-50",
    quiet: "text-teal-800 hover:bg-teal-50",
  } as const;
  return (
    <button
      {...rest}
      className={`inline-flex min-h-[3rem] items-center justify-center rounded-xl px-6 font-semibold shadow-[var(--shadow-soft)] transition-[transform,background-color,box-shadow] duration-[var(--dur-fast)] hover:-translate-y-px active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${tonlar[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Geniş tabloları mobilde kullanılabilir kılar.
 *
 * Mevcut tablolar `min-w-[36rem]` + `overflow-x-auto` deseniyle yazılmıştı:
 * 375px ekranda içeriğin yarıdan fazlası yatay kaydırmada kalıyor ve
 * kaydırınca satırın hangi kişiye/tarihe ait olduğu görünmez oluyordu.
 *
 * Kaydırma kabı klavyeyle odaklanabilir olmalı (aksi hâlde klavye
 * kullanıcısı gizli içeriğe ulaşamaz) — `tabIndex={0}` ve `role="region"`
 * bunun için.
 */
export function TabloSarmali({
  children,
  etiket,
  className = "",
}: {
  children: React.ReactNode;
  /** Kaydırma bölgesinin adı; ekran okuyucu bunu duyurur. */
  etiket: string;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={etiket}
      tabIndex={0}
      className={`overflow-x-auto focus-visible:outline-3 focus-visible:outline-teal-700 ${className}`}
    >
      {children}
    </div>
  );
}
