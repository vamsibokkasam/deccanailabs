import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: [true, "Program is required"],
    },
    programTitle: {
      type: String,
      required: [true, "Program title is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      maxlength: [120, "Batch name must not exceed 120 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

batchSchema.index({ programId: 1, startDate: -1 });

export default mongoose.model("Batch", batchSchema);
