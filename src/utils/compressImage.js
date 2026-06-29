const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.82;
const MAX_BYTES = 4 * 1024 * 1024;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };

    image.src = url;
  });
}

function estimateDataUrlBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

export async function compressImageFile(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please upload a valid image file");
  }

  if (file.size <= 400 * 1024 && file.type === "image/jpeg") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const image = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_WIDTH / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not process image");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (estimateDataUrlBytes(dataUrl) > MAX_BYTES && quality > 0.45) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (estimateDataUrlBytes(dataUrl) > MAX_BYTES) {
    throw new Error("Screenshot is too large. Please upload a smaller image.");
  }

  return dataUrl;
}
