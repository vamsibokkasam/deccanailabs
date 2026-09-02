import prisma from "./prisma.js";

let lastConnectionError = null;
let connected = false;

const connectDB = async () => {
  const url = process.env.DATABASE_URL;

  if (!url) {
    lastConnectionError = "DATABASE_URL environment variable is not set";
    connected = false;
    throw new Error(lastConnectionError);
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    lastConnectionError = null;
    connected = true;
    console.log("PostgreSQL connected");
  } catch (error) {
    lastConnectionError = error.message;
    connected = false;
    throw error;
  }
};

export const getDbStatus = () => ({
  status: connected ? "connected" : "disconnected",
  error: lastConnectionError,
});

export default connectDB;
