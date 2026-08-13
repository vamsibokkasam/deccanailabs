/**
 * Detect Decco face/arm landmarks from DECCO.jpeg pixels (exact asset).
 * Percentages are relative to the full image (0–100).
 */

export function analyzeDeccoLandmarks(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) return defaultLandmarks(w, h);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return defaultLandmarks(w, h);

  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const face = {
    x0: Math.floor(w * 0.36),
    x1: Math.floor(w * 0.64),
    y0: Math.floor(h * 0.14),
    y1: Math.floor(h * 0.4),
  };

  const cyan = [];
  for (let y = face.y0; y < face.y1; y += 2) {
    for (let x = face.x0; x < face.x1; x += 2) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isCyanGlow(r, g, b)) cyan.push({ x, y, b });
    }
  }

  if (cyan.length < 20) return defaultLandmarks(w, h);

  const ys = cyan.map((p) => p.y).sort((a, b) => a - b);
  const eyeCut = ys[Math.floor(ys.length * 0.62)];
  const mouthStart = ys[Math.floor(ys.length * 0.78)];

  const eyePts = cyan.filter((p) => p.y <= eyeCut && p.b > 130);
  const mouthPts = cyan.filter((p) => p.y >= mouthStart);

  const eyes = splitEyes(eyePts, w, h);
  const mouth = bboxPercent(mouthPts.length ? mouthPts : cyan.slice(-40), w, h);

  // Raised hand — tighter clip, clear of head/face
  const arm = {
    pivotX: 29,
    pivotY: 41,
    clipPath: "polygon(5% 23%, 26% 21%, 32% 35%, 29% 49%, 9% 45%, 4% 33%)",
    cover: { left: 3, top: 20, width: 30, height: 32 },
  };

  return {
    aspect: `${w} / ${h}`,
    mouth: {
      left: mouth.cx,
      top: mouth.cy,
      // Keep landmark box thin — matches original neon smile
      width: Math.min(Math.max(mouth.w * 1.08, 6.8), 10),
      height: Math.min(Math.max(mouth.h * 1.1, 1.1), 2.2),
    },
    eyes,
    arm,
  };
}

function isCyanGlow(r, g, b) {
  return b > 90 && b > r + 25 && b >= g - 5 && g > 40;
}

function splitEyes(pts, w, h) {
  if (!pts.length) {
    return {
      left: { left: 43.5, top: 26.5 },
      right: { left: 54.5, top: 26.5 },
    };
  }
  const midX = w * 0.5;
  const left = pts.filter((p) => p.x < midX);
  const right = pts.filter((p) => p.x >= midX);
  return {
    left: centerPercent(left.length ? left : pts, w, h),
    right: centerPercent(right.length ? right : pts, w, h),
  };
}

function centerPercent(pts, w, h) {
  if (!pts.length) return { left: 50, top: 26 };
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return {
    left: (cx / w) * 100,
    top: (cy / h) * 100,
  };
}

function bboxPercent(pts, w, h) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const cx = ((minX + maxX) / 2 / w) * 100;
  const cy = ((minY + maxY) / 2 / h) * 100;
  const bw = ((maxX - minX) / w) * 100;
  const bh = ((maxY - minY) / h) * 100;
  return { cx, cy, w: bw, h: bh };
}

function defaultLandmarks(w = 3, h = 4) {
  return {
    aspect: w && h ? `${w} / ${h}` : "3 / 4",
    mouth: { left: 50, top: 30.8, width: 8.2, height: 1.35 },
    eyes: {
      left: { left: 43.8, top: 26.2 },
      right: { left: 54.2, top: 26.2 },
    },
    arm: {
      pivotX: 29,
      pivotY: 41,
      clipPath: "polygon(5% 23%, 26% 21%, 32% 35%, 29% 49%, 9% 45%, 4% 33%)",
      cover: { left: 3, top: 20, width: 30, height: 32 },
    },
  };
}
