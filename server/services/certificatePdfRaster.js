import { createCanvas } from "canvas";

let pdfjsModule;

async function loadPdfjs() {
  if (pdfjsModule) return pdfjsModule;

  const [pdfjs, canvasPkg] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    import("canvas"),
  ]);

  if (typeof globalThis.DOMMatrix === "undefined" && canvasPkg.DOMMatrix) {
    globalThis.DOMMatrix = canvasPkg.DOMMatrix;
  }
  if (typeof globalThis.ImageData === "undefined" && canvasPkg.ImageData) {
    globalThis.ImageData = canvasPkg.ImageData;
  }

  pdfjsModule = pdfjs;
  return pdfjsModule;
}

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

export async function rasterizePdfToPng(pdfBytes, targetWidth = 1800) {
  const pdfjs = await loadPdfjs();
  const bytes =
    pdfBytes instanceof Uint8Array && !Buffer.isBuffer(pdfBytes)
      ? pdfBytes
      : Uint8Array.from(pdfBytes);
  const pdf = await pdfjs.getDocument({
    data: bytes,
    useSystemFonts: true,
    isEvalSupported: false,
    verbosity: 0,
    canvasFactory: new NodeCanvasFactory(),
  }).promise;
  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: targetWidth / baseViewport.width });
  const canvasFactory = new NodeCanvasFactory();
  const { canvas, context } = canvasFactory.create(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height)
  );

  await page.render({
    canvasContext: context,
    viewport,
    canvasFactory,
  }).promise;
  await pdf.destroy();

  return canvas.toBuffer("image/png");
}
