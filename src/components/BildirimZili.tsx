"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { tumunuOkunduIsaretle } from "@/app/actions/notifications";
import type { Bildirim } from "@/data/notifications";
import { trFormat } from "@/lib/zaman";

/**
 * Bildirim zili — başlıkta, okunmamış sayısıyla.
 *
 * Konum kararı: mesaj kutusu sağ altta, yardım panel başlığında, zil ise
 * site başlığında. Üçünü aynı köşeye yığmak sahibinin şikâyet ettiği
 * sıkışıklığı geri getirirdi.
 *
 * Açıldığında hepsi okundu sayılır. Tek tek okundu işaretlemek, kullanıcının
 * ilgilenmediği bir muhasebe işi; burada amaç "yeni bir şey var mı?"
 * sorusunu yanıtlamak.
 */

function ne_zaman(iso: string) {
  const fark = Date.now() - new Date(iso).getTime();
  const dk = Math.round(fark / 60000);
  if (dk < 1) return "az önce";
  if (dk < 60) return `${dk} dk önce`;
  const sa = Math.round(dk / 60);
  if (sa < 24) return `${sa} saat önce`;
  return trFormat(iso, {
    day: "numeric",
    month: "long",
  });
}

export function BildirimZili({
  bildirimler,
  okunmamis,
}: {
  bildirimler: Bildirim[];
  okunmamis: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const disariTikla = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const escBas = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", disariTikla);
    document.addEventListener("keydown", escBas);
    return () => {
      document.removeEventListener("mousedown", disariTikla);
      document.removeEventListener("keydown", escBas);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          const acilacak = !open;
          setOpen(acilacak);
          // Açılışta okundu say — sayı hemen sıfırlanır.
          if (acilacak && okunmamis > 0) void tumunuOkunduIsaretle();
        }}
        aria-expanded={open}
        aria-label={
          okunmamis > 0 ? `Bildirimler, ${okunmamis} yeni` : "Bildirimler"
        }
        className="relative flex size-11 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-[background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease-calm)] hover:border-teal-300 hover:bg-teal-50"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none">
          <path
            d="M5 8.5a5 5 0 0 1 10 0c0 3.2.7 4.6 1.4 5.4.4.4.1 1.1-.5 1.1H4.1c-.6 0-.9-.7-.5-1.1C4.3 13.1 5 11.7 5 8.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M8.2 17a2 2 0 0 0 3.6 0"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        {okunmamis > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-[1.35rem] items-center justify-center rounded-full bg-teal-700 px-1 text-base font-semibold text-white">
            {okunmamis > 9 ? "9+" : okunmamis}
          </span>
        )}
      </button>

      {open && (
        <div className="hk-slide-down absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-ink-200 bg-paper shadow-[var(--shadow-pop)]">
          <p className="border-b border-ink-100 px-5 py-3 font-semibold text-ink-900">
            Bildirimler
          </p>
          {bildirimler.length === 0 ? (
            <p className="px-5 py-6 text-ink-600">Henüz bildiriminiz yok.</p>
          ) : (
            <ul className="max-h-[24rem] divide-y divide-ink-100 overflow-y-auto">
              {bildirimler.map((b) => (
                <li key={b.id}>
                  <Link
                    href={b.href}
                    onClick={() => setOpen(false)}
                    className={`block px-5 py-4 hover:bg-teal-50 ${
                      b.okundu ? "" : "bg-sky-50"
                    }`}
                  >
                    <p className="font-semibold text-ink-900">{b.title}</p>
                    {b.body && (
                      <p className="mt-0.5 line-clamp-2 text-base text-ink-700">
                        {b.body}
                      </p>
                    )}
                    <p className="mt-1 text-base text-ink-500">
                      {ne_zaman(b.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
