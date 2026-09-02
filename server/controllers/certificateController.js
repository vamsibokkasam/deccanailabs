import prisma from "../config/prisma.js";
import { generateCertificateNo } from "../utils/certificateNo.js";
import { isPrismaUniqueError } from "../utils/prismaErrors.js";
import { serializeCertificate } from "../utils/serialize.js";
import {
  renderCertificate,
  resolveDisplayCertNo,
} from "../services/certificateRenderer.js";

const applicationSelect = {
  id: true,
  applicationId: true,
  email: true,
};

function resolveCertNo(raw) {
  const value = Array.isArray(raw) ? raw.join("/") : String(raw ?? "");
  const trimmed = value.replace(/^\/+|\/+$/g, "");

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function pdfFilename(certNo) {
  return `${certNo.replace(/\//g, "-")}.pdf`;
}

function pngFilename(certNo) {
  return `${certNo.replace(/\//g, "-")}.png`;
}

async function syncCertificateCertNo(certificate) {
  const appId = certificate.application?.applicationId?.trim();
  if (appId && certificate.certNo !== appId) {
    return prisma.certificate.update({
      where: { id: certificate.id },
      data: { certNo: appId },
      include: { application: { select: applicationSelect } },
    });
  }
  return certificate;
}

async function findCertificate(identifier) {
  const value = String(identifier || "").trim();
  if (!value) return null;

  let certificate = await prisma.certificate.findFirst({
    where: { certNo: { equals: value, mode: "insensitive" } },
    include: { application: { select: applicationSelect } },
  });

  if (!certificate) {
    const application = await prisma.internshipApplication.findFirst({
      where: { applicationId: { equals: value, mode: "insensitive" } },
      select: { id: true },
    });

    if (application) {
      certificate = await prisma.certificate.findUnique({
        where: { applicationId: application.id },
        include: { application: { select: applicationSelect } },
      });
    }
  }

  if (!certificate) return null;

  return syncCertificateCertNo(certificate);
}

async function sendCertificatePdf(certificate, res, { download = false } = {}) {
  const { pdfBuffer } = await renderCertificate(certificate);
  const displayCertNo = await resolveDisplayCertNo(certificate);
  const filename = pdfFilename(displayCertNo);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${filename}"`
  );
  res.send(pdfBuffer);
}

async function sendCertificatePng(certificate, res, { download = false } = {}) {
  const { pngBuffer } = await renderCertificate(certificate);
  const displayCertNo = await resolveDisplayCertNo(certificate);
  const filename = pngFilename(displayCertNo);

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader(
    "Content-Disposition",
    `${download ? "attachment" : "inline"}; filename="${filename}"`
  );
  res.send(pngBuffer);
}

export const createCertificate = async (req, res, next) => {
  try {
    const {
      recipientName,
      registrationNo,
      department,
      college,
      internshipDomain,
      startDate,
      endDate,
      applicationId,
      certNo: requestedCertNo,
    } = req.body;

    if (!recipientName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Recipient name is required",
      });
    }

    if (!internshipDomain?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Internship domain is required",
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);

    if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date must be valid dates",
      });
    }

    let certNo = requestedCertNo?.trim();
    let linkedApplicationId = applicationId || undefined;

    if (linkedApplicationId) {
      const application = await prisma.internshipApplication.findUnique({
        where: { id: linkedApplicationId },
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Linked application not found",
        });
      }

      if (!application.applicationId) {
        return res.status(400).json({
          success: false,
          message: "Linked application has no application ID",
        });
      }

      certNo = application.applicationId;
    }

    if (!certNo) {
      certNo = await generateCertificateNo();
    }

    const certificate = await prisma.certificate.create({
      data: {
        certNo,
        recipientName: recipientName.trim(),
        registrationNo: registrationNo?.trim() || "",
        department: department?.trim() || "",
        college: college?.trim() || "",
        internshipDomain: internshipDomain.trim(),
        startDate: parsedStart,
        endDate: parsedEnd,
        applicationId: linkedApplicationId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Certificate created successfully",
      data: serializeCertificate(certificate),
    });
  } catch (error) {
    if (isPrismaUniqueError(error)) {
      return res.status(409).json({
        success: false,
        message: "A certificate with this certificate number already exists",
      });
    }
    next(error);
  }
};

