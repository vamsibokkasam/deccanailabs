import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "public", "DECCO.jpeg");
const output = path.join(root, "public", "decco.png");

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const seen = new Uint8Array(width * height);
const stack = [];

function isBackground(offset) {
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const accent = b > 90 && b > r + 30 && b + 8 >= g;
  return !accent && lum < 96 && chroma < 58 && b + 12 >= r && b + 8 >= g;
}

function push(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const pixel = y * width + x;
  if (seen[pixel]) return;
  const offset = pixel * channels;
  if (!isBackground(offset)) return;
  seen[pixel] = 1;
  stack.push(pixel);
}

for (let x = 0; x < width; x += 1) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y += 1) {
  push(0, y);
  push(width - 1, y);
}

while (stack.length) {
  const pixel = stack.pop();
  const x = pixel % width;
  const y = (pixel - x) / width;
  data[pixel * channels + 3] = 0;
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(output);
const transparent = data.reduce((count, _value, index) => count + (index % 4 === 3 && data[index] === 0 ? 1 : 0), 0);
console.log(`wrote ${output} ${width}x${height} transparent=${transparent}`);
