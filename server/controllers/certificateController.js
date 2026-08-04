import Certificate from "../models/Certificate.js";
import InternshipApplication from "../models/InternshipApplication.js";
import { generateCertificateNo } from "../utils/certificateNo.js";
import {
  renderCertificate,
  resolveDisplayCertNo,
} from "../services/certificateRenderer.js";

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

function exactCaseInsensitive(value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}

async function syncCertificateCertNo(certificate) {
  const appId = certificate.applicationId?.applicationId?.trim();
  if (appId && certificate.certNo !== appId) {
    certificate.certNo = appId;
    await certificate.save();
  }
}

async function findCertificate(identifier, { lean = false } = {}) {
  const value = String(identifier || "").trim();
  if (!value) return null;

  const exact = exactCaseInsensitive(value);
  let certificate = await Certificate.findOne({ certNo: exact }).populate(
    "applicationId",
    "applicationId email"
  );

  if (!certificate) {
    const application = await InternshipApplication.findOne({
      applicationId: exact,
    }).select("_id");

    if (application) {
      certificate = await Certificate.findOne({
        applicationId: application._id,
      }).populate("applicationId", "applicationId email");
    }
  }

  if (!certificate) return null;

  await syncCertificateCertNo(certificate);
  return lean ? certificate.toObject() : certificate;
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
      const InternshipApplication = (await import("../models/InternshipApplication.js"))
        .default;
      const application = await InternshipApplication.findById(linkedApplicationId);

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

    const certificate = await Certificate.create({
      certNo,
      recipientName: recipientName.trim(),
      registrationNo: registrationNo?.trim() || "",
      department: department?.trim() || "",
      college: college?.trim() || "",
      internshipDomain: internshipDomain.trim(),
      startDate: parsedStart,
      endDate: parsedEnd,
      applicationId: linkedApplicationId,
    });

    res.status(201).json({
      success: true,
      message: "Certificate created successfully",
      data: certificate,
    });
  } catch (error) {
    if (error.code === 11000) {
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

    const exact = exactCaseInsensitive(query);
    const applications = await InternshipApplication.find({
      $or: [{ email: exact }, { applicationId: exact }],
    })
      .select("_id applicationId email")
      .lean();

    const applicationIds = applications.map(({ _id }) => _id);
    const certificates = await Certificate.find({
      $or: [
        { certNo: exact },
        { registrationNo: exact },
        ...(applicationIds.length ? [{ applicationId: { $in: applicationIds } }] : []),
      ],
    })
      .populate("applicationId", "applicationId email")
      .sort({ issuedAt: -1 })
      .limit(10)
      .lean();

    const data = certificates.map((certificate) => ({
      certNo: certificate.applicationId?.applicationId || certificate.certNo,
      recipientName: certificate.recipientName,
      email: certificate.applicationId?.email || "",
      internId: certificate.applicationId?.applicationId || "",
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
    const certificate = await findCertificate(certNo, { lean: true });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const displayCertNo =
      certificate.applicationId?.applicationId || certificate.certNo;

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

    certificate.status = "revoked";
    await certificate.save();

    res.json({
      success: true,
      message: "Certificate revoked successfully",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};
