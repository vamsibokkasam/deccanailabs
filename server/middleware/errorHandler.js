import { setCorsHeaders } from "../config/cors.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);
  setCorsHeaders(req, res);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This transaction ID has already been submitted",
    });
  }

  if (err.name === "MongoServerError" || err.name === "MongooseError") {
    return res.status(503).json({
      success: false,
      message: "Database is temporarily unavailable. Please try again.",
    });
  }

  res.status(500).json({
    success: false,
    message: "Server error",
  });
};

export default errorHandler;
