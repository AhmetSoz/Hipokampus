/**
 * Marka varlıklarını hazırlar.
 *
 * Kaynak (tasarımcı teslimi, `logo/` klasöründe):
 *   logo(2).png — saydam zeminli, koyu mürekkep kilit (lockup)
 *   logo(3).png — düz petrol zemin üzerinde beyaz kilit + kum rengi uç nokta
 *
 * Üretilen (`public/brand/`):
 *   logo-lockup.png          sembol + kelime, petrol turkuaz, saydam
 *   logo-lockup-reverse.png  sembol + kelime, beyaz + kum uç nokta, saydam
 *   logo-symbol.png          yalnız sembol, petrol turkuaz, saydam
 *   logo-symbol-reverse.png  yalnız sembol, beyaz + kum uç nokta, saydam
 *   icon.png                 favicon/PWA için kare sembol
 *
 * Çalıştırma:  node scripts/prepare-logo.mjs
 * Kaynak dosyalar değişmediği sürece yeniden çalıştırmak gerekmez.
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "public/brand";
const TEAL = [14, 92, 99]; // #0E5C63

await mkdir(OUT, { recursive: true });

/* ------------------------------------------------------------------ */

async function loadRGBA(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/**
 * Düz zeminli görselden alfa üretir ve kenar piksellerindeki zemin
 * karışımını geri çözer (unmix). Aksi hâlde beyaz çizginin kenarında
 * petrol renginde bir hâle kalır.
 */
function keyOutBackground({ data, w, h }, bg, ramp = 150) {
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4],
      g = data[i * 4 + 1],
      b = data[i * 4 + 2];
    const d = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
    const a = Math.min(1, d / ramp);
    if (a <= 0.004) {
      out[i * 4 + 3] = 0;
      continue;
    }
    // kaynak = a * gerçekRenk + (1 - a) * zemin  →  gerçekRenk'i çöz
    out[i * 4] = clamp255((r - bg[0] * (1 - a)) / a);
    out[i * 4 + 1] = clamp255((g - bg[1] * (1 - a)) / a);
    out[i * 4 + 2] = clamp255((b - bg[2] * (1 - a)) / a);
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return { data: out, w, h };
}

const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));

/** Saydam görselin rengini tek renge boyar, alfayı korur. */
function tint({ data, w, h }, rgb) {
  const out = Buffer.from(data);
  for (let i = 0; i < w * h; i++) {
    if (out[i * 4 + 3] === 0) continue;
    out[i * 4] = rgb[0];
    out[i * 4 + 1] = rgb[1];
    out[i * 4 + 2] = rgb[2];
  }
  return { data: out, w, h };
}

/** Alfası olan piksellerin sınırlayıcı kutusu. */
function bbox({ data, w, h }, minAlpha = 8) {
  let x0 = w,
    y0 = h,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] >= minAlpha) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

/**
 * Sembolün nerede bittiğini bulur.
 *
 * Boş sütun aramak burada işe yaramıyor: kuyruk izi kelime markasının
 * altından geçtiği için ikisinin arasında hiç boş sütun yok. Bunun yerine
 * sütun başına DOLU SATIR SAYISI'na bakıyoruz — denizatı gövdesi dikeyde
 * yüksek, iz çizgisi ise yalnızca birkaç piksel kalınlığında. Gövde
 * bittikten sonra ilk kalıcı "ince" bölge sembolün sınırıdır.
 */
function findSymbolWidth({ data, w }, box, minAlpha = 8) {
  const density = new Array(box.width).fill(0);
  for (let x = 0; x < box.width; x++) {
    let count = 0;
    for (let y = 0; y < box.height; y++) {
      if (data[((box.top + y) * w + box.left + x) * 4 + 3] >= minAlpha) count++;
    }
    density[x] = count;
  }

  const thin = box.height * 0.1; // "yalnızca iz çizgisi" eşiği
  const need = Math.max(8, Math.round(box.width * 0.03)); // kalıcılık
  let run = 0;
  for (let x = Math.round(box.width * 0.1); x < box.width; x++) {
    if (density[x] < thin) {
      run++;
      if (run >= need) return x - run + Math.round(box.width * 0.01);
    } else {
      run = 0;
    }
  }
  return Math.round(box.width * 0.28);
}

async function write(img, box, file, targetHeight) {
  const pad = Math.round(box.height * 0.04);
  const region = {
    left: Math.max(0, box.left - pad),
    top: Math.max(0, box.top - pad),
    width: Math.min(img.w - box.left + pad, box.width + pad * 2),
    height: Math.min(img.h - box.top + pad, box.height + pad * 2),
  };
  await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } })
    .extract(region)
    .resize({ height: targetHeight, fit: "inside", kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${file}`);
  console.log(`  ✓ ${file}`);
}

/* ------------------------------------------------------------------ */
/* 1) Açık zemin için: logo(2) zaten saydam, petrol turkuaza boyanır    */

console.log("Açık zemin varyantı — kaynak: logo(2).png");
const dark = await loadRGBA("logo/logo(2).png");
const tealed = tint(dark, TEAL);
const darkBox = bbox(tealed);
const darkSymbolW = findSymbolWidth(tealed, darkBox);

await write(tealed, darkBox, "logo-lockup.png", 220);
await write(
  tealed,
  { ...darkBox, width: darkSymbolW },
  "logo-symbol.png",
  320,
);

/* ------------------------------------------------------------------ */
/* 2) Koyu/petrol zemin için: logo(3)'ün zemini ayrılır                 */

console.log("Ters zemin varyantı — kaynak: logo(3).png");
const rev = await loadRGBA("logo/logo(3).png");
// Zemin rengi köşelerden okunur (düz petrol).
const bg = [rev.data[0], rev.data[1], rev.data[2]];
console.log(`  zemin rengi: rgb(${bg.join(",")})`);
const keyed = keyOutBackground(rev, bg);
const revBox = bbox(keyed, 24);
const revSymbolW = findSymbolWidth(keyed, revBox, 24);

await write(keyed, revBox, "logo-lockup-reverse.png", 220);
await write(
  keyed,
  { ...revBox, width: revSymbolW },
  "logo-symbol-reverse.png",
  320,
);

/* ------------------------------------------------------------------ */
/* 3) Simge (favicon / PWA) — kare tuval, petrol turkuaz sembol         */

const symbolBox = { ...darkBox, width: darkSymbolW };
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

// Önce sembolü 400 px'e sığdır, sonra 512'lik kare tuvale ortala.
const symbolBuf = await sharp(tealed.data, {
  raw: { width: tealed.w, height: tealed.h, channels: 4 },
})
  .extract(symbolBox)
  .resize({ width: 400, height: 400, fit: "inside", kernel: "lanczos3" })
  .png()
  .toBuffer();

await sharp({
  create: { width: 512, height: 512, channels: 4, background: transparent },
})
  .composite([{ input: symbolBuf, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/icon.png`);
console.log("  ✓ icon.png (512×512)");

console.log("\nTamam. Varlıklar public/brand/ altında.");
