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
    feeAmount: {
      type: Number,
      default: 599,
      min: [1, "Fee amount must be positive"],
    },
    payment: {
      method: {
        type: String,
        enum: ["upi"],
        default: "upi",
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
        default: "pending",
      },
      verifiedAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InternshipApplication", internshipApplicationSchema);
