/**
 * Offline helper: create public/assets/decco-isolated.png from DECCO.jpeg
 * without overwriting the original.
 *
 * Usage: node scripts/isolate-decco.mjs
 * Requires: npm i -D sharp   (or run browser runtime isolation instead)
 */
import { mkdir, copyFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "public", "DECCO.jpeg");
const outDir = path.join(root, "public", "assets");
const outPng = path.join(outDir, "decco-isolated.png");
const outOriginal = path.join(outDir, "decco-original.jpeg");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error(
      "sharp is not installed. Runtime canvas isolation is used in the app.\n" +
        "Optional: npm i -D sharp && node scripts/isolate-decco.mjs"
    );
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });
  try {
    await access(outOriginal, constants.F_OK);
  } catch {
    await copyFile(src, outOriginal);
  }

  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const isAccent = b > 70 && b > r + 18 && b >= g;
    if (!isAccent && lum < 52 && chroma < 38) data[i + 3] = 0;
    else if (!isAccent && lum < 68 && chroma < 28) {
      data[i + 3] = Math.min(data[i + 3], Math.round(((lum - 52) / 16) * 255));
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outPng);
  console.log("Wrote", outPng, `(${width}x${height})`);
  console.log("Original preserved at", src);
}

main();
