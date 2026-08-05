import Link from "next/link";

export function Container({
  children,
  className = "",
  width = "default",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
}) {
  const max =
    width === "narrow"
      ? "max-w-2xl"
      : width === "wide"
        ? "max-w-6xl"
        : "max-w-4xl";
  return (
    <div className={`mx-auto w-full ${max} px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className = "",
  tone = "paper",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "warm" | "sky" | "teal";
}) {
  const tones = {
    paper: "bg-paper",
    warm: "bg-paper-warm",
    sky: "bg-linear-to-b from-white to-sky-100",
    teal: "bg-linear-to-br from-teal-800 to-teal-900 text-teal-50",
  } as const;
  return (
    <section className={`py-16 sm:py-24 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "quiet" | "onDark";
  className?: string;
  /** Sağda ince bir ok göster; hover'da bir tık kayar. */
  withArrow?: boolean;
};

/*
 * Dokunma hedefleri bilerek büyük: min-h 3.25rem. İleri yaştaki kullanıcılar
 * da bu arayüzü doğrudan kullanabilmeli.
 *
 * Etkileşim: hafif kalkma (hover'da -1px + gölge büyür), basınca geri çöker
 * (active:scale). Cafcaflı değil — 150-220ms, tek yönlü, fiziksel bir his.
 */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  withArrow = false,
}: ButtonProps) {
  const base =
    "group inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-xl px-7 text-lg font-semibold active:scale-[0.97]";
  const variants = {
    primary:
      "bg-teal-700 text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)]",
    secondary:
      "border-2 border-teal-700 bg-white text-teal-800 hover:-translate-y-px hover:border-teal-800 hover:bg-teal-50 hover:shadow-[var(--shadow-card)]",
    onDark:
      "bg-white text-teal-800 shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-sky-100 hover:shadow-[var(--shadow-pop)]",
    quiet: "text-teal-800 underline underline-offset-4 hover:text-teal-600",
  } as const;

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {withArrow && (
        <svg
          aria-hidden
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <path
            d="M4 9h9.5M9 4.5 14 9l-5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )}
    </Link>
  );
}

export function Eyebrow({
  children,
  tone = "teal",
}: {
  children: React.ReactNode;
  tone?: "teal" | "onDark";
}) {
  const color = tone === "onDark" ? "text-sky-300" : "text-teal-600";
  return (
    <p
      className={`mb-4 flex items-center gap-2 text-base font-semibold tracking-[0.14em] uppercase ${color}`}
    >
      <span aria-hidden className="h-px w-6 bg-current opacity-60" />
      {children}
    </p>
  );
}

/** Kart yüzeyi — dinlenirken sakin, hover'da bir tık kalkan. */
export function Card({
  children,
  className = "",
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-200 bg-white shadow-[var(--shadow-soft)] ${
        interactive
          ? "hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-[var(--shadow-card)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Uyarı / sınır kutusu. Ne olmadığımızı söylediğimiz her yerde kullanılır. */
export function Notice({
  title,
  children,
  tone = "sand",
}: {
  title?: string;
  children: React.ReactNode;
  tone?: "sand" | "teal";
}) {
  const tones = {
    sand: "border-ink-300 bg-paper-warm text-ink-800",
    teal: "border-teal-300 bg-teal-50 text-ink-800",
  } as const;
  return (
    <div className={`rounded-xl border-l-4 p-6 shadow-[var(--shadow-soft)] ${tones[tone]}`}>
      {title && <p className="mb-2 font-semibold text-ink-900">{title}</p>}
      <div className="[&_p+p]:mt-3">{children}</div>
    </div>
  );
}

/**
 * Örnek veri uyarısı.
 *
 * Prototipte gösterilen uzmanlar, danışanlar ve mesajlar temsilîdir.
 * Kullanıcının bunu her gördüğü yerde bilmesi gerekiyor — prototip,
 * alınmamış kararları alınmış gibi göstermemeli.
 */
export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-5 py-4 text-base text-ink-700">
      <span aria-hidden className="mt-0.5 shrink-0 font-semibold text-ink-900">
        Örnek
      </span>
      <span>
        {children ??
          "Bu sayfadaki kişiler ve bilgiler temsilîdir. Hipokampüs geliştirme aşamasındadır; platformda henüz gerçek uzman bulunmuyor."}
      </span>
    </p>
  );
}

/** Numaralı adım kartı — "nasıl çalışır" akışında kullanılır. */
export function StepCard({
  step,
  title,
  children,
  meta,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  meta?: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-ink-200 bg-white p-7 shadow-[var(--shadow-soft)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[var(--shadow-lift)]">
      <span
        aria-hidden
        className="mb-4 flex size-11 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-teal-800 font-[family-name:var(--font-display)] text-xl text-white shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-110"
      >
        {step}
      </span>
      <h3 className="mb-2 text-xl">{title}</h3>
      <div className="text-ink-700">{children}</div>
      {meta && (
        <p className="mt-4 border-t border-ink-100 pt-4 text-base font-semibold text-teal-700">
          {meta}
        </p>
      )}
    </div>
  );
}
