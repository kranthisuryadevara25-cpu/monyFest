#!/usr/bin/env node
/**
 * Generates PWA icons (192x192, 512x512, apple-touch 180x180) in public/icons.
 * Run: node scripts/generate-pwa-icons.mjs (requires sharp: npm i -D sharp)
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'icons');
const THEME_COLOR = '#189aa1'; // matches manifest theme_color

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('Optional: install sharp (npm i -D sharp) and re-run to generate PWA icons.');
    await mkdir(OUT_DIR, { recursive: true }).catch(() => {});
    await writeFile(
      join(OUT_DIR, 'README.txt'),
      'Place icon-192x192.png, icon-512x512.png, and apple-touch-icon.png (180x180) here.\nRun: npm i -D sharp && node scripts/generate-pwa-icons.mjs to generate them.\n'
    );
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  // Create a simple SVG (brand-colored square with "LL" text) and render to PNG
  const createSvg = (size) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" fill="${THEME_COLOR}"/>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white">LL</text>
    </svg>
  `;

  const sizes = [
    [192, 'icon-192x192.png'],
    [512, 'icon-512x512.png'],
    [180, 'apple-touch-icon.png'],
  ];

  for (const [size, name] of sizes) {
    const svg = Buffer.from(createSvg(size));
    const png = await sharp(svg).png().toBuffer();
    await writeFile(join(OUT_DIR, name), png);
    console.log('Wrote public/icons/' + name);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
