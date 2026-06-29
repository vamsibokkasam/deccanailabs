import mongoose from "mongoose";
import InternshipApplication from "../models/InternshipApplication.js";
import { compareApplicationIds, generateApplicationId } from "../utils/applicationId.js";
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
  const session = await mongoose.startSession();

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
    const parsedFee = Number(feeAmount) || 599;

    let application;

    await session.withTransaction(async () => {
      const applicationId = await generateApplicationId(session);

      const [created] = await InternshipApplication.create(
        [
          {
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
          },
        ],
        { session }
      );

      application = created;
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
  } finally {
    await session.endSession();
  }
};

export const getApplications = async (req, res, next) => {
  try {
    const applications = await InternshipApplication.find().lean();
    applications.sort((left, right) =>
      compareApplicationIds(left.applicationId, right.applicationId)
    );

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
      { returnDocument: "after", runValidators: true }
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
      data: stripScreenshotFromApplication(application),
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

    const applicationStatus = paymentStatus === "verified" ? "accepted" : "rejected";

    const application = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "payment.status": paymentStatus,
          "payment.verifiedAt": new Date(),
          status: applicationStatus,
        },
      },
      { returnDocument: "after", runValidators: false }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message:
        paymentStatus === "verified"
          ? "Payment verified and application accepted"
          : "Payment rejected",
      data: stripScreenshotFromApplication(application),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const application = await InternshipApplication.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
