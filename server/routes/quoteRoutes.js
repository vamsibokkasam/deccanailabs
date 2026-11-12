import express from "express";
import { createServiceQuote, getServiceQuotes } from "../controllers/quoteController.js";
import adminAuth from "../middleware/adminAuth.js";
import { validateBody } from "../middleware/validate.js";
import { validateServiceQuote } from "../utils/validation.js";

const router = express.Router();

router.post("/", validateBody(validateServiceQuote), createServiceQuote);
router.get("/", adminAuth, getServiceQuotes);

export default router;
