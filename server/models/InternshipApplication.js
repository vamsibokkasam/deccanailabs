import mongoose from "mongoose";

const internshipApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must not exceed 100 characters"],
      match: [/^[a-zA-Z\s.'-]+$/, "Name must not contain numbers"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },
    college: {
      type: String,
      trim: true,
      maxlength: [200, "College name must not exceed 200 characters"],
    },
    registrationNo: {
      type: String,
      trim: true,
      maxlength: [100, "Registration number must not exceed 100 characters"],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [200, "Department must not exceed 200 characters"],
    },
    internshipStartDate: {
      type: Date,
    },
    internshipEndDate: {
      type: Date,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },
    program: {
      type: String,
      required: [true, "Program is required"],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, "Message must not exceed 1000 characters"],
      default: "",
    },
    source: {
      type: String,
      enum: ["internship", "course"],
      default: "internship",
    },
    feeAmount: {
      type: Number,
      default: 0,
      min: [0, "Fee amount cannot be negative"],
    },
    payment: {
      method: {
        type: String,
        enum: ["upi"],
      },
      transactionId: {
        type: String,
        trim: true,
        sparse: true,
        unique: true,
        match: [/^\d{12}$/, "Enter a valid 12-digit UPI transaction ID"],
      },
      screenshotData: {
        type: String,
      },
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
      },
      verifiedAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected", "completed"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
    certificateEmailedAt: {
      type: Date,
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InternshipApplication", internshipApplicationSchema);
