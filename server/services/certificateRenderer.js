import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";
import QRCode from "qrcode";
import { getSiteUrl } from "../config/site.js";
import InternshipApplication from "../models/InternshipApplication.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CANVAS_WIDTH = 1800;
export const CANVAS_HEIGHT = 1272;

export const TEMPLATE_PATH = path.join(
  __dirname,
  "../assets/certificates/blank_template.png"
);

export const FONT_SERIF_BOLD = "Georgia";
export const FONT_SANS = "Arial";

export const CERT_NO_POS = { right: 72, y: 72, fontSize: 20, color: "#1a3a6b" };
export const QR_POS = { x: 1555, y: 105 };
export const QR_SIZE = 130;

/** Wipe baked static paragraph so dynamic lines can sit in correct order */
export const BODY_CLEAR_RECT = { x: 320, y: 520, width: 1160, height: 210, color: "#ffffff" };

export const NAME_POS = { y: 500, fontSize: 44, color: "#1a3a6b", family: FONT_SANS };

export const DOMAIN_LINE_POS = {
  y: 560,
  fontSize: 22,
  color: "#222222",
  domainColor: "#1a3a6b",
  domainFontSize: 24,
  prefix:
    "Has successfully completed the internship at DECCAN AI LABS in ",
};

export const DATE_LINE_POS = { y: 592, fontSize: 23, color: "#222222" };

/** Redrawn below domain/date — matches template copy, placed after clear rect */
export const STATIC_PARAGRAPH_POS = {
  y: 626,
  fontSize: 21,
  lineHeight: 32,
  maxWidth: 1000,
  color: "#222222",
  text:
    "During the internship the intern worked on meaningful projects, demonstrated dedication, And gained practical exposure to industry-relevant technologies and real-world applications.",
};

