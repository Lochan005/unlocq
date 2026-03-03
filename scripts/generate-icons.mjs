#!/usr/bin/env node
/**
 * Generates PNG favicon variants from app/icon.svg for full browser and PWA support.
 * Run: npm run icons
 * Output: public/favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png,
 *         android-chrome-192x192.png, android-chrome-512x512.png
 */

import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
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

console.log("Icons generated successfully.");
