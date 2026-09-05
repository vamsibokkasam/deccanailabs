import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../config/prisma.js";
import { renderOfferLetter } from "./offerLetterRenderer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OFFER_DIR = path.join(__dirname, "../uploads/offer-letters");

export const OFFER_LETTER_META_SELECT = {
  id: true,
  filename: true,
  storagePath: true,
  emailedAt: true,
  createdAt: true,
  updatedAt: true,
};

const inflight = new Set();

export function offerLetterFilePath(applicationId) {
  return path.join(OFFER_DIR, `${applicationId}.pdf`);
}

export function resolveStoredPdf(offerLetter) {
  if (offerLetter?.storagePath) {
    const full = path.isAbsolute(offerLetter.storagePath)
      ? offerLetter.storagePath
      : path.join(__dirname, "..", offerLetter.storagePath);
    if (fs.existsSync(full)) return full;
  }
  const fallback = offerLetterFilePath(offerLetter.applicationId);
  return fs.existsSync(fallback) ? fallback : null;
}

export function loadOfferLetterPdf(application, offerLetter) {
  const filePath = resolveStoredPdf({
    ...offerLetter,
    applicationId: offerLetter?.applicationId || application?.id,
  });
  if (filePath) return fs.readFileSync(filePath);
  if (offerLetter?.pdfBytes) {
    return Buffer.from(offerLetter.pdfBytes);
  }
  const error = new Error("Offer letter PDF not found");
  error.statusCode = 404;
  throw error;
}

export async function saveOfferLetter(application, rendered) {
  fs.mkdirSync(OFFER_DIR, { recursive: true });
  const absolutePath = offerLetterFilePath(application.id);
  fs.writeFileSync(absolutePath, rendered.pdfBuffer);

  const storagePath = path.posix.join("uploads", "offer-letters", `${application.id}.pdf`);
  const data = {
    applicationRef: application.applicationId || application.id,
    recipientName: application.fullName,
    program: application.program,
    filename: rendered.filename,
    storagePath,
  };

  return prisma.offerLetter.upsert({
    where: { applicationId: application.id },
    create: {
      applicationId: application.id,
      ...data,
    },
    update: data,
  });
}

export async function issueOfferLetterForApplication(
  application,
  { force = false } = {}
) {
  if (!force) {
    const existing = await prisma.offerLetter.findUnique({
      where: { applicationId: application.id },
      select: { ...OFFER_LETTER_META_SELECT, applicationId: true },
    });
    if (existing && resolveStoredPdf(existing)) return existing;
  }

  const rendered = await renderOfferLetter(application);
  return saveOfferLetter(application, rendered);
}

export function queueOfferLetterIssuance(application) {
  const id = application.id;
  if (!id || inflight.has(id)) return;

  inflight.add(id);
  setImmediate(async () => {
    try {
      await issueOfferLetterForApplication(application);
    } catch (error) {
      console.error("Offer letter save failed:", error.message || error);
    } finally {
      inflight.delete(id);
    }
  });
}
