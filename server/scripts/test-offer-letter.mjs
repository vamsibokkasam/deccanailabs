import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { renderSampleOfferLetter } from "../services/offerLetterRenderer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "../output");

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const { pdfBuffer, filename } = await renderSampleOfferLetter();
  const pdfPath = path.join(outputDir, filename);
  const stablePdfPath = path.join(outputDir, "Offer-Letter-SAMPLE.pdf");

  await fs.writeFile(pdfPath, pdfBuffer);
  await fs.writeFile(stablePdfPath, pdfBuffer);

  console.log(`Saved test offer letter PDF: ${pdfPath}`);
  console.log(`Stable copy: ${stablePdfPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
