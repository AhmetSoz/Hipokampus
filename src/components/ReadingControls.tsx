"use client";

import { useSyncExternalStore } from "react";

/**
 * Yazı boyutu ve hareket denetimleri.
 *
 * Neden arayüzde görünür: araştırma, bu kullanıcı grubunun çoğunun tarayıcı
 * yakınlaştırmasını ve işletim sistemi hareket ayarını bilmediğini gösteriyor.
 * Ayarlar menüsüne gömmek, hiç koymamakla aynı kapıya çıkıyor.
 *
 * Doğruluk kaynağı React durumu değil, <html> üzerindeki veri öznitelikleri.
 * Tercih sayfa açılmadan önce layout.tsx'teki satır içi betikle uygulanıyor;
 * bileşen bunu `useSyncExternalStore` ile okuyor. Böylece hem yanıp sönme
 * olmuyor hem de sunucu/istemci uyuşmazlığı çıkmıyor.
 */

const SIZES = [
  { id: "normal", label: "Normal" },
  { id: "buyuk", label: "Büyük" },
  { id: "cok-buyuk", label: "Çok büyük" },
] as const;

type SizeId = (typeof SIZES)[number]["id"];

/* DOM yazma işlemleri bilerek bileşenin dışında — bunlar React durumu değil,
   dış bir sistem (belge kökü) üzerinde yapılan değişiklikler. */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-text-size", "data-motion"],
  });
  return () => observer.disconnect();
}

function readSize(): SizeId {
  return (document.documentElement.dataset.textSize as SizeId) || "normal";
}

function readMotion(): boolean {
  return document.documentElement.dataset.motion === "az";
}

function writeSize(next: SizeId) {
  document.documentElement.dataset.textSize = next;
  try {
    localStorage.setItem("hk-text-size", next);
  } catch {
    /* gizli sekmede localStorage kapalı olabilir; tercih o oturumda yaşar */
  }
}

function writeMotion(calm: boolean) {
  document.documentElement.dataset.motion = calm ? "az" : "normal";
  try {
    localStorage.setItem("hk-motion", calm ? "az" : "normal");
  } catch {
    /* yukarıdaki ile aynı */
  }
}

export function ReadingControls({ compact = false }: { compact?: boolean }) {
  const size = useSyncExternalStore(subscribe, readSize, () => "normal" as SizeId);
  const calmMotion = useSyncExternalStore(subscribe, readMotion, () => false);

  return (
    <div
      className={`flex flex-wrap items-center ${
        compact ? "gap-x-5 gap-y-2" : "gap-x-6 gap-y-4"
      }`}
    >
      <fieldset className="flex items-center gap-3">
        <legend className="sr-only">Yazı boyutu</legend>
        <span aria-hidden className="text-base text-ink-600">
          Yazı boyutu
        </span>
        <div className="flex gap-1.5">
          {SIZES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => writeSize(s.id)}
              aria-pressed={size === s.id}
              className={`flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center rounded-md border-2 transition-colors ${
                size === s.id
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-ink-200 bg-white text-ink-800 hover:border-teal-400"
              }`}
              style={{ fontSize: `${0.95 + i * 0.22}rem` }}
            >
              <span aria-hidden>A</span>
              <span className="sr-only">{s.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-3 text-base text-ink-700">
        <input
          type="checkbox"
          checked={calmMotion}
          onChange={(e) => writeMotion(e.target.checked)}
          className="size-5 accent-teal-700"
        />
        Hareketi azalt
      </label>
    </div>
  );
}
