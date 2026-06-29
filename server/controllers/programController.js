import Program from "../models/Program.js";

export const getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

export const getAllPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find().sort({ createdAt: 1 });
    res.json({ success: true, data: programs });
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    const { title, description, duration } = req.body;

    const program = await Program.create({
      title: title.trim(),
      description: description.trim(),
      duration: duration?.trim() || "8-12 weeks",
    });

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const { title, description, duration, isActive } = req.body;

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(duration !== undefined && { duration: duration.trim() }),
        ...(isActive !== undefined && { isActive }),
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.json({
      success: true,
      message: "Program updated successfully",
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { returnDocument: "after" }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.json({
      success: true,
      message: "Program deleted successfully",
      data: program,
    });
  } catch (error) {
    next(error);
  }
};
