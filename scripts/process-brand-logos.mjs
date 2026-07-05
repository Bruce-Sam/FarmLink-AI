import sharp from 'sharp';
import path from 'path';
import { unlink, rename } from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.join(__dirname, '../public/brand');
const publicDir = path.join(__dirname, '../public');

async function knockOutBlack(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r < 28 && g < 28 && b < 28) {
      pixels[i + 3] = 0;
    }
  }

  const tempPath = `${outputPath}.tmp.png`;
  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(tempPath);

  await rename(tempPath, outputPath);

  console.log(`Wrote ${outputPath} (${info.width}x${info.height})`);
}

await knockOutBlack(
  path.join(brandDir, 'afuo-market-full.png'),
  path.join(brandDir, 'afuo-market-full.png'),
);
await knockOutBlack(
  path.join(brandDir, 'afuo-market-icon.png'),
  path.join(brandDir, 'afuo-market-icon.png'),
);

const icon = path.join(brandDir, 'afuo-market-icon.png');
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
await sharp(icon)
  .resize(512, 512, { fit: 'contain', background: transparent })
  .png()
  .toFile(path.join(publicDir, 'icons/icon-512.png'));
await sharp(icon)
  .resize(192, 192, { fit: 'contain', background: transparent })
  .png()
  .toFile(path.join(publicDir, 'icons/icon-192.png'));
await sharp(icon)
  .resize(32, 32, { fit: 'contain', background: transparent })
  .png()
  .toFile(path.join(publicDir, 'favicon.png'));

console.log('Brand logos processed.');
