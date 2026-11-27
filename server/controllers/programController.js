import prisma from "../config/prisma.js";
import { displayDuration, normalizeDurations } from "../utils/durations.js";
import { serializeProgram } from "../utils/serialize.js";

function programDurationFields(body = {}) {
  const durations = normalizeDurations(
    body.durations !== undefined ? body.durations : body.duration,
    body.duration
  );

  return {
    durations,
    duration: displayDuration(durations),
  };
}

export const getPrograms = async (req, res, next) => {
  try {
    const programs = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: programs.map(serializeProgram) });
  } catch (error) {
    next(error);
  }
};

export const getAllPrograms = async (req, res, next) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: programs.map(serializeProgram) });
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { durations, duration } = programDurationFields(req.body);

    const program = await prisma.program.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        duration,
        durations,
      },
    });

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: serializeProgram(program),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const { title, description, isActive } = req.body;
    const hasDurationUpdate =
      req.body.durations !== undefined || req.body.duration !== undefined;
    const durationFields = hasDurationUpdate
      ? programDurationFields(req.body)
      : null;

    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(durationFields && {
          duration: durationFields.duration,
          durations: durationFields.durations,
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: "Program updated successfully",
      data: serializeProgram(program),
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "Program deleted successfully",
      data: serializeProgram(program),
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }
    next(error);
  }
};
