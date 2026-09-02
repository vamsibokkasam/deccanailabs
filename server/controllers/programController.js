import prisma from "../config/prisma.js";
import { serializeProgram } from "../utils/serialize.js";

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
    const { title, description, duration } = req.body;

    const program = await prisma.program.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        duration: duration?.trim() || "8-12 weeks",
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
    const { title, description, duration, isActive } = req.body;

    const program = await prisma.program.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(duration !== undefined && { duration: duration.trim() }),
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
