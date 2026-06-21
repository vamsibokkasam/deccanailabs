import express from "express";
import {
  createApplication,
  createApplicationWithPayment,
  getApplications,
  updateApplicationStatus,
  updatePaymentStatus,
} from "../controllers/applicationController.js";
import adminAuth from "../middleware/adminAuth.js";
import { validateBody } from "../middleware/validate.js";
import {
  validateApplication,
  validateApplicationWithPayment,
} from "../utils/validation.js";

const router = express.Router();

router.post("/", validateBody(validateApplication), createApplication);
router.post(
  "/with-payment",
  validateBody(validateApplicationWithPayment),
  createApplicationWithPayment
);
router.get("/", adminAuth, getApplications);
router.patch("/:id/status", adminAuth, updateApplicationStatus);
router.patch("/:id/payment-status", adminAuth, updatePaymentStatus);

export default router;
