import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { renderCertificate, PDF_TEMPLATE_PATH } from "../services/certificateRenderer.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "../output");

/** Dev-only sample doc for coordinate preview — not used in production. */
const sampleCertificate = {
  certNo: "DCAL-13072026-A041",
  recipientName: "BOKKASAM VAMSI",
  registrationNo: "1XX21A05XX",
  department: "Computer Science & Engineering",
  college: "XYZ Engineering College",
  internshipDomain: "AI AUTOMATION",
  startDate: new Date("2025-11-24"),
  endDate: new Date("2026-03-31"),
};

async function main() {
  process.env.SITE_URL = process.env.SITE_URL || "https://deccanailabs.com";

  try {
    await fs.access(PDF_TEMPLATE_PATH);
  } catch {
    console.error(`Certificate template missing at:\n  ${PDF_TEMPLATE_PATH}\n`);
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const { pngBuffer, pdfBuffer } = await renderCertificate(sampleCertificate);
  const safeName = sampleCertificate.certNo.replace(/\//g, "-");
  const pngPath = path.join(outputDir, `${safeName}.png`);
  const pdfPath = path.join(outputDir, `${safeName}.pdf`);

  await fs.writeFile(pngPath, pngBuffer);
  await fs.writeFile(pdfPath, pdfBuffer);
  console.log(`Saved preview PNG: ${pngPath}`);
  console.log(`Saved preview PDF: ${pdfPath}`);
  console.log(
    `QR should open: ${(process.env.SITE_URL || "https://deccanailabs.com").replace(/\/$/, "")}/verify/${sampleCertificate.certNo}`
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
