import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const srcDir =
  'C:/Users/okan/.cursor/projects/c-Users-okan-Desktop-project-fistik/assets';
const dstDir = join(process.cwd(), 'public/products/boreks');
const files = readdirSync(srcDir);

function find(part) {
  const f = files.find((n) => n.includes(part));
  if (!f) throw new Error('missing ' + part);
  return join(srcDir, f);
}

/**
 * Aggressive zoom on food — plate rim WILL clip (user OK).
 */
async function zoomCenter(inputPath, outputPath) {
  const meta = await sharp(inputPath).metadata();
  const W = meta.width;
  const H = meta.height;
  const landscape = W >= H;

  let cw;
  let ch;
  let left;
  let top;

  if (landscape) {
    // Tight on pastry (upper-center of plate in these shots)
    const short = Math.min(W, H);
    ch = Math.round(short * 0.58);
    cw = Math.round(ch * (3 / 4));
    left = Math.round(W * 0.46 - cw / 2);
    top = Math.round(H * 0.40 - ch / 2);
  } else {
    // Portrait: plate low — flush to bottom, heavy zoom
    cw = Math.round(W * 0.78);
    ch = Math.round(cw * (4 / 3));
    left = Math.round((W - cw) / 2);
    top = Math.round(H - ch - H * 0.02);
  }

  left = Math.max(0, Math.min(left, W - cw));
  top = Math.max(0, Math.min(top, H - ch));
  cw = Math.min(cw, W - left);
  ch = Math.min(ch, H - top);

  await sharp(inputPath)
    .extract({ left, top, width: cw, height: ch })
    .png()
    .toFile(outputPath);

  console.log(
    basename(outputPath),
    `${W}x${H}`,
    '->',
    `${cw}x${ch}`,
    `lt=${left},${top}`,
    landscape ? 'land' : 'port'
  );
}

const jobs = [
  ['Meat_Borek-909a', 'borek-meat.png'],
  ['Meat_Borek1-', 'borek-meat-alt.png'],
  ['Spinach_Borek-b4bb', 'borek-spinach.png'],
  ['Spinach_Borek1-', 'borek-spinach-alt.png'],
  ['Cheese_Borek-cc38', 'borek-brinza.png'],
  ['Cheese_Borek1-', 'borek-brinza-alt.png'],
  ['Chicken_Borek-07f4', 'borek-chicken.png'],
  ['Chicken_Borek1-', 'borek-chicken-alt.png'],
  ['Lentil_Borek-fe8c', 'borek-lentils.png'],
  ['Lentil_Borek1-', 'borek-lentils-alt.png'],
  ['Potato_Borek-67ac', 'borek-potato.png'],
  ['Potato_Borek1-', 'borek-potato-alt.png'],
];

for (const [part, name] of jobs) {
  await zoomCenter(find(part), join(dstDir, name));
}
