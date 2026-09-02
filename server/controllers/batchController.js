import prisma from "../config/prisma.js";
import { serializeApplication, serializeBatch } from "../utils/serialize.js";

function exactProgramTitleMatch(title) {
  const escaped = String(title || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}

async function attachStudentCounts(batches) {
  if (!batches.length) return batches;

  const batchIds = batches.map((batch) => batch.id);
  const counts = await prisma.internshipApplication.groupBy({
    by: ["batchId"],
    where: { batchId: { in: batchIds } },
    _count: { id: true },
  });

  const countMap = new Map(counts.map((row) => [row.batchId, row._count.id]));

  return batches.map((batch) =>
    serializeBatch({
      ...batch,
      studentCount: countMap.get(batch.id) || 0,
    })
  );
}

async function resolveProgram(programId) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
  });

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
    const batches = await prisma.batch.findMany({
      where: req.query.programId ? { programId: String(req.query.programId) } : undefined,
      orderBy: { startDate: "desc" },
    });

    res.json({ success: true, data: await attachStudentCounts(batches) });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  try {
    const { programId, name, startDate, endDate } = req.body;
    const program = await resolveProgram(programId);
    const { parsedStart, parsedEnd } = parseBatchDates(startDate, endDate);

    const batch = await prisma.batch.create({
      data: {
        programId: program.id,
        programTitle: program.title,
        name: name.trim(),
        startDate: parsedStart,
        endDate: parsedEnd,
      },
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: serializeBatch({ ...batch, studentCount: 0 }),
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
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const { programId, name, startDate, endDate, isActive } = req.body;
    const data = {};

    if (programId && String(programId) !== String(batch.programId)) {
      const program = await resolveProgram(programId);
      data.programId = program.id;
      data.programTitle = program.title;
    }

    if (name !== undefined) data.name = name.trim();
    if (isActive !== undefined) data.isActive = isActive;

    const nextStart = startDate !== undefined ? startDate : batch.startDate;
    const nextEnd = endDate !== undefined ? endDate : batch.endDate;
    const { parsedStart, parsedEnd } = parseBatchDates(nextStart, nextEnd);
    data.startDate = parsedStart;
    data.endDate = parsedEnd;

    const updated = await prisma.batch.update({
      where: { id: req.params.id },
      data,
    });

    const [withCount] = await attachStudentCounts([updated]);

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
    const batch = await prisma.batch.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "Batch deactivated successfully",
      data: serializeBatch(batch),
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }
    next(error);
  }
};

export const getUnassignedApplications = async (req, res, next) => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: req.params.id },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const applications = await prisma.internshipApplication.findMany({
      where: {
        batchId: null,
        program: { equals: batch.programTitle, mode: "insensitive" },
      },
      select: {
        id: true,
        applicationId: true,
        fullName: true,
        email: true,
        phone: true,
        college: true,
        department: true,
        program: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      batch: {
        _id: batch.id,
        name: batch.name,
        programTitle: batch.programTitle,
        startDate: batch.startDate,
        endDate: batch.endDate,
      },
      count: applications.length,
      data: applications.map((application) => serializeApplication(application)),
    });
  } catch (error) {
    next(error);
  }
};

export const assignApplicationsToBatch = async (req, res, next) => {
  try {
    const { applicationIds } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one application to assign",
      });
    }

    const assignedCount = await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findUnique({
        where: { id: req.params.id },
      });

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

      let count = 0;
      const programMatch = exactProgramTitleMatch(batch.programTitle);

      for (const applicationId of applicationIds) {
        const application = await tx.internshipApplication.findUnique({
          where: { id: applicationId },
        });

        if (!application) continue;
        if (!programMatch.test(application.program || "")) continue;
        if (application.batchId) continue;

        await tx.internshipApplication.update({
          where: { id: application.id },
          data: {
            batchId: batch.id,
            internshipStartDate: batch.startDate,
            internshipEndDate: batch.endDate,
          },
        });
        count += 1;
      }

      return count;
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
  }
};
