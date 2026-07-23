import sharp from 'sharp';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public/logo-wordmark.png');
const backup = join(root, 'public/logo-wordmark-original.png');
const source = existsSync(backup) ? backup : out;

/** Kum beji — açık kum / krem beji (zeytin yeşili header üzerinde bronza kaçmasın) */
const SAND = { r: 0xef, g: 0xe6, b: 0xd4 }; // #efe6d4
const DILATE = 3;

const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const src = Buffer.from(data);
const alpha = new Uint8Array(width * height);

for (let i = 0, p = 0; i < src.length; i += 4, p++) {
  alpha[p] = src[i + 3];
}

/** Alpha dilate — hafif kalınlık */
const dilated = new Uint8Array(alpha);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = y * width + x;
    if (alpha[i] > 0) continue;
    let maxA = 0;
    for (let dy = -DILATE; dy <= DILATE; dy++) {
      for (let dx = -DILATE; dx <= DILATE; dx++) {
        if (dx * dx + dy * dy > DILATE * DILATE) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        maxA = Math.max(maxA, alpha[ny * width + nx]);
      }
    }
    dilated[i] = maxA;
  }
}

const outBuf = Buffer.alloc(src.length);
for (let i = 0, p = 0; i < outBuf.length; i += 4, p++) {
  const a = dilated[p];
  outBuf[i] = SAND.r;
  outBuf[i + 1] = SAND.g;
  outBuf[i + 2] = SAND.b;
  outBuf[i + 3] = a;
}

if (!existsSync(backup)) {
  copyFileSync(source, backup);
}

await sharp(outBuf, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(`OK ${out} ${meta.width}x${meta.height} sand=#efe6d4 dilate=${DILATE}`);