/** Template already prints labels — only draw values after the colons */
export const DETAIL_BLOCK = {
  valueX: 368,
  startY: 772,
  lineHeight: 48,
  fontSize: 21,
  color: "#222222",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ordinalSuffix(day) {
  if (day >= 11 && day <= 13) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatCertificateDate(date) {
  const value = date instanceof Date ? date : new Date(date);
  const day = value.getDate();
  const month = MONTHS[value.getMonth()];
  const year = value.getFullYear();

  return `${day}${ordinalSuffix(day)} ${month} ${year}`;
}

function setFont(ctx, family, size, weight = "normal") {
  ctx.font = `${weight} ${size}px ${family}`;
}

function drawCenteredText(ctx, text, y, { fontSize, color, family, weight = "normal" }) {
  setFont(ctx, family, fontSize, weight);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(text, CANVAS_WIDTH / 2, y);
}

function drawCenteredMixedLine(ctx, before, highlight, after, y, config) {
  setFont(ctx, FONT_SANS, config.fontSize);
  const beforeWidth = ctx.measureText(before).width;
  setFont(ctx, FONT_SANS, config.domainFontSize, "bold");
  const highlightWidth = ctx.measureText(highlight).width;
  setFont(ctx, FONT_SANS, config.fontSize);
  const afterWidth = ctx.measureText(after).width;
  const totalWidth = beforeWidth + highlightWidth + afterWidth;
  let x = (CANVAS_WIDTH - totalWidth) / 2;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  setFont(ctx, FONT_SANS, config.fontSize);
  ctx.fillStyle = config.color;
  ctx.fillText(before, x, y);
  x += beforeWidth;

  setFont(ctx, FONT_SANS, config.domainFontSize, "bold");
  ctx.fillStyle = config.domainColor;
  ctx.fillText(highlight, x, y);
  x += highlightWidth;

  setFont(ctx, FONT_SANS, config.fontSize);
  ctx.fillStyle = config.color;
  ctx.fillText(after, x, y);
}

function drawDetailValue(ctx, value, y) {
  const { valueX, fontSize, color } = DETAIL_BLOCK;

  setFont(ctx, FONT_SANS, fontSize);
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(value || "—", valueX, y);
}

function wrapTextLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawCenteredParagraph(ctx, text, y, config) {
  setFont(ctx, FONT_SANS, config.fontSize);
  const lines = wrapTextLines(ctx, text, config.maxWidth);

  lines.forEach((line, index) => {
    drawCenteredText(ctx, line, y + index * config.lineHeight, {
      fontSize: config.fontSize,
      color: config.color,
      family: FONT_SANS,
    });
  });
}

function clearBodyBand(ctx) {
  const { x, y, width, height, color } = BODY_CLEAR_RECT;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

/**
 * Public verify URL embedded in the QR code.
 * Application-linked certs use the application ID, e.g.:
 * https://deccanailabs.com/verify/DCAL-13072026-A041
 */
export function buildCertificateVerifyUrl(certNo) {
  const siteUrl = getSiteUrl();
  const path = String(certNo || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return `${siteUrl}/verify/${encodeURIComponent(path)}`;
}

/** Certificate No on the PNG/PDF — always the linked application ID when available. */
export async function resolveDisplayCertNo(certificateDoc) {
  const populatedAppId = certificateDoc.applicationId?.applicationId;
  if (populatedAppId) return populatedAppId;

  const linkedId = certificateDoc.applicationId?._id || certificateDoc.applicationId;
  if (linkedId) {
    const application = await InternshipApplication.findById(linkedId)
      .select("applicationId")
      .lean();
    if (application?.applicationId) return application.applicationId;
  }

  return certificateDoc.certNo;
}

async function buildQrImage(verifyUrl) {
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: QR_SIZE * 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return loadImage(qrDataUrl);
}

async function pngBufferToPdfBuffer(pngBuffer) {
  let PDFDocument;
  try {
    ({ PDFDocument } = await import("pdf-lib"));
  } catch {
    throw new Error(
      "PDF generation requires pdf-lib. Install it with: npm install pdf-lib"
    );
  }

  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(pngBuffer);
  const page = pdfDoc.addPage([CANVAS_WIDTH, CANVAS_HEIGHT]);
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function renderCertificate(certificateDoc) {
  const {
    recipientName,
    registrationNo = "",
    department = "",
    college = "",
    internshipDomain,
    startDate,
    endDate,
  } = certificateDoc;

  const displayCertNo = await resolveDisplayCertNo(certificateDoc);

  const template = await loadImage(TEMPLATE_PATH);
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(template, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  clearBodyBand(ctx);

  setFont(ctx, FONT_SANS, CERT_NO_POS.fontSize);
  ctx.fillStyle = CERT_NO_POS.color;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(`Certificate No: ${displayCertNo}`, CANVAS_WIDTH - CERT_NO_POS.right, CERT_NO_POS.y);

  drawCenteredText(ctx, recipientName.toUpperCase(), NAME_POS.y, {
    fontSize: NAME_POS.fontSize,
    color: NAME_POS.color,
    family: NAME_POS.family || FONT_SERIF_BOLD,
    weight: "bold",
  });

  drawCenteredMixedLine(
    ctx,
    DOMAIN_LINE_POS.prefix,
    internshipDomain.toUpperCase(),
    "",
    DOMAIN_LINE_POS.y,
    DOMAIN_LINE_POS
  );

  const formattedStart = formatCertificateDate(startDate);
  const formattedEnd = formatCertificateDate(endDate);
  drawCenteredText(
    ctx,
    `From ${formattedStart} to ${formattedEnd}.`,
    DATE_LINE_POS.y,
    {
      fontSize: DATE_LINE_POS.fontSize,
      color: DATE_LINE_POS.color,
      family: FONT_SANS,
      weight: "bold",
    }
  );

  drawCenteredParagraph(ctx, STATIC_PARAGRAPH_POS.text, STATIC_PARAGRAPH_POS.y, STATIC_PARAGRAPH_POS);

  const detailValues = [registrationNo, department, college, internshipDomain];

  detailValues.forEach((value, index) => {
    drawDetailValue(
      ctx,
      value,
      DETAIL_BLOCK.startY + index * DETAIL_BLOCK.lineHeight
    );
  });

  const verifyUrl = buildCertificateVerifyUrl(displayCertNo);
  const qrImage = await buildQrImage(verifyUrl);
  ctx.drawImage(qrImage, QR_POS.x, QR_POS.y, QR_SIZE, QR_SIZE);

  const pngBuffer = canvas.toBuffer("image/png");
  const pdfBuffer = await pngBufferToPdfBuffer(pngBuffer);

  return { pngBuffer, pdfBuffer, canvas };
}
