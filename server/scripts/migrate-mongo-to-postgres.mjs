import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import prisma from "../config/prisma.js";

dotenv.config();

const APPLICATION_STATUSES = ["pending", "reviewed", "accepted", "rejected", "completed"];
const APPLICATION_SOURCES = ["internship", "course"];
const PAYMENT_STATUSES = ["pending", "verified", "rejected"];
const CERTIFICATE_STATUSES = ["valid", "revoked"];

function toId(value) {
  if (value == null) return null;
  if (typeof value === "string") return value || null;
  return String(value);
}

function text(value, fallback = "") {
  if (value == null) return fallback;
  const textValue = String(value).trim();
  return textValue || fallback;
}

function emptyToNull(value) {
  if (value == null) return null;
  const textValue = String(value).trim();
  return textValue ? textValue : null;
}

function asEnum(value, allowed, fallback = null) {
  if (value == null || value === "") return fallback;
  return allowed.includes(value) ? value : fallback;
}

function databaseNameFromUri(uri) {
  const match = String(uri).match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+)/);
  return match?.[1] || "deccanailabs";
}

async function getCollection(db, names) {
  const collections = await db.listCollections().toArray();
  const available = new Set(collections.map((item) => item.name));

  for (const name of names) {
    if (available.has(name)) return db.collection(name);
  }

  return db.collection(names[0]);
}

