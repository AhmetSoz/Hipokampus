"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";

const nav = [
  { href: "/nasil-calisir", label: "Nasıl çalışır" },
  { href: "/dogrulama", label: "Uzman doğrulama" },
  { href: "/uzman-basvurusu", label: "Uzman başvurusu" },
];

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
          <Logo className="h-14 sm:h-16" priority />
        </Link>

        <nav aria-label="Ana menü" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-4 py-2.5 transition-colors ${
                  active
                    ? "text-teal-800 underline decoration-sand-400 decoration-2 underline-offset-8"
                    : "text-ink-700 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/ihtiyac-formu"
            className="ml-3 inline-flex min-h-[3rem] items-center rounded-lg bg-teal-700 px-6 font-semibold text-white transition-colors hover:bg-teal-800"
          >
            İhtiyacınızı netleştirin
          </Link>
        </nav>

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
          className="border-t border-ink-100 bg-paper px-6 pb-6 md:hidden"
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
            href="/ihtiyac-formu"
            onClick={() => setOpen(false)}
            className="mt-5 inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-lg bg-teal-700 px-6 font-semibold text-white"
          >
            İhtiyacınızı netleştirin
          </Link>
        </nav>
      )}
    </header>
  );
}
