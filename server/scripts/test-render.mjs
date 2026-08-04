import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { renderCertificate, TEMPLATE_PATH } from "../services/certificateRenderer.js";

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
    await fs.access(TEMPLATE_PATH);
  } catch {
    console.error(`
Certificate template missing at:
  ${TEMPLATE_PATH}

Export your BLANK Canva design (logo, border, seal, signature — NO student
name, cert number, dates, or detail-block text) and save it there.

Do NOT copy src/assets/template.png or scanned.png — those are filled samples
and will cause double/overlapping text when the renderer draws on top.
`);
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const { pngBuffer } = await renderCertificate(sampleCertificate);
  const safeName = sampleCertificate.certNo.replace(/\//g, "-");
  const pngPath = path.join(outputDir, `${safeName}.png`);

  await fs.writeFile(pngPath, pngBuffer);
  console.log(`Saved preview PNG: ${pngPath}`);
  console.log(
    `QR should open: ${(process.env.SITE_URL || "https://deccanailabs.com").replace(/\/$/, "")}/verify/${sampleCertificate.certNo}`
  );
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