export const renderCertificatePdf = async (req, res, next) => {
  try {
    const certNo = resolveCertNo(req.params.certNo);
    const certificate = await findCertificate(certNo);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const download = req.query.download === "1" || req.query.download === "true";
    await sendCertificatePdf(certificate, res, { download });
  } catch (error) {
    if (error.message?.includes("pdf-lib")) {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/** Public PNG for QR / website viewers — valid certificates only. */
export const downloadCertificateImage = async (req, res, next) => {
  try {
    const certNo = resolveCertNo(req.params.certNo);
    const certificate = await findCertificate(certNo);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    if (certificate.status !== "valid") {
      return res.status(403).json({
        success: false,
        message: "This certificate has been revoked",
      });
    }

    const download = req.query.download === "1" || req.query.download === "true";
    await sendCertificatePng(certificate, res, { download });
  } catch (error) {
    next(error);
  }
};

/** Public PDF for QR / website viewers — valid certificates only. */
export const downloadCertificatePdf = async (req, res, next) => {
  try {
    const certNo = resolveCertNo(req.params.certNo);
    const certificate = await findCertificate(certNo);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    if (certificate.status !== "valid") {
      return res.status(403).json({
        success: false,
        message: "This certificate has been revoked",
      });
    }

    const download = req.query.download !== "0" && req.query.download !== "false";
    await sendCertificatePdf(certificate, res, { download });
  } catch (error) {
    if (error.message?.includes("pdf-lib")) {
      return res.status(503).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const searchCertificates = async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();

    if (query.length < 3 || query.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email, application ID, registration number, or certificate ID",
      });
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        OR: [
          { email: { equals: query, mode: "insensitive" } },
          { applicationId: { equals: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, applicationId: true, email: true },
    });

    const applicationIds = applications.map(({ id }) => id);
    const certificates = await prisma.certificate.findMany({
      where: {
        OR: [
          { certNo: { equals: query, mode: "insensitive" } },
          { registrationNo: { equals: query, mode: "insensitive" } },
          ...(applicationIds.length ? [{ applicationId: { in: applicationIds } }] : []),
        ],
      },
      include: { application: { select: applicationSelect } },
      orderBy: { issuedAt: "desc" },
      take: 10,
    });

    const data = certificates.map((certificate) => ({
      certNo: certificate.application?.applicationId || certificate.certNo,
      recipientName: certificate.recipientName,
      email: certificate.application?.email || "",
      internId: certificate.application?.applicationId || "",
      registrationNo: certificate.registrationNo,
      internshipDomain: certificate.internshipDomain,
      department: certificate.department,
      college: certificate.college,
      startDate: certificate.startDate,
      endDate: certificate.endDate,
      issuedAt: certificate.issuedAt,
      status: certificate.status,
      valid: certificate.status === "valid",
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (req, res, next) => {
  try {
    const certNo = resolveCertNo(req.params.certNo);
    const certificate = await findCertificate(certNo);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const displayCertNo = certificate.application?.applicationId || certificate.certNo;

    res.json({
      success: true,
      valid: certificate.status === "valid",
      certNo: displayCertNo,
      recipientName: certificate.recipientName,
      registrationNo: certificate.registrationNo,
      internshipDomain: certificate.internshipDomain,
      department: certificate.department,
      college: certificate.college,
      startDate: certificate.startDate,
      endDate: certificate.endDate,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const revokeCertificate = async (req, res, next) => {
  try {
    const certNo = resolveCertNo(req.params.certNo);
    const certificate = await findCertificate(certNo);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const revoked = await prisma.certificate.update({
      where: { id: certificate.id },
      data: { status: "revoked" },
      include: { application: { select: applicationSelect } },
    });

    res.json({
      success: true,
      message: "Certificate revoked successfully",
      data: serializeCertificate(revoked),
    });
  } catch (error) {
    next(error);
  }
};
