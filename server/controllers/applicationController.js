import mongoose from "mongoose";
import InternshipApplication from "../models/InternshipApplication.js";
import Certificate from "../models/Certificate.js";
import { compareApplicationIds, generateApplicationId } from "../utils/applicationId.js";
import { validatePaymentScreenshot } from "../utils/saveScreenshot.js";
import { issueCertificateForApplication } from "../services/certificateIssuance.js";
import { sendCertificateEmail } from "../services/certificateEmail.js";

const stripScreenshotFromApplication = (application) => {
  const data = application.toObject ? application.toObject() : { ...application };

  if (data.payment?.screenshotData) {
    const { screenshotData, ...paymentRest } = data.payment;
    data.payment = paymentRest;
  }

  return data;
};

export const createApplication = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { fullName, email, phone, program, message, college, department } = req.body;
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
            college: college?.trim() || "",
            department: department?.trim() || "",
            program: program.trim(),
            message: message?.trim() || "",
            feeAmount: 0,
            status: "pending",
          },
        ],
        { session }
      );

      application = created;
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    if (error.message?.includes("application ID")) {
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

export const createApplicationWithPayment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const {
      fullName,
      email,
      phone,
      college,
      department,
      program,
      transactionId,
      screenshotBase64,
      source,
    } = req.body;

    const applicationSource = source === "course" ? "course" : "internship";
    const parsedFee =
      String(program || "").trim() === "Web Development" ? 499 : 599;

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
            department: department.trim(),
            program: program.trim(),
            source: applicationSource,
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
    const applications = await InternshipApplication.find()
      .populate("certificate")
      .populate("batchId", "name startDate endDate programTitle")
      .lean();
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

    if (status === "completed") {
      return res.status(400).json({
        success: false,
        message:
          "Use PATCH /api/applications/:id/complete to mark an application completed and issue a certificate",
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, reviewed, accepted, or rejected",
      });
    }

    const existing = await InternshipApplication.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (existing.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed applications cannot change status. Revoke the certificate instead.",
      });
    }

    const application = await InternshipApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true }
    );

    res.json({
      success: true,
      message: "Status updated successfully",
      data: stripScreenshotFromApplication(application),
    });
  } catch (error) {
    next(error);
  }
};

export const completeApplication = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    let application;
    let certificate;

    await session.withTransaction(async () => {
      application = await InternshipApplication.findById(req.params.id).session(session);

      if (!application) {
        const notFoundError = new Error("Application not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (application.status === "completed" && application.certificate) {
        certificate = await Certificate.findById(application.certificate).session(session);
        if (certificate) return;
      }

      if (
        application.payment?.transactionId &&
        application.payment?.status !== "verified"
      ) {
        const paymentError = new Error(
          "Payment must be verified before issuing a certificate"
        );
        paymentError.statusCode = 400;
        throw paymentError;
      }

      if (!["accepted", "completed"].includes(application.status)) {
        const statusError = new Error(
          "Only accepted applications can be marked completed"
        );
        statusError.statusCode = 400;
        throw statusError;
      }

      const details = {
        registrationNo: (
          application.registrationNo ||
          application.applicationId ||
          ""
        ).trim(),
        department: (application.department || "").trim(),
        college: (application.college || "").trim(),
        internshipDomain: (application.program || "").trim(),
        startDate: application.internshipStartDate,
        endDate: application.internshipEndDate,
      };

      const missingDetails = [];
      if (!details.registrationNo) missingDetails.push("registration/application ID");
      if (!details.college) missingDetails.push("college");
      if (!details.department) missingDetails.push("department");
      if (!details.internshipDomain) missingDetails.push("internship domain");
      if (!details.startDate || !details.endDate) {
        missingDetails.push("batch start/end dates");
      }

      if (missingDetails.length) {
        const detailsError = new Error(
          `Cannot issue certificate. Missing: ${missingDetails.join(
            ", "
          )}. Assign the student to a batch and complete the application details first.`
        );
        detailsError.statusCode = 400;
        throw detailsError;
      }

      if (new Date(details.endDate) < new Date(details.startDate)) {
        const datesError = new Error(
          "The assigned batch end date must be on or after its start date"
        );
        datesError.statusCode = 400;
        throw datesError;
      }

      certificate = await issueCertificateForApplication(application, details, session);

      application.registrationNo = details.registrationNo;
      application.department = details.department;
      application.college = details.college;
      application.internshipStartDate = details.startDate;
      application.internshipEndDate = details.endDate;
      application.status = "completed";
      application.completedAt = new Date();
      application.certificate = certificate._id;
      await application.save({ session });
    });

    const responseData = stripScreenshotFromApplication(application);
    responseData.certificate = certificate;

    let emailSent = false;
    let emailWarning = null;

    if (certificate && application?.email && !application.certificateEmailedAt) {
      try {
        await sendCertificateEmail({ application, certificate });
        application.certificateEmailedAt = new Date();
        await application.save();
        emailSent = true;
        responseData.certificateEmailedAt = application.certificateEmailedAt;
      } catch (emailError) {
        console.error("Certificate email failed:", emailError.message);
        emailWarning = emailError.message || "Failed to send certificate email";
      }
    }

    res.json({
      success: true,
      message: emailSent
        ? "Application completed and certificate emailed successfully"
        : emailWarning
          ? "Application completed, but the certificate email could not be sent"
          : "Application completed and certificate issued",
      emailSent,
      emailWarning,
      data: responseData,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A certificate already exists for this application",
      });
    }

    next(error);
  } finally {
    await session.endSession();
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

    const existing = await InternshipApplication.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (existing.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot change payment status for a completed application",
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
    const existing = await InternshipApplication.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (existing.status === "completed" || existing.certificate) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete an application that has an issued certificate",
      });
    }

    await InternshipApplication.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
