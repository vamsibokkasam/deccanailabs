import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must not exceed 50 characters"],
      match: [/^[a-zA-Z\s.'-]+$/, "First name must not contain numbers"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name must not exceed 50 characters"],
      match: [/^[a-zA-Z\s.'-]+$/, "Last name must not contain numbers"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    whatsapp: {
      type: String,
      required: [true, "WhatsApp number is required"],
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"],
    },
    internship: {
      type: String,
      required: [true, "Internship selection is required"],
      trim: true,
      maxlength: [100, "Internship must not exceed 100 characters"],
    },
    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: [2000, "Message must not exceed 2000 characters"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
