import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";
import { PDFDocument, PageSizes, StandardFonts, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(SERVER_ROOT, "..");
const ASSET_DIR = path.join(SERVER_ROOT, "assets", "offer-letter");
const SRC_ASSETS = path.join(REPO_ROOT, "src", "assets");

const BRAND_BLUE = rgb(0.08, 0.22, 0.55);
const TEXT = rgb(0.07, 0.07, 0.07);
const TEXT_BOLD = rgb(0.02, 0.02, 0.02);
const PAPER = rgb(1, 1, 1);

/** Keep letterhead + signature from the template; replace the body with vector type. */
const HEADER_END = 0.188;
const FOOTER_START = 0.628;
const MARGIN_X = 0.09;

const LOGO_BAND = {
  top: 0.848,
  bottom: 0.928,
  left: 0.08,
  right: 0.08,
};

const LOGO_FILES = [
  { key: "MSME", names: ["NCS.jpg", "NCS.jpeg", "MSME.jpg", "MSME.jpeg"] },
  { key: "NCS", names: ["MSME.jpg", "MSME.jpeg", "NCS.jpg", "NCS.jpeg"] },
  { key: "ISO", names: ["ISO.jpg", "ISO.jpeg", "ISO.png"] },
  {
    key: "STARTUP_INDIA",
    names: ["STARTUP_INDIA.jpeg", "STARTUP_INDIA.jpg", "STARTUP_INDIA.png"],
  },
];

export const SAMPLE_OFFER_APPLICATION = {
  id: "sample",
  applicationId: "DCAL-05092026-A001",
  fullName: "Bokkasam Vamsi",
  email: "vamsib170@gmail.com",
  phone: "9845428526",
  college: "XYZ Engineering College",
  department: "Computer Science & Engineering",
  registrationNo: "DCAL-05092026-A001",
  program: "AI & Machine Learning",
  internshipStartDate: new Date("2025-11-24"),
  internshipEndDate: new Date("2026-03-31"),
  batch: {
    name: "Batch A - Nov 2025",
    startDate: new Date("2025-11-24"),
    endDate: new Date("2026-03-31"),
  },
};

function searchDirs() {
  return [
    ASSET_DIR,
    SRC_ASSETS,
    path.join(REPO_ROOT, "public"),
    path.join(
      process.env.USERPROFILE || "",
      ".cursor",
      "projects",
      "c-Users-Office-Downloads-deccanailabs",
      "assets"
    ),
  ].filter((dir) => dir && fs.existsSync(dir));
}

function resolveTemplatePath() {
  fs.mkdirSync(ASSET_DIR, { recursive: true });
  const dest = path.join(ASSET_DIR, "OL_Template.jpg");
  if (fs.existsSync(dest)) return dest;

  for (const dir of searchDirs()) {
    const match = fs.readdirSync(dir).find((file) => {
      const lower = file.toLowerCase();
      return /ol[_\s-]?template/.test(lower) && /\.(jpe?g|png)$/i.test(file);
    });
    if (!match) continue;
    const full = path.join(dir, match);
    if (full !== dest) fs.copyFileSync(full, dest);
    return dest;
  }

  const error = new Error(
    "Offer letter template not found. Add src/assets/OL_Template.jpg"
  );
  error.statusCode = 500;
  throw error;
}

function findExisting(dir, names) {
  if (!dir || !fs.existsSync(dir)) return null;
  for (const name of names) {
    const full = path.join(dir, name);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function resolveLogoPath({ key, names }) {
  for (const dir of searchDirs()) {
    const direct = findExisting(dir, names);
    if (direct) return direct;
    const needle = key.toLowerCase().replace(/_/g, "");
    const match = fs.readdirSync(dir).find((file) => {
      const lower = file.toLowerCase().replace(/[\s_-]/g, "");
      return lower.includes(needle) && /\.(jpe?g|png)$/i.test(file);
    });
    if (match) return path.join(dir, match);
  }
  return null;
}

function letterFields(application) {
  const program = String(application.program || "Internship").trim();
  return {
    name: application.fullName || "-",
    applicationId:
      application.applicationId || application.registrationNo || "-",
    program,
  };
}

function bodyBlocks(fields) {
  return [
    [{ text: "REG ID: " }, { text: fields.applicationId, bold: true }],
    [{ text: "Dear " }, { text: fields.name, bold: true }, { text: "," }],
    [
      { text: "We are delighted to welcome you to the " },
      { text: `45-Day ${fields.program}`, bold: true },
      { text: " course at " },
      { text: "DECCAN AI labs Pvt.Ltd.", bold: true },
    ],
    [
      {
        text: "Congratulations on successfully enrolling in this program. This course has been carefully designed to provide you with practical knowledge, hands-on experience, and industry-relevant skills in the field of ",
      },
      { text: fields.program, bold: true },
      {
        text: ". Throughout the 45-day learning journey, you will gain exposure to modern tools, real-world use cases, guided projects, and structured training that will help strengthen your technical foundation.",
      },
    ],
    [
      {
        text: "We encourage you to actively participate in every session, complete the assigned tasks, and make the most of the learning opportunities provided. Your commitment, curiosity, and consistency will play a key role in maximizing the benefits of this program.",
      },
    ],
    [
      {
        text: "DECCAN AI LABS is MSME, NCS, and ISO certified, and recognised under Startup India. Upon successful completion of the program, you will receive an official internship certificate from DECCAN AI LABS.",
      },
    ],
    [
      {
        text: "We are confident that this course will enhance your skills, boost your confidence, and prepare you for future academic and professional opportunities. We look forward to supporting you throughout this exciting learning experience and wish you great success in your journey with DECCAN AI labs Pvt.Ltd.",
      },
    ],
    [
      {
        text: "We welcome you to DECCAN AI labs Pvt.Ltd and wish you a productive, engaging, and successful learning experience.",
      },
    ],
  ];
}

function widthOf(font, boldFont, text, size, bold) {
  return (bold ? boldFont : font).widthOfTextAtSize(text, size);
}

function wrapRich(font, boldFont, runs, maxWidth, size) {
  const tokens = [];
  for (const run of runs) {
    const parts = String(run.text ?? "").split(/(\s+)/);
    for (const part of parts) {
      if (part) tokens.push({ text: part, bold: Boolean(run.bold) });
    }
  }

  const lines = [];
  let current = [];
  let currentWidth = 0;

  for (const token of tokens) {
    const isSpace = /^\s+$/.test(token.text);
    const w = widthOf(font, boldFont, token.text, size, token.bold);
    if (current.length && currentWidth + w > maxWidth && !isSpace) {
      while (current.length && /^\s+$/.test(current[current.length - 1].text)) {
        current.pop();
      }
      lines.push(current);
      current = [token];
      currentWidth = w;
    } else if (!current.length && isSpace) {
      continue;
    } else {
      current.push(token);
      currentWidth += w;
    }
  }

  if (current.length) lines.push(current);
  return lines;
}

function blocksHeight(font, boldFont, blocks, maxWidth, size, lineHeight, gap) {
  let height = 0;
  for (const runs of blocks) {
    height += wrapRich(font, boldFont, runs, maxWidth, size).length * lineHeight + gap;
  }
  return height - gap;
}

function fitType(font, boldFont, blocks, maxWidth, maxHeight) {
  let size = 11;
  while (size >= 9) {
    const lineHeight = size * 1.38;
    const gap = size * 0.62;
    if (blocksHeight(font, boldFont, blocks, maxWidth, size, lineHeight, gap) <= maxHeight) {
      return { size, lineHeight, gap };
    }
    size -= 0.25;
  }
  return { size: 9, lineHeight: 12.2, gap: 5 };
}

const LETTERHEAD_MAX_WIDTH = 1240;
const LOGO_MAX_EDGE = 240;

let letterheadJpegCache = null;
const logoPngCache = new Map();

async function getLetterheadJpeg() {
  if (letterheadJpegCache) return letterheadJpegCache;

  const cleanedDir = path.join(ASSET_DIR, "cleaned");
  const dest = path.join(cleanedDir, "OL_Template.sm.jpg");
  if (fs.existsSync(dest)) {
    letterheadJpegCache = fs.readFileSync(dest);
    return letterheadJpegCache;
  }

  const image = await loadImage(resolveTemplatePath());
  const scale = Math.min(1, LETTERHEAD_MAX_WIDTH / image.width);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  const bytes = canvas.toBuffer("image/jpeg", { quality: 0.82 });

  fs.mkdirSync(cleanedDir, { recursive: true });
  fs.writeFileSync(dest, bytes);
  letterheadJpegCache = bytes;
  return letterheadJpegCache;
}

async function embedRasterBytes(pdfDoc, bytes, kind = "jpg") {
  if (kind === "png") return pdfDoc.embedPng(bytes);
  try {
    return pdfDoc.embedJpg(bytes);
  } catch {
    return pdfDoc.embedPng(bytes);
  }
}

function isDarkPixel(data, i) {
  return data[i + 3] > 80 && data[i] < 70 && data[i + 1] < 70 && data[i + 2] < 70;
}

function isNotWhite(data, i) {
  return data[i + 3] > 80 && data[i] < 245 && data[i + 1] < 245 && data[i + 2] < 245;
}

function paintWhite(data, i) {
  data[i] = 255;
  data[i + 1] = 255;
  data[i + 2] = 255;
  data[i + 3] = 255;
}

/** Remove black leftover pixels in the four corners of rounded logo crops. */
async function cleanLogoBytes(filePath) {
  const image = await loadImage(filePath);
  const width = image.width;
  const height = image.height;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  const img = ctx.getImageData(0, 0, width, height);
  const { data } = img;
  const zone = Math.round(Math.min(width, height) * 0.2);
  const tip = Math.round(Math.min(width, height) * 0.09);

  const inCornerZone = (x, y) =>
    (x < zone || x >= width - zone) && (y < zone || y >= height - zone);
  const inCornerTip = (x, y) =>
    (x < tip || x >= width - tip) && (y < tip || y >= height - tip);

  const starts = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  const visited = new Uint8Array(width * height);

  for (const [startX, startY] of starts) {
    const stack = [[startX, startY]];
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      if (!inCornerZone(x, y)) continue;
      const idx = y * width + x;
      if (visited[idx]) continue;
      visited[idx] = 1;
      const i = idx * 4;
      if (!isDarkPixel(data, i)) continue;
      paintWhite(data, i);
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!inCornerTip(x, y)) continue;
      const i = (y * width + x) * 4;
      if (isNotWhite(data, i)) paintWhite(data, i);
    }
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toBuffer("image/png");
}

async function shrinkPng(bytes, maxEdge) {
  const image = await loadImage(bytes);
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  if (scale >= 1) return bytes;
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = createCanvas(width, height);
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);
  return canvas.toBuffer("image/png");
}

async function getCleanLogoPng(key, filePath) {
  const cached = logoPngCache.get(key);
  if (cached) return cached;

  const cleanedDir = path.join(ASSET_DIR, "cleaned");
  const cleanedPath = path.join(cleanedDir, `${key}.sm.png`);
  if (fs.existsSync(cleanedPath)) {
    const bytes = fs.readFileSync(cleanedPath);
    logoPngCache.set(key, bytes);
    return bytes;
  }

  const cleaned = await shrinkPng(await cleanLogoBytes(filePath), LOGO_MAX_EDGE);
  fs.mkdirSync(cleanedDir, { recursive: true });
  fs.writeFileSync(cleanedPath, cleaned);
  logoPngCache.set(key, cleaned);
  return cleaned;
}

async function embedLogos(pdfDoc) {
  const logos = [];
  for (const logo of LOGO_FILES) {
    const filePath = resolveLogoPath(logo);
    if (!filePath) continue;
    try {
      const cleaned = await getCleanLogoPng(logo.key, filePath);
      logos.push({ key: logo.key, image: await pdfDoc.embedPng(cleaned) });
    } catch (error) {
      console.warn(`Offer letter logo skipped (${logo.key}):`, error.message);
    }
  }
  return logos;
}

export async function warmupOfferLetterAssets() {
  try {
    await getLetterheadJpeg();
    for (const logo of LOGO_FILES) {
      const filePath = resolveLogoPath(logo);
      if (filePath) await getCleanLogoPng(logo.key, filePath);
    }
  } catch (error) {
    console.warn("Offer letter asset warmup skipped:", error.message);
  }
}

function drawTitle(page, boldFont, pageWidth, pageHeight) {
  const title = "OFFER LETTER";
  const size = 18;
  const width = boldFont.widthOfTextAtSize(title, size);
  const x = (pageWidth - width) / 2;
  const y = pageHeight * (1 - 0.225);

  page.drawText(title, {
    x,
    y,
    size,
    font: boldFont,
    color: BRAND_BLUE,
  });
  page.drawLine({
    start: { x, y: y - 3.2 },
    end: { x: x + width, y: y - 3.2 },
    thickness: 1.15,
    color: BRAND_BLUE,
  });

  return y - 22;
}

function drawRichLine(page, font, boldFont, line, x, y, size) {
  let cursorX = x;
  for (const part of line) {
    const active = part.bold ? boldFont : font;
    page.drawText(part.text, {
      x: cursorX,
      y,
      size,
      font: active,
      color: part.bold ? TEXT_BOLD : TEXT,
    });
    cursorX += active.widthOfTextAtSize(part.text, size);
  }
}

export async function renderOfferLetter(application) {
  const fields = letterFields(application);
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Offer Letter - ${fields.name}`);
  pdfDoc.setAuthor("DECCAN AI LABS Private Limited");
  pdfDoc.setCreator("DECCAN AI LABS");
  pdfDoc.setProducer("DECCAN AI LABS");

  const page = pdfDoc.addPage(PageSizes.A4);
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const letterheadJpeg = await getLetterheadJpeg();
  const [font, boldFont, letterhead, logos] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
    embedRasterBytes(pdfDoc, letterheadJpeg, "jpg"),
    embedLogos(pdfDoc),
  ]);

  page.drawImage(letterhead, {
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
  });

  const whiteBottom = pageHeight * (1 - FOOTER_START);
  const whiteTop = pageHeight * (1 - HEADER_END);
  page.drawRectangle({
    x: 0,
    y: whiteBottom,
    width: pageWidth,
    height: whiteTop - whiteBottom,
    color: PAPER,
  });

  let cursorY = drawTitle(page, boldFont, pageWidth, pageHeight);
  const textLeft = pageWidth * MARGIN_X;
  const maxWidth = pageWidth * (1 - MARGIN_X * 2);
  const minY = pageHeight * (1 - FOOTER_START) + 8;
  const blocks = bodyBlocks(fields);
  const { size, lineHeight, gap } = fitType(
    font,
    boldFont,
    blocks,
    maxWidth,
    cursorY - minY
  );

  for (const runs of blocks) {
    const lines = wrapRich(font, boldFont, runs, maxWidth, size);
    for (const line of lines) {
      cursorY -= lineHeight;
      if (cursorY < minY) break;
      drawRichLine(page, font, boldFont, line, textLeft, cursorY, size);
    }
    cursorY -= gap;
    if (cursorY < minY) break;
  }

  if (logos.length) {
    const bandLeft = pageWidth * LOGO_BAND.left;
    const bandRight = pageWidth * LOGO_BAND.right;
    const bandTop = pageHeight * (1 - LOGO_BAND.top);
    const bandBottom = pageHeight * (1 - LOGO_BAND.bottom);
    const bandWidth = pageWidth - bandLeft - bandRight;
    const bandHeight = bandTop - bandBottom;

    page.drawRectangle({
      x: bandLeft,
      y: bandBottom,
      width: bandWidth,
      height: bandHeight,
      color: PAPER,
    });

    const slotWidth = bandWidth / logos.length;
    const maxH = bandHeight * 0.88;
    const maxW = slotWidth * 0.78;

    logos.forEach((logo, index) => {
      const ratio = Math.min(maxW / logo.image.width, maxH / logo.image.height);
      const drawW = logo.image.width * ratio;
      const drawH = logo.image.height * ratio;
      const x = bandLeft + index * slotWidth + (slotWidth - drawW) / 2;
      const y = bandBottom + (bandHeight - drawH) / 2;
      page.drawImage(logo.image, { x, y, width: drawW, height: drawH });
    });
  }

  const pdfBuffer = Buffer.from(await pdfDoc.save({ useObjectStreams: false }));
  const safeId = String(application.applicationId || application.id || "offer").replace(
    /[^\w.-]+/g,
    "-"
  );

  return {
    pdfBuffer,
    filename: `Offer-Letter-${safeId}.pdf`,
  };
}

export async function renderSampleOfferLetter() {
  return renderOfferLetter(SAMPLE_OFFER_APPLICATION);
}
