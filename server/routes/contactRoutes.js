import express from "express";
import { createContact, getContacts } from "../controllers/contactController.js";
import adminAuth from "../middleware/adminAuth.js";
import { validateBody } from "../middleware/validate.js";
import { validateContact } from "../utils/validation.js";

const router = express.Router();

router.post("/", validateBody(validateContact), createContact);
router.get("/", adminAuth, getContacts);

export default router;
