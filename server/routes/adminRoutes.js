import express from "express";
import { verifyAdmin, getStats } from "../controllers/adminController.js";
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import adminAuth from "../middleware/adminAuth.js";
import { validateBody } from "../middleware/validate.js";
import { validateProgram } from "../utils/validation.js";

const router = express.Router();

router.get("/verify", adminAuth, verifyAdmin);
router.get("/stats", adminAuth, getStats);

router.get("/programs", adminAuth, getAllPrograms);
router.post("/programs", adminAuth, validateBody(validateProgram), createProgram);
router.put("/programs/:id", adminAuth, validateBody(validateProgram), updateProgram);
router.delete("/programs/:id", adminAuth, deleteProgram);

export default router;
