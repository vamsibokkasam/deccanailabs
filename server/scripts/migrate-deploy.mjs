import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "../prisma/migrations");
const SCHEMA = path.join(__dirname, "../prisma/schema.prisma");

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

function migrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^\d{3}_.+\.sql$/.test(name))
    .sort();
}

function executeSqlFile(filePath) {
  const result = spawnSync(
    "npx",
    ["prisma", "db", "execute", "--file", filePath, "--schema", SCHEMA],
    { stdio: "inherit", shell: true, env: process.env }
  );
  if ((result.status ?? 1) !== 0) {
    throw new Error(`Failed to apply ${path.basename(filePath)}`);
  }
}

async function hasTable(table) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${table}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function hasColumn(table, column) {
  const rows = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = ${column}
    ) AS "exists"
  `;
  return Boolean(rows[0]?.exists);
}

async function alreadyOnDatabase(filename) {
  if (filename === "001_init.sql") return hasTable("programs");
  if (filename === "002_offer_letters.sql") return hasTable("offer_letters");
  if (filename === "003_offer_letter_file_storage.sql") {
    return hasColumn("offer_letters", "storagePath");
  }
  if (filename === "004_offer_letter_emailed_at.sql") {
    return hasColumn("offer_letters", "emailedAt");
  }
  return false;
}

async function markApplied(id) {
  await prisma.$executeRaw`
    INSERT INTO "_schema_migrations" ("id")
    VALUES (${id})
    ON CONFLICT ("id") DO NOTHING
  `;
}

async function appliedIds() {
  const rows = await prisma.$queryRaw`SELECT "id" FROM "_schema_migrations"`;
  return new Set(rows.map((row) => row.id));
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "_schema_migrations" (
      "id" TEXT NOT NULL,
      "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "_schema_migrations_pkey" PRIMARY KEY ("id")
    )
  `);

  const applied = await appliedIds();

  for (const filename of migrationFiles()) {
    if (applied.has(filename)) {
      console.log(`Migration already applied: ${filename}`);
      continue;
    }

    if (await alreadyOnDatabase(filename)) {
      await markApplied(filename);
      console.log(`Migration already present in database: ${filename}`);
      continue;
    }

    console.log(`Applying migration: ${filename}`);
    executeSqlFile(path.join(MIGRATIONS_DIR, filename));
    await markApplied(filename);
  }

  console.log("Migrations up to date");
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
