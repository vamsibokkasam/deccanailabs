import { setCorsHeaders } from "../config/cors.js";

const adminAuth = (req, res, next) => {
  setCorsHeaders(req, res);

  const adminKey = req.headers["x-admin-key"];

  if (!process.env.ADMIN_KEY) {
    return res.status(503).json({
      success: false,
      message: "Admin access is not configured on the server",
    });
  }

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid admin key",
    });
  }

  next();
};

export default adminAuth;
