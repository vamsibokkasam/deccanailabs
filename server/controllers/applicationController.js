import InternshipApplication from "../models/InternshipApplication.js";
import { generateApplicationId } from "../utils/applicationId.js";
import { validatePaymentScreenshot } from "../utils/saveScreenshot.js";

const stripScreenshotFromApplication = (application) => {
  const data = application.toObject ? application.toObject() : { ...application };

  if (data.payment?.screenshotData) {
    const { screenshotData, ...paymentRest } = data.payment;
    data.payment = paymentRest;
  }

  return data;
};

export const createApplication = async (req, res, next) => {
  try {
    const { fullName, email, phone, program, message } = req.body;

    const application = await InternshipApplication.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim().replace(/\s/g, ""),
      program: program.trim(),
      message: message?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const createApplicationWithPayment = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      college,
      program,
      transactionId,
      feeAmount,
      screenshotBase64,
    } = req.body;

    const normalizedTxnId = transactionId.trim();
    const existingPayment = await InternshipApplication.findOne({
      "payment.transactionId": normalizedTxnId,
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "This transaction ID has already been submitted",
      });
    }

    const screenshotData = validatePaymentScreenshot(screenshotBase64);
    const applicationId = await generateApplicationId();
    const parsedFee = Number(feeAmount) || 599;

    const application = await InternshipApplication.create({
      applicationId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim().replace(/\s/g, ""),
      college: college.trim(),
      program: program.trim(),
      feeAmount: parsedFee,
      payment: {
        method: "upi",
        transactionId: normalizedTxnId,
        screenshotData,
        status: "pending",
      },
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully. Payment verification is pending.",
      data: stripScreenshotFromApplication(application),
    });
  } catch (error) {
    if (
      error.message?.includes("screenshot") ||
      error.message?.includes("Image") ||
      error.message?.includes("application ID")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const applications = await InternshipApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, reviewed, accepted, or rejected",
      });
    }

    const application = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body || {};
    const validPaymentStatuses = ["verified", "rejected"];

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "Payment status is required",
      });
    }

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment status must be verified or rejected",
      });
    }

    const application = await InternshipApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    application.payment.status = paymentStatus;
    application.payment.verifiedAt = new Date();

    if (paymentStatus === "verified") {
      application.status = "accepted";
    } else if (paymentStatus === "rejected") {
      application.status = "rejected";
    }

    await application.save();

    res.json({
      success: true,
      message:
        paymentStatus === "verified"
          ? "Payment verified and application accepted"
          : "Payment rejected",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
