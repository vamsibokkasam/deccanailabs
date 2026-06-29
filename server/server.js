import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB, { getDbStatus } from "./config/db.js";
import seedPrograms from "./config/seedPrograms.js";
import contactRoutes from "./routes/contactRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import ensureDb from "./middleware/ensureDb.js";
import corsMiddleware, { getAllowedOrigins } from "./config/cors.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const JSON_BODY_LIMIT = "10mb";

app.use(corsMiddleware);
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  const db = getDbStatus();

  res.json({
    status: "ok",
    message: "DECCAN AI labs API is running",
    database: db.status,
    ...(db.error && { databaseError: db.error }),
  });
});

app.use("/api/contacts", ensureDb, contactRoutes);
app.use("/api/applications", ensureDb, applicationRoutes);
app.use("/api/programs", ensureDb, programRoutes);
app.use("/api/admin", ensureDb, adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JSON body limit: ${JSON_BODY_LIMIT}`);
  console.log(`CORS allowed origins: ${getAllowedOrigins().join(", ")}`);
  console.log(`MONGODB_URI set: ${process.env.MONGODB_URI ? "yes" : "NO"}`);
});

const initDatabase = async () => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await connectDB();
      await seedPrograms();
      return;
    } catch (error) {
      console.error(`MongoDB attempt ${attempt}/5 failed:`, error.message);
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
};

initDatabase();
