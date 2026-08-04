import express from "express";
import {
  createCertificate,
  downloadCertificateImage,
  downloadCertificatePdf,
  renderCertificatePdf,
  revokeCertificate,
  searchCertificates,
  verifyCertificate,
} from "../controllers/certificateController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Cert numbers include slashes (DAIL/CERT/2026/001) — put them in a trailing wildcard
router.get("/search", searchCertificates);
router.get("/verify/*certNo", verifyCertificate);
router.get("/image/*certNo", downloadCertificateImage);
router.get("/pdf/*certNo", downloadCertificatePdf);
router.get("/render/*certNo", adminAuth, renderCertificatePdf);
router.patch("/revoke/*certNo", adminAuth, revokeCertificate);
router.post("/", adminAuth, createCertificate);

export default router;
