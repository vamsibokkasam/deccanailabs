import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { getSiteUrl } from "../config/site.js";
import prisma from "../config/prisma.js";
import { rasterizePdfToPng } from "./certificatePdfRaster.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.join(__dirname, "..");

export const CANVAS_WIDTH = 1800;
export const CANVAS_HEIGHT = 1272;

export const PDF_TEMPLATE_PATH = path.join(
  __dirname,
  "../assets/certificates/CERTIFICATE.pdf"
);

export const TEMPLATE_PATH = path.join(
  __dirname,
  "../assets/certificates/blank_template.png"
);

export const FONT_SERIF_BOLD = "Georgia";
export const FONT_SANS = "Arial";

const PAPER = rgb(1, 1, 1);
const BRAND_BLUE = rgb(0.102, 0.227, 0.42);
const BODY_TEXT = rgb(0.133, 0.133, 0.133);
const LABEL_TEXT = rgb(0.08, 0.08, 0.08);

export const CERT_NO_POS = { right: 72, y: 64, fontSize: 18, color: "#1a3a6b" };
export const QR_POS = { x: 1548, y: 96 };
export const QR_SIZE = 138;

export const NAME_POS = { y: 492, fontSize: 50, color: "#1a3a6b", family: FONT_SANS };

const COMPLETION_POS = {
  y: 560,
  fontSize: 23,
  text: "Has successfully completed the internship at DECCAN AI LABS PVT.LTD. in",
};

const DOMAIN_POS = { y: 600, fontSize: 28 };

export const DATE_LINE_POS = { y: 646, fontSize: 23, color: "#222222" };

const INTERN_PARA = {
  y: 700,
  fontSize: 22,
  lineHeight: 32,
  lines: [
    "During the internship the intern worked on meaningful projects, demonstrated dedication,",
    "And gained practical exposure to industry-relevant technologies and real-world applications.",
  ],
};

const BODY_CLEAR = { x: 110, y: 478, w: 1580, h: 198 };
const DETAILS_CLEAR = { x: 40, y: 798, w: 720, h: 250 };
/**
 * Logo row sits above the gold rule. Do not paint white over the rule —
 * leftover template logos are cleared here, then our logos are drawn in this band.
 * Bottom of this box must stay above the gold line (~y 1210 on the 1800×1272 canvas).
 */
const FOOTER_CLEAR = { x: 128, y: 1058, w: 1080, h: 116 };
const FOOTER_GREEN = rgb(0.18, 0.67, 0.32);

export const DETAIL_BLOCK = {
  labelX: 128,
  startY: 832,
  lineHeight: 46,
  fontSize: 20,
  color: "#222222",
};

const DETAIL_LABELS = [
  "Registration No.",
  "Department",
  "College",
  "Internship Domain",
];

const FOOTER_LOGO_FILES = [
  ["MSME.sm.png", "MSME.png"],
  ["NCS.sm.png", "NCS.png"],
  ["ISO.sm.png", "ISO.png"],
  ["STARTUP_INDIA.sm.png", "STARTUP_INDIA.png"],
];

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

function scale(page) {
  const { width, height } = page.getSize();
  return {
    width,
    height,
    sx: width / CANVAS_WIDTH,
    sy: height / CANVAS_HEIGHT,
  };
}

function pdfY(height, canvasY, size) {
  return height - ((canvasY + size) * height) / CANVAS_HEIGHT;
}

function pdfRect(page, box) {
  const { sx, sy, height } = scale(page);
  return {
    x: box.x * sx,
    y: height - (box.y + box.h) * sy,
    width: box.w * sx,
    height: box.h * sy,
  };
}

function setFont(ctx, family, size, weight = "normal") {
  ctx.font = `${weight} ${size}px ${family}`;
}

function drawCenteredCanvas(ctx, text, y, { fontSize, color, family, weight = "normal" }) {
  setFont(ctx, family, fontSize, weight);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(text, CANVAS_WIDTH / 2, y);
}

function drawCenteredPdf(page, text, canvasY, size, font, color) {
  const { width, height, sy } = scale(page);
  const pdfSize = size * sy;
  page.drawText(text, {
    x: (width - font.widthOfTextAtSize(text, pdfSize)) / 2,
    y: pdfY(height, canvasY, size),
    size: pdfSize,
    font,
    color,
  });
}

