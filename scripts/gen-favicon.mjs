// Genera le icone del sito dal logo (src/assets/logo.png), con sfondo trasparente:
//   public/favicon.ico (16/32/48), public/favicon-32.png   -> trasparenti
//   public/apple-touch-icon.png (180)                       -> fondo crema (iOS non supporta la trasparenza)
//   src/assets/logo-transparente.png                         -> logo per l'intestazione del sito
//   node scripts/gen-favicon.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src/assets/logo.png");
const OUT = path.join(ROOT, "public");
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };
const CREMA = { r: 245, g: 231, b: 206, alpha: 1 };

// --- 1. Rende trasparente solo il bianco collegato ai bordi (flood fill) --------------
// Il bianco interno al volto resta intatto. Sul contorno l'opacità sfuma in base alla
// luminosità e il colore viene "ripulito" dal bianco, per evitare l'alone chiaro.
const SOLID_WHITE = 238; // sopra questa soglia (min di R,G,B) il pixel è sfondo
const EDGE_WHITE = 190;  // tra le due soglie, sul contorno: semitrasparente

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const minRGB = (i) => Math.min(data[i], data[i + 1], data[i + 2]);
const bg = new Uint8Array(W * H);
const queue = [];
for (let x = 0; x < W; x++) queue.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) queue.push(y * W, y * W + W - 1);
while (queue.length) {
  const p = queue.pop();
  if (bg[p] || minRGB(p * 4) < SOLID_WHITE) continue;
  bg[p] = 1;
  const x = p % W, y = (p / W) | 0;
  if (x > 0) queue.push(p - 1);
  if (x < W - 1) queue.push(p + 1);
  if (y > 0) queue.push(p - W);
  if (y < H - 1) queue.push(p + W);
}
// Bianco racchiuso dal contorno (es. il triangolo verso il Madagascar): è sfondo anche
// quello, purché abbastanza grande. Le piccole luci degli occhi (3-4 px) restano.
const MIN_ENCLOSED = 20;
const seen = new Uint8Array(W * H);
for (let start = 0; start < W * H; start++) {
  if (bg[start] || seen[start] || minRGB(start * 4) < SOLID_WHITE) continue;
  const region = [], stack = [start];
  seen[start] = 1;
  while (stack.length) {
    const p = stack.pop();
    region.push(p);
    const x = p % W, y = (p / W) | 0;
    for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
      if (q >= 0 && !seen[q] && !bg[q] && minRGB(q * 4) >= SOLID_WHITE) { seen[q] = 1; stack.push(q); }
    }
  }
  if (region.length >= MIN_ENCLOSED) for (const p of region) bg[p] = 1;
}

for (let p = 0; p < W * H; p++) {
  const i = p * 4;
  if (bg[p]) { data[i + 3] = 0; continue; }
  const x = p % W, y = (p / W) | 0;
  const nearBg = (x > 0 && bg[p - 1]) || (x < W - 1 && bg[p + 1]) || (y > 0 && bg[p - W]) || (y < H - 1 && bg[p + W]);
  const m = minRGB(i);
  if (nearBg && m > EDGE_WHITE) {
    const a = Math.max(0.05, (255 - m) / (255 - EDGE_WHITE));
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round((data[i + c] - 255 * (1 - a)) / a)));
    data[i + 3] = Math.round(255 * a);
  }
}
const transparent = await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();

// --- 2. Ritaglio e quadrato trasparente --------------------------------------------
const trimmed = await sharp(transparent).trim({ background: CLEAR, threshold: 1 }).toBuffer();
const { width, height } = await sharp(trimmed).metadata();
fs.writeFileSync(path.join(ROOT, "src/assets/logo-transparente.png"), trimmed);

const side = Math.max(width, height);
const square = await sharp(trimmed)
  .extend({
    top: Math.floor((side - height) / 2), bottom: Math.ceil((side - height) / 2),
    left: Math.floor((side - width) / 2), right: Math.ceil((side - width) / 2),
    background: CLEAR,
  })
  .png()
  .toBuffer();

const png = (size, { padding = 0, background = null } = {}) => {
  let img = sharp(square)
    .resize(size - padding * 2, size - padding * 2, { kernel: "lanczos3" })
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: CLEAR });
  if (background) img = img.flatten({ background });
  return img.png({ compressionLevel: 9 }).toBuffer();
};

// --- 3. ICO con PNG incorporati (supportato da tutti i browser attuali e da Windows) ---
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  const dir = Buffer.alloc(16 * images.length);
  let offset = 6 + dir.length;
  images.forEach(({ size, data }, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e); dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2); dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4); dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(data.length, e + 8); dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const icoImages = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) })));
fs.writeFileSync(path.join(OUT, "favicon.ico"), ico(icoImages));
fs.writeFileSync(path.join(OUT, "favicon-32.png"), await png(32));
// Schermata Home: iOS riempie di nero le aree trasparenti, quindi fondo crema + margine
fs.writeFileSync(path.join(OUT, "apple-touch-icon.png"), await png(180, { padding: 18, background: CREMA }));

for (const f of ["public/favicon.ico", "public/favicon-32.png", "public/apple-touch-icon.png", "src/assets/logo-transparente.png"]) {
  console.log(f, fs.statSync(path.join(ROOT, f)).size, "B");
}
