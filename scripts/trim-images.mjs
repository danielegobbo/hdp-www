// Rimuove i bordi bianchi incorporati nelle foto (src/assets/img/*.jpg).
//   node scripts/trim-images.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/assets/img");
for (const f of fs.readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f))) {
  const p = path.join(dir, f);
  const before = await sharp(p).metadata();
  const buf = await sharp(p).trim({ background: "#ffffff", threshold: 25 }).jpeg({ quality: 88 }).toBuffer({ resolveWithObject: true });
  if (buf.info.width !== before.width || buf.info.height !== before.height) {
    fs.writeFileSync(p, buf.data);
    console.log(`${f}: ${before.width}x${before.height} -> ${buf.info.width}x${buf.info.height}`);
  }
}
