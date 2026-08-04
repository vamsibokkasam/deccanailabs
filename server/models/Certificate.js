import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certNo: {
      type: String,
      required: [true, "Certificate number is required"],
      unique: true,
      trim: true,
    },
    recipientName: {
      type: String,
      required: [true, "Recipient name is required"],
      trim: true,
    },
    registrationNo: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    college: {
      type: String,
      trim: true,
      default: "",
    },
    internshipDomain: {
      type: String,
      required: [true, "Internship domain is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternshipApplication",
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["valid", "revoked"],
      default: "valid",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Certificate", certificateSchema);
