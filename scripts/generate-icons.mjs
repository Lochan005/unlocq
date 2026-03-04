#!/usr/bin/env node
/**
 * Generates PNG favicon variants and favicon.ico from app/icon.svg for full browser and PWA support.
 * Run: npm run icons
 * Output: public/favicon.ico, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png,
 *         android-chrome-192x192.png, android-chrome-512x512.png
 */

import sharp from "sharp";
import toIco from "to-ico";
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "app", "icon.svg");
const publicDir = join(root, "public");

if (!existsSync(svgPath)) {
  console.error("app/icon.svg not found");
  process.exit(1);
}

mkdirSync(publicDir, { recursive: true });
const svg = readFileSync(svgPath);

const sizes = [
  [16, "favicon-16x16.png"],
  [32, "favicon-32x32.png"],
  [180, "apple-touch-icon.png"],
  [192, "android-chrome-192x192.png"],
  [512, "android-chrome-512x512.png"],
];

for (const [size, name] of sizes) {
  const outPath = join(publicDir, name);
  await sharp(svg).resize(size, size).png().toFile(outPath);
  console.log(`Generated ${name}`);
}

// Generate favicon.ico for Safari (macOS) compatibility
const png16 = await sharp(svg).resize(16, 16).png().toBuffer();
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const ico = await toIco([png16, png32]);
writeFileSync(join(publicDir, "favicon.ico"), ico);
console.log("Generated favicon.ico");

console.log("Icons generated successfully.");