async function countSafe(collection) {
  try {
    return await collection.countDocuments();
  } catch {
    return 0;
  }
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const databaseUrl = process.env.DATABASE_URL;
  const errors = [];

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is required. Uncomment it in server/.env for this one-time import."
    );
  }

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const mongo = new MongoClient(mongoUri);
  await mongo.connect();

  const db = mongo.db(databaseNameFromUri(mongoUri));
  const collectionNames = (await db.listCollections().toArray()).map((item) => item.name);

  console.log(`Reading MongoDB database: ${db.databaseName}`);
  console.log(`Collections: ${collectionNames.join(", ") || "(none)"}`);

  const programs = await getCollection(db, ["programs", "Programs"]);
  const batches = await getCollection(db, ["batches", "Batches"]);
  const applications = await getCollection(db, [
    "internshipapplications",
    "internshipApplications",
    "InternshipApplication",
  ]);
  const certificates = await getCollection(db, ["certificates", "Certificates"]);
  const contacts = await getCollection(db, ["contacts", "Contacts"]);
  const counters = await getCollection(db, [
    "sequencecounters",
    "sequenceCounters",
    "SequenceCounter",
  ]);

  const mongoCounts = {
    programs: await countSafe(programs),
    batches: await countSafe(batches),
    applications: await countSafe(applications),
    certificates: await countSafe(certificates),
    contacts: await countSafe(contacts),
    counters: await countSafe(counters),
  };

  console.log("MongoDB counts:", mongoCounts);
  console.log(
    "Starting copy. Payment screenshots make applications slow — this can take several minutes."
  );

  console.log(`Copying ${mongoCounts.programs} programs...`);
  const programDocs = await programs.find().toArray();
  const importedProgramIds = new Set();

  for (const doc of programDocs) {
    const id = toId(doc._id);
    try {
      await prisma.program.upsert({
        where: { id },
        create: {
          id,
          title: doc.title,
          description: doc.description,
          duration: doc.duration || "8-12 weeks",
          isActive: doc.isActive !== false,
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.updatedAt || doc.createdAt || new Date(),
        },
        update: {
          title: doc.title,
          description: doc.description,
          duration: doc.duration || "8-12 weeks",
          isActive: doc.isActive !== false,
        },
      });
      importedProgramIds.add(id);
    } catch (error) {
      errors.push(`Program ${id}: ${error.message}`);
    }
  }

  const existingProgramIds = new Set(
    (await prisma.program.findMany({ select: { id: true } })).map((row) => row.id)
  );

  console.log(`Programs copied: ${importedProgramIds.size}. Copying ${mongoCounts.batches} batches...`);
  const batchDocs = await batches.find().toArray();
  const importedBatchIds = new Set();

  for (const doc of batchDocs) {
    const id = toId(doc._id);
    let programId = toId(doc.programId);

    if (programId && !existingProgramIds.has(programId) && !importedProgramIds.has(programId)) {
      const byTitle = await prisma.program.findFirst({
        where: { title: doc.programTitle || undefined },
      });
      programId = byTitle?.id || null;
    }

    if (!programId) {
      errors.push(`Batch ${id}: missing programId (kept in Mongo, not copied)`);
      continue;
    }

    try {
      await prisma.batch.upsert({
        where: { id },
        create: {
          id,
          programId,
          programTitle: doc.programTitle,
          name: doc.name,
          startDate: doc.startDate,
          endDate: doc.endDate,
          isActive: doc.isActive !== false,
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.updatedAt || doc.createdAt || new Date(),
        },
        update: {
          programId,
          programTitle: doc.programTitle,
          name: doc.name,
          startDate: doc.startDate,
          endDate: doc.endDate,
          isActive: doc.isActive !== false,
        },
      });
      importedBatchIds.add(id);
      existingProgramIds.add(programId);
    } catch (error) {
      errors.push(`Batch ${id}: ${error.message}`);
    }
  }

  const existingBatchIds = new Set(
    (await prisma.batch.findMany({ select: { id: true } })).map((row) => row.id)
  );

  console.log(
    `Batches copied: ${importedBatchIds.size}. Copying ${mongoCounts.applications} applications one by one...`
  );

  let applicationIndex = 0;
  for await (const doc of applications.find()) {
    applicationIndex += 1;
    const id = toId(doc._id);
    console.log(
      `Application ${applicationIndex}/${mongoCounts.applications} ${doc.applicationId || id}`
    );
    let batchId = toId(doc.batchId);
    if (batchId && !existingBatchIds.has(batchId) && !importedBatchIds.has(batchId)) {
      errors.push(`Application ${id}: batch ${batchId} not found; copying application without batch`);
      batchId = null;
    }

    try {
      await prisma.internshipApplication.upsert({
        where: { id },
        create: {
          id,
          applicationId: emptyToNull(doc.applicationId),
          fullName: doc.fullName,
          email: String(doc.email || "").toLowerCase(),
          phone: doc.phone,
          college: doc.college || "",
          registrationNo: doc.registrationNo || "",
          department: doc.department || "",
          internshipStartDate: doc.internshipStartDate || null,
          internshipEndDate: doc.internshipEndDate || null,
          batchId,
          program: doc.program,
          message: doc.message || "",
          source: asEnum(doc.source, APPLICATION_SOURCES, "internship"),
          feeAmount: Number(doc.feeAmount || 0),
          paymentMethod: doc.payment?.method === "upi" ? "upi" : null,
          paymentTransactionId: emptyToNull(doc.payment?.transactionId),
          paymentScreenshotData: doc.payment?.screenshotData || null,
          paymentStatus: asEnum(doc.payment?.status, PAYMENT_STATUSES),
          paymentVerifiedAt: doc.payment?.verifiedAt || null,
          status: asEnum(doc.status, APPLICATION_STATUSES, "pending"),
          completedAt: doc.completedAt || null,
          certificateEmailedAt: doc.certificateEmailedAt || null,
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.updatedAt || doc.createdAt || new Date(),
        },
        update: {
          applicationId: emptyToNull(doc.applicationId),
          fullName: doc.fullName,
          email: String(doc.email || "").toLowerCase(),
          phone: doc.phone,
          college: doc.college || "",
          registrationNo: doc.registrationNo || "",
          department: doc.department || "",
          internshipStartDate: doc.internshipStartDate || null,
          internshipEndDate: doc.internshipEndDate || null,
          batchId,
          program: doc.program,
          message: doc.message || "",
          source: asEnum(doc.source, APPLICATION_SOURCES, "internship"),
          feeAmount: Number(doc.feeAmount || 0),
          paymentMethod: doc.payment?.method === "upi" ? "upi" : null,
          paymentTransactionId: emptyToNull(doc.payment?.transactionId),
          paymentScreenshotData: doc.payment?.screenshotData || null,
          paymentStatus: asEnum(doc.payment?.status, PAYMENT_STATUSES),
          paymentVerifiedAt: doc.payment?.verifiedAt || null,
          status: asEnum(doc.status, APPLICATION_STATUSES, "pending"),
          completedAt: doc.completedAt || null,
          certificateEmailedAt: doc.certificateEmailedAt || null,
        },
      });
    } catch (error) {
      errors.push(`Application ${id}: ${error.message}`);
    }
  }

  console.log(`Applications copied: ${applicationIndex}. Copying ${mongoCounts.certificates} certificates...`);

  const existingApplicationIds = new Set(
    (await prisma.internshipApplication.findMany({ select: { id: true } })).map((row) => row.id)
  );

  const certificateDocs = await certificates.find().toArray();

  for (const doc of certificateDocs) {
    const id = toId(doc._id);
    let applicationId = toId(doc.applicationId);
    if (applicationId && !existingApplicationIds.has(applicationId)) {
      errors.push(
        `Certificate ${id}: application ${applicationId} not found; copying certificate without application link`
      );
      applicationId = null;
    }

    try {
      await prisma.certificate.upsert({
        where: { id },
        create: {
          id,
          certNo: doc.certNo,
          recipientName: doc.recipientName,
          registrationNo: doc.registrationNo || "",
          department: doc.department || "",
          college: doc.college || "",
          internshipDomain: doc.internshipDomain,
          startDate: doc.startDate,
          endDate: doc.endDate,
          applicationId,
          status: asEnum(doc.status, CERTIFICATE_STATUSES, "valid"),
          issuedAt: doc.issuedAt || doc.createdAt || new Date(),
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.updatedAt || doc.createdAt || new Date(),
        },
        update: {
          certNo: doc.certNo,
          recipientName: doc.recipientName,
          registrationNo: doc.registrationNo || "",
          department: doc.department || "",
          college: doc.college || "",
          internshipDomain: doc.internshipDomain,
          startDate: doc.startDate,
          endDate: doc.endDate,
          applicationId,
          status: asEnum(doc.status, CERTIFICATE_STATUSES, "valid"),
          issuedAt: doc.issuedAt || doc.createdAt || new Date(),
        },
      });
    } catch (error) {
      errors.push(`Certificate ${id}: ${error.message}`);
    }
  }

  const contactDocs = await contacts.find().toArray();

  for (const doc of contactDocs) {
    const id = toId(doc._id);
    try {
      await prisma.contact.upsert({
        where: { id },
        create: {
          id,
          firstName: text(doc.firstName, "Unknown"),
          lastName: text(doc.lastName),
          email: text(doc.email).toLowerCase(),
          whatsapp: text(doc.whatsapp || doc.phone),
          internship: text(doc.internship),
          message: text(doc.message),
          createdAt: doc.createdAt || new Date(),
          updatedAt: doc.updatedAt || doc.createdAt || new Date(),
        },
        update: {
          firstName: text(doc.firstName, "Unknown"),
          lastName: text(doc.lastName),
          email: text(doc.email).toLowerCase(),
          whatsapp: text(doc.whatsapp || doc.phone),
          internship: text(doc.internship),
          message: text(doc.message),
        },
      });
    } catch (error) {
      errors.push(`Contact ${id}: ${error.message}`);
    }
  }

  const counterDocs = await counters.find().toArray();

  for (const doc of counterDocs) {
    const key = doc.key;
    if (!key) continue;
    try {
      await prisma.sequenceCounter.upsert({
        where: { key },
        create: { key, value: Number(doc.value || 0) },
        update: { value: Number(doc.value || 0) },
      });
    } catch (error) {
      errors.push(`Counter ${key}: ${error.message}`);
    }
  }

  if (importedProgramIds.size > 0) {
    const seedOnly = await prisma.program.findMany({
      where: { id: { notIn: [...importedProgramIds] } },
      include: { _count: { select: { batches: true } } },
    });

    for (const program of seedOnly) {
      if (program._count.batches === 0) {
        await prisma.program.delete({ where: { id: program.id } });
        console.log(`Removed auto-seeded program "${program.title}" (Mongo copy is kept)`);
      }
    }
  }

  const postgresCounts = {
    programs: await prisma.program.count(),
    batches: await prisma.batch.count(),
    applications: await prisma.internshipApplication.count(),
    certificates: await prisma.certificate.count(),
    contacts: await prisma.contact.count(),
    counters: await prisma.sequenceCounter.count(),
  };

  console.log("PostgreSQL counts:", postgresCounts);
  console.log("MongoDB was not modified. You can keep it as backup.");

  await mongo.close();
  await prisma.$disconnect();

  if (errors.length) {
    console.error(`\nImport finished with ${errors.length} warning(s)/error(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("MongoDB → PostgreSQL import complete. No Mongo data was deleted.");
}

main().catch(async (error) => {
  console.error("Migration failed:", error);
  await prisma.$disconnect();
  process.exit(1);
});
