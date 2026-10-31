/** Exact Decco source — never overwrite this file. */
export const DECCO_ORIGINAL = "/DECCO.jpeg";

/** Optional pre-baked transparent asset (if generated offline). */
export const DECCO_ISOLATED = "/assets/decco-isolated.png";

let isolatePromise = null;
let isolatedObjectUrl = null;

/**
 * Removes the dark navy plate from DECCO.jpeg while keeping exact robot pixels.
 * Does not modify the source file. Result is a blob: URL (PNG).
 */
export function isolateDeccoImage(src = DECCO_ORIGINAL) {
  if (isolatePromise) return isolatePromise;

  isolatePromise = (async () => {
    // Prefer a pre-baked transparent PNG if it actually loads as an image
    try {
      await loadImage(DECCO_ISOLATED);
      return DECCO_ISOLATED;
    } catch {
      /* fall through to runtime isolation */
    }

    const img = await loadImage(src);
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "";

    ctx.drawImage(img, 0, 0);
    const frame = ctx.getImageData(0, 0, w, h);
    const d = frame.data;
    const seen = new Uint8Array(w * h);
    const stack = [];

    const isBackground = (offset) => {
      const r = d[offset];
      const g = d[offset + 1];
      const b = d[offset + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const accent = b > 90 && b > r + 30 && b + 8 >= g;
      return !accent && lum < 96 && chroma < 58 && b + 12 >= r && b + 8 >= g;
    };

    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const pixel = y * w + x;
      if (seen[pixel]) return;
      if (!isBackground(pixel * 4)) return;
      seen[pixel] = 1;
      stack.push(pixel);
    };

    for (let x = 0; x < w; x += 1) {
      push(x, 0);
      push(x, h - 1);
    }
    for (let y = 0; y < h; y += 1) {
      push(0, y);
      push(w - 1, y);
    }

    while (stack.length) {
      const pixel = stack.pop();
      const x = pixel % w;
      const y = (pixel - x) / w;
      d[pixel * 4 + 3] = 0;
      push(x + 1, y);
      push(x - 1, y);
      push(x, y + 1);
      push(x, y - 1);
    }

    ctx.putImageData(frame, 0, 0);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return "";

    if (isolatedObjectUrl) URL.revokeObjectURL(isolatedObjectUrl);
    isolatedObjectUrl = URL.createObjectURL(blob);
    return isolatedObjectUrl;
  })().catch(() => "");

  return isolatePromise;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}
