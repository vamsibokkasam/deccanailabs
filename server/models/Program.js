import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Program title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    duration: {
      type: String,
      default: "8-12 weeks",
      maxlength: [50, "Duration must not exceed 50 characters"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Program", programSchema);
