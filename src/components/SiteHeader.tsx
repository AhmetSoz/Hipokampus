"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { ReadingControls } from "./ReadingControls";

const nav = [
  { href: "/nasil-calisir", label: "Nasıl çalışır" },
  { href: "/uzmanlar", label: "Uzmanlar" },
  { href: "/dogrulama", label: "Doğrulama" },
  { href: "/uzman", label: "Uzman mısınız?" },
];

/** "Aa" simgesiyle açılan küçük panel. Okuma denetimleri her sayfada aynı
    yerden erişilebilir kalır (WCAG 3.2.6 — yardım tutarlılığı) ama artık
    kalıcı bir şerit değil, isteyince açılan bir görünüm. */
function ReadingControlsPopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Okuma ayarları: yazı boyutu ve hareket"
        className={`flex size-11 items-center justify-center rounded-full border text-base font-semibold ${
          open
            ? "border-teal-700 bg-teal-50 text-teal-800"
            : "border-ink-200 bg-white text-ink-700 hover:border-teal-300 hover:text-teal-800"
        }`}
      >
        Aa
      </button>

      {open && (
        <div
          role="region"
          aria-label="Okuma ayarları"
          className="hk-slide-down absolute top-[calc(100%+0.75rem)] right-0 z-50 w-72 rounded-2xl border border-ink-200 bg-white p-5 shadow-[var(--shadow-lift)]"
        >
          <ReadingControls />
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-8">
        <Link
          href="/"
          className="transition-opacity hover:opacity-80"
          aria-label="Hipokampüs ana sayfa"
          onClick={() => setOpen(false)}
        >
          <Logo className="h-14 sm:h-16" priority animate />
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-4 py-2.5 ${
                  active
                    ? "text-teal-800"
                    : "text-ink-700 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute right-4 -bottom-0.5 left-4 h-0.5 rounded-full bg-teal-600"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ReadingControlsPopover />
          <Link
            href="/ihtiyac-formu"
            className="inline-flex min-h-[3rem] items-center rounded-xl bg-teal-700 px-6 font-semibold text-white shadow-[var(--shadow-soft)] hover:-translate-y-px hover:bg-teal-800 hover:shadow-[var(--shadow-pop)] active:scale-[0.97]"
          >
            İhtiyacınızı netleştirin
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobil-menu"
          className="inline-flex size-12 items-center justify-center rounded-lg border border-ink-200 text-ink-800 md:hidden"
        >
          <span className="sr-only">{open ? "Menüyü kapat" : "Menüyü aç"}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
            {open ? (
              <path
                d="M4 4l14 14M18 4L4 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h16M3 11h16M3 16h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobil-menu"
          aria-label="Ana menü"
          className="hk-slide-down border-t border-ink-100 bg-paper px-6 pb-6 md:hidden"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-ink-100 py-4 text-ink-800"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/giris"
            onClick={() => setOpen(false)}
            className="block border-b border-ink-100 py-4 text-ink-800"
          >
            Demo paneli
          </Link>

          <div className="mt-5 mb-2">
            <ReadingControls />
          </div>

          <Link
            href="/ihtiyac-formu"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-xl bg-teal-700 px-6 font-semibold text-white active:scale-[0.97]"
          >
            İhtiyacınızı netleştirin
          </Link>
        </nav>
      )}
    </header>
  );
}
