import prisma from "../config/prisma.js";

/**
 * Fallback only for manual certificate creates without an application.
 * Application-linked certificates use the application ID as certNo.
 */
const CERT_PREFIX = "DCAL";
const COUNTER_KEY = "certificateNo";

export async function generateCertificateNo(client = null) {
  const db = client || prisma;

  const counter = await db.sequenceCounter.upsert({
    where: { key: COUNTER_KEY },
    create: { key: COUNTER_KEY, value: 1 },
    update: { value: { increment: 1 } },
  });

  const sequence = counter?.value ?? 1;
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();

  return `${CERT_PREFIX}-CERT-${dd}${mm}${yyyy}-${String(sequence).padStart(4, "0")}`;
}
