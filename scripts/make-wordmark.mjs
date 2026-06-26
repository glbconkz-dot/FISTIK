import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const input = join(root, 'public/logo-source.png');
const output = join(root, 'public/logo-wordmark.png');

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  const isGreenBg = g > 145 && r > 130 && b > 90 && Math.abs(g - r) < 50 && g >= b - 20;
  const isLightHalo = g > 170 && r > 160 && b > 115;

  if (isGreenBg || isLightHalo) {
    data[i + 3] = 0;
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ threshold: 1 })
  .png()
  .toFile(output);

const meta = await sharp(output).metadata();
console.log('Wrote', output, `${meta.width}x${meta.height}`);
