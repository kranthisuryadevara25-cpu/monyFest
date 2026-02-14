#!/usr/bin/env node
/**
 * Generates PWA icons and favicon from public/monyfest-logo.png.
 * Output: public/icons/ (icon-32x32, icon-192x192, icon-512x512, apple-touch-icon).
 * Run: node scripts/generate-pwa-icons.mjs (requires sharp: npm i -D sharp)
 */
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'icons');
const SOURCE_LOGO = join(ROOT, 'public', 'monyfest-logo.png');
const THEME_COLOR = '#189aa1';

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn('Install sharp: npm i -D sharp, then re-run this script.');
    await mkdir(OUT_DIR, { recursive: true }).catch(() => {});
    await writeFile(
      join(OUT_DIR, 'README.txt'),
      'PWA icons are generated from public/monyfest-logo.png.\nRun: npm i -D sharp && node scripts/generate-pwa-icons.mjs\n'
    );
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  const sizes = [
    [32, 'icon-32x32.png'],
    [180, 'apple-touch-icon.png'],
    [192, 'icon-192x192.png'],
    [512, 'icon-512x512.png'],
  ];

  if (existsSync(SOURCE_LOGO)) {
    const input = sharp(SOURCE_LOGO);
    for (const [size, name] of sizes) {
      const buf = await input.clone().resize(size, size).png().toBuffer();
      await writeFile(join(OUT_DIR, name), buf);
      console.log('Wrote public/icons/' + name + ' (' + size + 'x' + size + ') from monyfest-logo.png');
    }
  } else {
    console.warn('public/monyfest-logo.png not found. Generating placeholder icons (MF).');
    const createSvg = (size) => `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="100%" height="100%" fill="${THEME_COLOR}"/>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white">MF</text>
      </svg>
    `;
    for (const [size, name] of sizes) {
      const svg = Buffer.from(createSvg(size));
      const png = await sharp(svg).png().toBuffer();
      await writeFile(join(OUT_DIR, name), png);
      console.log('Wrote public/icons/' + name);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
