const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validatePaymentScreenshot(base64Data) {
  if (!base64Data?.startsWith("data:image/")) {
    throw new Error("Invalid payment screenshot format");
  }

  const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid payment screenshot format");
  }

  const mimeType = matches[1];
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error("Screenshot must be a JPG, PNG, or WebP image");
  }

  const buffer = Buffer.from(matches[2], "base64");
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Screenshot must be smaller than 5 MB");
  }

  return base64Data.trim();
}
