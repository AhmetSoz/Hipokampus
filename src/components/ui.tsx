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
    teal: "bg-teal-800 text-teal-50",
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
  variant?: "primary" | "secondary" | "quiet";
  className?: string;
};

/* Dokunma hedefleri bilerek büyük: min-h 3.25rem.
   İleri yaştaki kullanıcılar da bu arayüzü doğrudan kullanabilmeli. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-lg px-7 text-lg font-semibold transition-colors duration-200";
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800",
    secondary:
      "border-2 border-teal-700 bg-white text-teal-800 hover:bg-teal-50",
    quiet: "text-teal-800 underline underline-offset-4 hover:text-teal-600",
  } as const;

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-sm font-semibold tracking-[0.14em] text-teal-600 uppercase">
      {children}
    </p>
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
    sand: "border-sand-400 bg-sand-100 text-ink-800",
    teal: "border-teal-300 bg-teal-50 text-ink-800",
  } as const;
  return (
    <div className={`rounded-lg border-l-4 p-6 ${tones[tone]}`}>
      {title && (
        <p className="mb-2 font-semibold text-ink-900">{title}</p>
      )}
      <div className="[&_p+p]:mt-3">{children}</div>
    </div>
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
    <div className="relative rounded-xl border border-ink-200 bg-white p-7">
      <span
        aria-hidden
        className="mb-4 flex size-11 items-center justify-center rounded-full bg-teal-700 font-[family-name:var(--font-display)] text-xl text-white"
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
