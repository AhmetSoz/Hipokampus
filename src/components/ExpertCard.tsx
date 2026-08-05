import Link from "next/link";
import { AVAILABILITY_LABEL } from "@/data/experts";
import { needArea } from "@/data/needs";
import type { Expert } from "@/data/types";

/** Doğrulama rozeti. Kamuya YALNIZCA bu ifade gösterilir — kilitli karar. */
export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-base font-semibold text-teal-800 ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path
          d="M9 1.5l2 1.6 2.5-.3 1 2.3 2.2 1.2-.6 2.5.6 2.5-2.2 1.2-1 2.3-2.5-.3L9 16.5l-2-1.6-2.5.3-1-2.3L1.3 11.7l.6-2.5-.6-2.5 2.2-1.2 1-2.3 2.5.3z"
          fill="currentColor"
          opacity="0.16"
        />
        <path
          d="M5.6 9.2l2.2 2.2 4.6-4.6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      Hipokampüs doğrulama sürecini tamamladı
    </span>
  );
}

export function AvailabilityTag({ expert }: { expert: Expert }) {
  const busy = expert.availability === "dolu";
  return (
    <span
      className={`inline-flex items-center gap-2 text-base ${
        busy ? "text-ink-500" : "text-teal-700"
      }`}
    >
      <span
        aria-hidden
        className={`size-2.5 rounded-full ${
          busy ? "bg-ink-300" : "bg-teal-500"
        }`}
      />
      {AVAILABILITY_LABEL[expert.availability]}
    </span>
  );
}

/** Baş harflerden oluşan sade bir işaret. Uydurma fotoğraf kullanılmıyor. */
function Monogram({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className="flex size-14 shrink-0 items-center justify-center rounded-full bg-teal-700 font-[family-name:var(--font-display)] text-xl text-white"
    >
      {initials}
    </span>
  );
}

export function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <article className="rounded-xl border border-ink-200 bg-white p-6 transition-colors hover:border-teal-300">
      <div className="flex items-start gap-4">
        <Monogram name={expert.name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl leading-tight">
            <Link
              href={`/uzmanlar/${expert.slug}`}
              className="hover:text-teal-700"
            >
              {expert.name}
            </Link>
          </h3>
          <p className="text-ink-600">
            {expert.field} · {expert.city}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-2 border-y border-ink-100 py-4 sm:grid-cols-2">
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-base text-ink-500">Deneyim</dt>
          <dd className="font-semibold text-ink-900">
            {expert.experienceYears} yıl
          </dd>
        </div>
        <div className="flex justify-between gap-4 sm:block">
          <dt className="text-base text-ink-500">Yanıt süresi</dt>
          <dd className="font-semibold text-ink-900">{expert.responseTime}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <AvailabilityTag expert={expert} />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {expert.needAreas.slice(0, 3).map((id) => (
          <li
            key={id}
            className="rounded-md bg-sand-100 px-3 py-1 text-base text-ink-700"
          >
            {needArea(id).label}
          </li>
        ))}
        {expert.needAreas.length > 3 && (
          <li className="px-1 py-1 text-base text-ink-500">
            +{expert.needAreas.length - 3}
          </li>
        )}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <VerifiedBadge />
        <Link
          href={`/uzmanlar/${expert.slug}`}
          className="inline-flex min-h-[3rem] items-center rounded-lg border-2 border-teal-700 px-5 font-semibold text-teal-800 transition-colors hover:bg-teal-50"
        >
          Profili görün
        </Link>
      </div>
    </article>
  );
}
