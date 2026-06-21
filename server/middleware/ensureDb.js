import mongoose from "mongoose";
import { setCorsHeaders } from "../config/cors.js";

const ensureDb = (req, res, next) => {
  setCorsHeaders(req, res);

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database is connecting. Please try again in a few seconds.",
    });
  }

  next();
};

export default ensureDb;
