import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import Program from "../models/Program.js";
import InternshipApplication from "../models/InternshipApplication.js";

function exactProgramTitleMatch(title) {
  const escaped = String(title || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}

async function attachStudentCounts(batches) {
  if (!batches.length) return batches;

  const batchIds = batches.map((batch) => batch._id);
  const counts = await InternshipApplication.aggregate([
    { $match: { batchId: { $in: batchIds } } },
    { $group: { _id: "$batchId", count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map(({ _id, count }) => [String(_id), count]));

  return batches.map((batch) => ({
    ...batch,
    studentCount: countMap.get(String(batch._id)) || 0,
  }));
}

async function resolveProgram(programId) {
  const program = await Program.findById(programId);
  if (!program) {
    const error = new Error("Program not found");
    error.statusCode = 404;
    throw error;
  }
  return program;
}

function parseBatchDates(startDate, endDate) {
  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
    const error = new Error("Start date and end date must be valid dates");
    error.statusCode = 400;
    throw error;
  }

  if (parsedEnd < parsedStart) {
    const error = new Error("End date must be on or after the start date");
    error.statusCode = 400;
    throw error;
  }

  return { parsedStart, parsedEnd };
}

export const listBatches = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.programId) {
      filter.programId = req.query.programId;
    }

    const batches = await Batch.find(filter).sort({ startDate: -1 }).lean();
    const data = await attachStudentCounts(batches);

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  try {
    const { programId, name, startDate, endDate } = req.body;

    const program = await resolveProgram(programId);
    const { parsedStart, parsedEnd } = parseBatchDates(startDate, endDate);

    const batch = await Batch.create({
      programId: program._id,
      programTitle: program.title,
      name: name.trim(),
      startDate: parsedStart,
      endDate: parsedEnd,
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: { ...batch.toObject(), studentCount: 0 },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const { programId, name, startDate, endDate, isActive } = req.body;

    if (programId && String(programId) !== String(batch.programId)) {
      const program = await resolveProgram(programId);
      batch.programId = program._id;
      batch.programTitle = program.title;
    }

    if (name !== undefined) batch.name = name.trim();
    if (isActive !== undefined) batch.isActive = isActive;

    const nextStart = startDate !== undefined ? startDate : batch.startDate;
    const nextEnd = endDate !== undefined ? endDate : batch.endDate;
    const { parsedStart, parsedEnd } = parseBatchDates(nextStart, nextEnd);
    batch.startDate = parsedStart;
    batch.endDate = parsedEnd;

    await batch.save();

    const [withCount] = await attachStudentCounts([batch.toObject()]);

    res.json({
      success: true,
      message: "Batch updated successfully",
      data: withCount,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: "after" }
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.json({
      success: true,
      message: "Batch deactivated successfully",
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnassignedApplications = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const applications = await InternshipApplication.find({
      program: exactProgramTitleMatch(batch.programTitle),
      $or: [{ batchId: null }, { batchId: { $exists: false } }],
    })
      .select(
        "_id applicationId fullName email phone college department program status payment.status createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      batch: {
        _id: batch._id,
        name: batch.name,
        programTitle: batch.programTitle,
        startDate: batch.startDate,
        endDate: batch.endDate,
      },
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const assignApplicationsToBatch = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { applicationIds } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one application to assign",
      });
    }

    let assignedCount = 0;

    await session.withTransaction(async () => {
      const batch = await Batch.findById(req.params.id).session(session);
      if (!batch) {
        const notFoundError = new Error("Batch not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (!batch.isActive) {
        const inactiveError = new Error("Cannot assign students to an inactive batch");
        inactiveError.statusCode = 400;
        throw inactiveError;
      }

      for (const applicationId of applicationIds) {
        const application = await InternshipApplication.findById(applicationId).session(
          session
        );

        if (!application) continue;

        if (!exactProgramTitleMatch(batch.programTitle).test(application.program || "")) {
          continue;
        }

        if (application.batchId) continue;

        application.batchId = batch._id;
        application.internshipStartDate = batch.startDate;
        application.internshipEndDate = batch.endDate;
        await application.save({ session });
        assignedCount += 1;
      }
    });

    res.json({
      success: true,
      message:
        assignedCount === 1
          ? "1 student assigned to the batch"
          : `${assignedCount} students assigned to the batch`,
      assignedCount,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  } finally {
    session.endSession();
  }
};
