import crypto from "crypto";
import prisma from "../config/prisma.js";

function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a ?? ""), "utf8");
  const right = Buffer.from(String(b ?? ""), "utf8");
  const max = Math.max(left.length, right.length, 1);
  const paddedLeft = Buffer.alloc(max);
  const paddedRight = Buffer.alloc(max);
  left.copy(paddedLeft);
  right.copy(paddedRight);
  return (
    crypto.timingSafeEqual(paddedLeft, paddedRight) && left.length === right.length
  );
}

function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function parseIdentifier(identifier) {
  const raw = String(identifier ?? "").trim();
  if (!raw) return { kind: "empty", value: "" };

  if (raw.includes("@")) {
    return { kind: "email", value: normalizeEmail(raw) };
  }

  return { kind: "phone", value: normalizePhone(raw) };
}

export const loginAdmin = (req, res) => {
  const { identifier, password } = req.body || {};
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPhone = normalizePhone(process.env.ADMIN_PHONE);
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminKey = process.env.ADMIN_KEY || "";

  if (!adminPassword || !adminKey || (!adminEmail && !adminPhone)) {
    return res.status(503).json({
      success: false,
      message: "Admin login is not configured on the server",
    });
  }

  const parsed = parseIdentifier(identifier);
  if (parsed.kind === "empty" || !password) {
    return res.status(400).json({
      success: false,
      message: "Email/phone and password are required",
    });
  }

  const identifierOk =
    (parsed.kind === "email" &&
      adminEmail &&
      timingSafeEqualString(parsed.value, adminEmail)) ||
    (parsed.kind === "phone" &&
      adminPhone &&
      timingSafeEqualString(parsed.value, adminPhone));

  const passwordOk = timingSafeEqualString(password, adminPassword);

  if (!identifierOk || !passwordOk) {
    return res.status(401).json({
      success: false,
      message: "Invalid email/phone or password",
    });
  }

  return res.json({
    success: true,
    message: "Admin access granted",
    data: { token: adminKey },
  });
};

export const verifyAdmin = (req, res) => {
  res.json({ success: true, message: "Admin access granted" });
};

export const getStats = async (req, res, next) => {
  try {
    const [totalContacts, totalApplications, groupedByProgram, groupedByStatus, totalPrograms] =
      await Promise.all([
        prisma.contact.count(),
        prisma.internshipApplication.count(),
        prisma.internshipApplication.groupBy({
          by: ["program"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
        prisma.internshipApplication.groupBy({
          by: ["status"],
          _count: { id: true },
        }),
        prisma.program.count({ where: { isActive: true } }),
      ]);

    const applicationsPerProgram = groupedByProgram.map((row) => ({
      program: row.program,
      count: row._count.id,
    }));
    const statusBreakdown = groupedByStatus.map((row) => ({
      status: row.status,
      count: row._count.id,
    }));

    const statusCounts = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      completed: 0,
    };
    statusBreakdown.forEach(({ status, count }) => {
      statusCounts[status] = count;
    });

    res.json({
      success: true,
      data: {
        totalContacts,
        totalApplications,
        totalPrograms,
        applicationsPerProgram,
        statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};
