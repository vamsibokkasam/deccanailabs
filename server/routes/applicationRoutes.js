import express from "express";
import {
  completeApplication,
  createApplication,
  createApplicationWithPayment,
  deleteApplication,
  getApplications,
  updateApplicationStatus,
  updatePaymentStatus,
} from "../controllers/applicationController.js";
import { downloadOfferLetter, downloadSampleOfferLetter, emailOfferLetter } from "../controllers/offerLetterController.js";
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
router.get("/offer-letter/sample", adminAuth, downloadSampleOfferLetter);
router.get("/:id/offer-letter", adminAuth, downloadOfferLetter);
router.post("/:id/offer-letter/email", adminAuth, emailOfferLetter);
router.patch("/:id/status", adminAuth, updateApplicationStatus);
router.patch("/:id/complete", adminAuth, completeApplication);
router.patch("/:id/payment-status", adminAuth, updatePaymentStatus);
router.delete("/:id", adminAuth, deleteApplication);

export default router;
