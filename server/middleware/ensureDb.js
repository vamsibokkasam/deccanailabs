import { getDbStatus } from "../config/db.js";
import { setCorsHeaders } from "../config/cors.js";

const ensureDb = (req, res, next) => {
  setCorsHeaders(req, res);

  if (getDbStatus().status !== "connected") {
    return res.status(503).json({
      success: false,
      message: "Database is connecting. Please try again in a few seconds.",
    });
  }

  next();
};

export default ensureDb;
