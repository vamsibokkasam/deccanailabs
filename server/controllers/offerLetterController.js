import fs from "fs";
import prisma from "../config/prisma.js";
import { renderSampleOfferLetter } from "../services/offerLetterRenderer.js";
import {
  issueOfferLetterForApplication,
  OFFER_LETTER_META_SELECT,
  resolveStoredPdf,
} from "../services/offerLetterIssuance.js";
import { sendOfferLetterEmail as dispatchOfferLetterEmail } from "../services/offerLetterEmail.js";
import { stripScreenshotFromApplication } from "../utils/serialize.js";

function sendOfferPdf(res, { pdfBuffer, filename }) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(pdfBuffer);
}

function asBuffer(bytes) {
  return Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
}

function wantsRegenerate(req) {
  const value = String(req.query.regenerate || "").toLowerCase();
  return value === "1" || value === "true";
}

export const downloadOfferLetter = async (req, res, next) => {
  try {
    const application = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: {
        batch: true,
        certificate: true,
        offerLetter: {
          select: {
            id: true,
            applicationId: true,
            filename: true,
            storagePath: true,
            pdfBytes: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const regenerate = wantsRegenerate(req);
    const accepted =
      application.status === "accepted" || application.status === "completed";

    if (!application.offerLetter && !accepted) {
      return res.status(400).json({
        success: false,
        message: "Offer letter is created when the application is accepted",
      });
    }

    if (application.offerLetter && !regenerate) {
      const filePath = resolveStoredPdf(application.offerLetter);
      if (filePath) {
        sendOfferPdf(res, {
          pdfBuffer: fs.readFileSync(filePath),
          filename: application.offerLetter.filename,
        });
        return;
      }
      if (application.offerLetter.pdfBytes) {
        sendOfferPdf(res, {
          pdfBuffer: asBuffer(application.offerLetter.pdfBytes),
          filename: application.offerLetter.filename,
        });
        return;
      }
    }

    const saved = await issueOfferLetterForApplication(application, {
      force: regenerate || Boolean(application.offerLetter),
    });
    const filePath = resolveStoredPdf({
      ...saved,
      applicationId: application.id,
    });

    sendOfferPdf(res, {
      pdfBuffer: filePath ? fs.readFileSync(filePath) : asBuffer(saved.pdfBytes),
      filename: saved.filename,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const downloadSampleOfferLetter = async (req, res, next) => {
  try {
    const rendered = await renderSampleOfferLetter();
    sendOfferPdf(res, rendered);
  } catch (error) {
    next(error);
  }
};

export const emailOfferLetter = async (req, res, next) => {
  try {
    const application = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: {
        batch: true,
        offerLetter: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (!application.offerLetter) {
      return res.status(400).json({
        success: false,
        message: "Offer letter is created when the application is accepted",
      });
    }

    let offerLetter = application.offerLetter;
    try {
      await dispatchOfferLetterEmail({
        application,
        offerLetter,
      });
    } catch (error) {
      if (error.statusCode !== 404) throw error;
      offerLetter = await issueOfferLetterForApplication(application, { force: true });
      await dispatchOfferLetterEmail({
        application,
        offerLetter,
      });
    }

    const updated = await prisma.offerLetter.update({
      where: { id: offerLetter.id },
      data: { emailedAt: new Date() },
      select: OFFER_LETTER_META_SELECT,
    });

    res.json({
      success: true,
      message: `Offer letter emailed to ${application.email}`,
      data: stripScreenshotFromApplication({
        ...application,
        offerLetter: updated,
      }),
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
