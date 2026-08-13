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
    if (!ctx) return src;

    ctx.drawImage(img, 0, 0);
    const frame = ctx.getImageData(0, 0, w, h);
    const d = frame.data;

    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const mx = Math.max(r, g, b);
      const mn = Math.min(r, g, b);
      const chroma = mx - mn;

      // Preserve cyan/blue emissive accents even when dark
      const isAccent = b > 70 && b > r + 18 && b >= g;

      // Dark, low-chroma plate / floor (not robot shell, not accents)
      if (!isAccent && lum < 52 && chroma < 38) {
        d[i + 3] = 0;
      } else if (!isAccent && lum < 68 && chroma < 28) {
        // Soft edge falloff near the plate
        d[i + 3] = Math.min(d[i + 3], Math.round(((lum - 52) / 16) * 255));
      }
    }

    ctx.putImageData(frame, 0, 0);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return src;

    if (isolatedObjectUrl) URL.revokeObjectURL(isolatedObjectUrl);
    isolatedObjectUrl = URL.createObjectURL(blob);
    return isolatedObjectUrl;
  })().catch(() => src);

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
