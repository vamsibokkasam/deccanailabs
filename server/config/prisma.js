import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const RETRY_CODES = new Set(["P1001", "P1017", "P2024"]);

function withStableParams(url) {
  if (!url) return url;

  const parsed = new URL(url);
  if (!parsed.searchParams.has("sslmode")) {
    parsed.searchParams.set("sslmode", "require");
  }
  if (!parsed.searchParams.has("connect_timeout")) {
    parsed.searchParams.set("connect_timeout", "30");
  }
  if (!parsed.searchParams.has("pool_timeout")) {
    parsed.searchParams.set("pool_timeout", "30");
  }

  return parsed.toString();
}

function createPrismaClient() {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: withStableParams(process.env.DATABASE_URL),
      },
    },
  });

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError;

        for (let attempt = 1; attempt <= 3; attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (!RETRY_CODES.has(error.code) || attempt === 3) {
              throw error;
            }

            console.warn(
              `PostgreSQL ${error.code} on attempt ${attempt}/3, retrying...`
            );
            await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
            await client.$connect();
          }
        }

        throw lastError;
      },
    },
  });
}

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