function footerLogoPaths() {
  const dir = path.join(SERVER_ROOT, "assets", "offer-letter", "cleaned");
  return FOOTER_LOGO_FILES.map((names) =>
    names.map((name) => path.join(dir, name)).find((file) => fs.existsSync(file))
  ).filter(Boolean);
}

function detailColumns(measure, size, sx) {
  const labelX = DETAIL_BLOCK.labelX * sx;
  const longest = Math.max(...DETAIL_LABELS.map((label) => measure(label, size)));
  const colonX = labelX + longest + 12 * sx;
  const valueX = colonX + measure(":", size) + 10 * sx;
  return { labelX, colonX, valueX };
}

async function buildQrPng(verifyUrl) {
  return QRCode.toBuffer(verifyUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: QR_SIZE * 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export function buildCertificateVerifyUrl(certNo) {
  const siteUrl = getSiteUrl();
  const certPath = String(certNo || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return `${siteUrl}/verify/${encodeURIComponent(certPath)}`;
}

export async function resolveDisplayCertNo(certificateDoc) {
  const populatedAppId =
    certificateDoc.application?.applicationId ||
    certificateDoc.applicationId?.applicationId;
  if (populatedAppId) return populatedAppId;

  const linkedId =
    certificateDoc.application?.id ||
    certificateDoc.applicationId?._id ||
    certificateDoc.applicationId?.id ||
    (typeof certificateDoc.applicationId === "string"
      ? certificateDoc.applicationId
      : null);

  if (linkedId) {
    const application = await prisma.internshipApplication.findUnique({
      where: { id: String(linkedId) },
      select: { applicationId: true },
    });
    if (application?.applicationId) return application.applicationId;
  }

  return certificateDoc.certNo;
}

function detailValues(fields) {
  return [
    fields.registrationNo,
    fields.department,
    fields.college,
    fields.internshipDomain,
  ];
}

function drawClearsOnPdf(page) {
  for (const box of [BODY_CLEAR, DETAILS_CLEAR, FOOTER_CLEAR]) {
    page.drawRectangle({
      ...pdfRect(page, box),
      color: PAPER,
    });
  }
}

function drawBodyOnPdf(page, fonts, fields) {
  const { font, bold } = fonts;

  drawCenteredPdf(
    page,
    fields.recipientName.toUpperCase(),
    NAME_POS.y,
    NAME_POS.fontSize,
    bold,
    BRAND_BLUE
  );
  drawCenteredPdf(
    page,
    COMPLETION_POS.text,
    COMPLETION_POS.y,
    COMPLETION_POS.fontSize,
    font,
    BODY_TEXT
  );
  drawCenteredPdf(
    page,
    fields.internshipDomain.toUpperCase(),
    DOMAIN_POS.y,
    DOMAIN_POS.fontSize,
    bold,
    BRAND_BLUE
  );
  drawCenteredPdf(
    page,
    `From ${fields.formattedStart} to ${fields.formattedEnd}.`,
    DATE_LINE_POS.y,
    DATE_LINE_POS.fontSize,
    bold,
    BODY_TEXT
  );
  INTERN_PARA.lines.forEach((line, index) => {
    drawCenteredPdf(
      page,
      line,
      INTERN_PARA.y + index * INTERN_PARA.lineHeight,
      INTERN_PARA.fontSize,
      font,
      BODY_TEXT
    );
  });
}

function drawDetailsOnPdf(page, fonts, fields) {
  const { font, bold } = fonts;
  const { height, sx, sy } = scale(page);
  const size = DETAIL_BLOCK.fontSize * sy;
  const values = detailValues(fields);
  const columns = detailColumns(
    (text, textSize) => bold.widthOfTextAtSize(text, textSize),
    size,
    sx
  );

  DETAIL_LABELS.forEach((label, index) => {
    const canvasY = DETAIL_BLOCK.startY + index * DETAIL_BLOCK.lineHeight;
    const y = pdfY(height, canvasY, DETAIL_BLOCK.fontSize);
    page.drawText(label, {
      x: columns.labelX,
      y,
      size,
      font: bold,
      color: LABEL_TEXT,
    });
    page.drawText(":", {
      x: columns.colonX,
      y,
      size,
      font: bold,
      color: LABEL_TEXT,
    });
    page.drawText(String(values[index] || "—"), {
      x: columns.valueX,
      y,
      size,
      font,
      color: BODY_TEXT,
    });
  });
}

async function drawFooterLogosOnPdf(page, pdfDoc) {
  const paths = footerLogoPaths();
  if (!paths.length) return;

  const logos = [];
  for (const file of paths) {
    logos.push(await pdfDoc.embedPng(fs.readFileSync(file)));
  }

  const { x, y, width, height } = pdfRect(page, FOOTER_CLEAR);
  const slot = width / logos.length;
  const maxH = height * 0.95;
  const maxW = slot * 0.94;

  const placed = logos.map((image, index) => {
    const ratio = Math.min(maxW / image.width, maxH / image.height);
    const drawW = image.width * ratio;
    const drawH = image.height * ratio;
    return {
      image,
      x: x + index * slot,
      y: y + (height - drawH) / 2,
      width: drawW,
      height: drawH,
    };
  });

  placed.forEach((logo) => {
    page.drawImage(logo.image, {
      x: logo.x,
      y: logo.y,
      width: logo.width,
      height: logo.height,
    });
  });

  const barH = height * 0.55;
  for (let index = 0; index < placed.length - 1; index += 1) {
    const left = placed[index].x + placed[index].width;
    const right = placed[index + 1].x;
    page.drawRectangle({
      x: (left + right) / 2 - 0.7,
      y: y + (height - barH) / 2,
      width: 1.4,
      height: barH,
      color: FOOTER_GREEN,
    });
  }
}

function drawChromeOnPdf(page, fonts, fields) {
  const { bold } = fonts;
  const { width, height, sx, sy } = scale(page);
  const certLabel = `Certificate No: ${fields.displayCertNo}`;
  const certSize = CERT_NO_POS.fontSize * sy;
  page.drawText(certLabel, {
    x: width - CERT_NO_POS.right * sx - bold.widthOfTextAtSize(certLabel, certSize),
    y: pdfY(height, CERT_NO_POS.y, CERT_NO_POS.fontSize),
    size: certSize,
    font: bold,
    color: BRAND_BLUE,
  });
}

function drawClearsOnCanvas(ctx) {
  ctx.fillStyle = "#ffffff";
  for (const box of [BODY_CLEAR, DETAILS_CLEAR, FOOTER_CLEAR]) {
    ctx.fillRect(box.x, box.y, box.w, box.h);
  }
}

function drawBodyOnCanvas(ctx, fields) {
  drawCenteredCanvas(ctx, fields.recipientName.toUpperCase(), NAME_POS.y, {
    fontSize: NAME_POS.fontSize,
    color: NAME_POS.color,
    family: FONT_SANS,
    weight: "bold",
  });
  drawCenteredCanvas(ctx, COMPLETION_POS.text, COMPLETION_POS.y, {
    fontSize: COMPLETION_POS.fontSize,
    color: "#222222",
    family: FONT_SANS,
  });
  drawCenteredCanvas(ctx, fields.internshipDomain.toUpperCase(), DOMAIN_POS.y, {
    fontSize: DOMAIN_POS.fontSize,
    color: "#1a3a6b",
    family: FONT_SANS,
    weight: "bold",
  });
  drawCenteredCanvas(
    ctx,
    `From ${fields.formattedStart} to ${fields.formattedEnd}.`,
    DATE_LINE_POS.y,
    {
      fontSize: DATE_LINE_POS.fontSize,
      color: DATE_LINE_POS.color,
      family: FONT_SANS,
      weight: "bold",
    }
  );
  INTERN_PARA.lines.forEach((line, index) => {
    drawCenteredCanvas(ctx, line, INTERN_PARA.y + index * INTERN_PARA.lineHeight, {
      fontSize: INTERN_PARA.fontSize,
      color: "#222222",
      family: FONT_SANS,
    });
  });
}

function drawDetailsOnCanvas(ctx, fields) {
  const values = detailValues(fields);
  setFont(ctx, FONT_SANS, DETAIL_BLOCK.fontSize, "bold");
  const columns = detailColumns((text) => ctx.measureText(text).width, DETAIL_BLOCK.fontSize, 1);

  DETAIL_LABELS.forEach((label, index) => {
    const y = DETAIL_BLOCK.startY + index * DETAIL_BLOCK.lineHeight;
    setFont(ctx, FONT_SANS, DETAIL_BLOCK.fontSize, "bold");
    ctx.fillStyle = "#141414";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, columns.labelX, y);
    ctx.fillText(":", columns.colonX, y);
    setFont(ctx, FONT_SANS, DETAIL_BLOCK.fontSize);
    ctx.fillStyle = DETAIL_BLOCK.color;
    ctx.fillText(String(values[index] || "—"), columns.valueX, y);
  });
}

async function drawFooterLogosOnCanvas(ctx) {
  const paths = footerLogoPaths();
  if (!paths.length) return;

  const images = [];
  for (const file of paths) {
    images.push(await loadImage(file));
  }

  const { x, y, w, h } = FOOTER_CLEAR;
  const slot = w / images.length;
  const maxH = h * 0.95;
  const maxW = slot * 0.94;

  const placed = images.map((image, index) => {
    const ratio = Math.min(maxW / image.width, maxH / image.height);
    const drawW = image.width * ratio;
    const drawH = image.height * ratio;
    return {
      image,
      x: x + index * slot,
      y: y + (h - drawH) / 2,
      width: drawW,
      height: drawH,
    };
  });

  placed.forEach((logo) => {
    ctx.drawImage(logo.image, logo.x, logo.y, logo.width, logo.height);
  });

  const barH = h * 0.55;
  ctx.fillStyle = "#2eab52";
  for (let index = 0; index < placed.length - 1; index += 1) {
    const left = placed[index].x + placed[index].width;
    const right = placed[index + 1].x;
    ctx.fillRect((left + right) / 2 - 1, y + (h - barH) / 2, 2, barH);
  }
}

async function renderCertificatePdf(fields) {
  if (!fs.existsSync(PDF_TEMPLATE_PATH)) {
    throw new Error(`Certificate template missing at ${PDF_TEMPLATE_PATH}`);
  }

  const templateBytes = fs.readFileSync(PDF_TEMPLATE_PATH);
  const templateDoc = await PDFDocument.load(templateBytes);
  const pdfDoc = await PDFDocument.create();
  const [page] = await pdfDoc.copyPages(templateDoc, [0]);
  pdfDoc.addPage(page);

  const fonts = {
    font: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };

  drawClearsOnPdf(page);
  drawChromeOnPdf(page, fonts, fields);
  drawBodyOnPdf(page, fonts, fields);
  drawDetailsOnPdf(page, fonts, fields);
  await drawFooterLogosOnPdf(page, pdfDoc);

  const qrImage = await pdfDoc.embedPng(fields.qrPng);
  const { width, height, sx, sy } = scale(page);
  page.drawImage(qrImage, {
    x: QR_POS.x * sx,
    y: height - ((QR_POS.y + QR_SIZE) * height) / CANVAS_HEIGHT,
    width: QR_SIZE * sx,
    height: QR_SIZE * sy,
  });

  return Buffer.from(await pdfDoc.save());
}

async function renderCertificatePngFallback(fields) {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Certificate PNG fallback missing at ${TEMPLATE_PATH}`);
  }
  const template = await loadImage(TEMPLATE_PATH);
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(template, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawClearsOnCanvas(ctx);

  setFont(ctx, FONT_SANS, CERT_NO_POS.fontSize, "bold");
  ctx.fillStyle = CERT_NO_POS.color;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(
    `Certificate No: ${fields.displayCertNo}`,
    CANVAS_WIDTH - CERT_NO_POS.right,
    CERT_NO_POS.y
  );

  drawBodyOnCanvas(ctx, fields);
  drawDetailsOnCanvas(ctx, fields);
  await drawFooterLogosOnCanvas(ctx);

  const qrImage = await loadImage(fields.qrPng);
  ctx.drawImage(qrImage, QR_POS.x, QR_POS.y, QR_SIZE, QR_SIZE);

  return canvas.toBuffer("image/png");
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
  const formattedStart = formatCertificateDate(startDate);
  const formattedEnd = formatCertificateDate(endDate);
  const verifyUrl = buildCertificateVerifyUrl(displayCertNo);
  const qrPng = await buildQrPng(verifyUrl);
  const fields = {
    displayCertNo,
    recipientName,
    registrationNo,
    department,
    college,
    internshipDomain,
    formattedStart,
    formattedEnd,
    qrPng,
  };

  const pdfBuffer = await renderCertificatePdf(fields);

  let pngBuffer;
  try {
    pngBuffer = await rasterizePdfToPng(pdfBuffer, CANVAS_WIDTH);
  } catch (error) {
    console.warn(
      "Could not rasterize certificate PDF; using PNG fallback:",
      error.message
    );
    pngBuffer = await renderCertificatePngFallback(fields);
  }

  return { pngBuffer, pdfBuffer };
}
