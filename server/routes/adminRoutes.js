import express from "express";
import { verifyAdmin, getStats } from "../controllers/adminController.js";
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import {
  assignApplicationsToBatch,
  createBatch,
  deleteBatch,
  getUnassignedApplications,
  listBatches,
  updateBatch,
} from "../controllers/batchController.js";
import adminAuth from "../middleware/adminAuth.js";
import { validateBody } from "../middleware/validate.js";
import { validateBatch, validateProgram } from "../utils/validation.js";

const router = express.Router();

router.get("/verify", adminAuth, verifyAdmin);
router.get("/stats", adminAuth, getStats);

router.get("/programs", adminAuth, getAllPrograms);
router.post("/programs", adminAuth, validateBody(validateProgram), createProgram);
router.put("/programs/:id", adminAuth, validateBody(validateProgram), updateProgram);
router.delete("/programs/:id", adminAuth, deleteProgram);

router.get("/batches", adminAuth, listBatches);
router.post("/batches", adminAuth, validateBody(validateBatch), createBatch);
router.put("/batches/:id", adminAuth, validateBody(validateBatch), updateBatch);
router.delete("/batches/:id", adminAuth, deleteBatch);
router.get("/batches/:id/unassigned", adminAuth, getUnassignedApplications);
router.post("/batches/:id/assign", adminAuth, assignApplicationsToBatch);

export default router;
