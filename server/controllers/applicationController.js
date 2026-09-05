import prisma from "../config/prisma.js";
import { compareApplicationIds, generateApplicationId } from "../utils/applicationId.js";
import { isPrismaUniqueError } from "../utils/prismaErrors.js";
import { validatePaymentScreenshot } from "../utils/saveScreenshot.js";
import {
  serializeApplication,
  serializeCertificate,
  stripScreenshotFromApplication,
} from "../utils/serialize.js";
import { issueCertificateForApplication } from "../services/certificateIssuance.js";
import { sendCertificateEmail } from "../services/certificateEmail.js";
import { OFFER_LETTER_META_SELECT, queueOfferLetterIssuance } from "../services/offerLetterIssuance.js";

const TX_OPTIONS = { maxWait: 10000, timeout: 15000 };

export const createApplication = async (req, res, next) => {
  try {
    const { fullName, email, phone, program, message, college, department } = req.body;

    const application = await prisma.$transaction(async (tx) => {
      const applicationId = await generateApplicationId(tx);

      return tx.internshipApplication.create({
        data: {
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
      });
    }, TX_OPTIONS);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: serializeApplication(application),
    });
  } catch (error) {
    if (error.message?.includes("application ID")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
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
      department,
      program,
      transactionId,
      screenshotBase64,
      source,
    } = req.body;

    const applicationSource = source === "course" ? "course" : "internship";
    const parsedFee = String(program || "").trim() === "Web Development" ? 499 : 599;
    const normalizedTxnId = transactionId.trim();

    const existingPayment = await prisma.internshipApplication.findUnique({
      where: { paymentTransactionId: normalizedTxnId },
      select: { id: true },
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "This transaction ID has already been submitted",
      });
    }

    const screenshotData = validatePaymentScreenshot(screenshotBase64);

    const application = await prisma.$transaction(async (tx) => {
      const applicationId = await generateApplicationId(tx);

      return tx.internshipApplication.create({
        data: {
          applicationId,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim().replace(/\s/g, ""),
          college: college.trim(),
          department: department.trim(),
          program: program.trim(),
          source: applicationSource,
          feeAmount: parsedFee,
          paymentMethod: "upi",
          paymentTransactionId: normalizedTxnId,
          paymentScreenshotData: screenshotData,
          paymentStatus: "pending",
          status: "pending",
        },
      });
    }, TX_OPTIONS);

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
    const applications = await prisma.internshipApplication.findMany({
      include: {
        certificate: true,
        offerLetter: { select: OFFER_LETTER_META_SELECT },
        batch: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            programTitle: true,
          },
        },
      },
    });

    applications.sort((left, right) =>
      compareApplicationIds(left.applicationId, right.applicationId)
    );

    res.json({
      success: true,
      data: applications.map((application) => serializeApplication(application)),
    });
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

    const existing = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: { batch: true },
    });

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

    const application = await prisma.internshipApplication.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        batch: true,
        certificate: true,
        offerLetter: { select: OFFER_LETTER_META_SELECT },
      },
    });

    if (status === "accepted" && !application.offerLetter) {
      queueOfferLetterIssuance({
        ...application,
        batch: existing.batch,
      });
    }

    res.json({
      success: true,
      message:
        status === "accepted"
          ? application.offerLetter
            ? "Application accepted. Offer letter is ready."
            : "Application accepted. Offer letter is being generated."
          : "Status updated successfully",
      data: stripScreenshotFromApplication(application),
    });
  } catch (error) {
    next(error);
  }
};

export const completeApplication = async (req, res, next) => {
  try {
    const { application, certificate } = await prisma.$transaction(async (tx) => {
      const existing = await tx.internshipApplication.findUnique({
        where: { id: req.params.id },
        include: { certificate: true },
      });

      if (!existing) {
        const notFoundError = new Error("Application not found");
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      if (existing.status === "completed" && existing.certificate) {
        return { application: existing, certificate: existing.certificate };
      }

      if (existing.paymentTransactionId && existing.paymentStatus !== "verified") {
        const paymentError = new Error(
          "Payment must be verified before issuing a certificate"
        );
        paymentError.statusCode = 400;
        throw paymentError;
      }

      if (!["accepted", "completed"].includes(existing.status)) {
        const statusError = new Error("Only accepted applications can be marked completed");
        statusError.statusCode = 400;
        throw statusError;
      }

      const details = {
        registrationNo: (existing.registrationNo || existing.applicationId || "").trim(),
        department: (existing.department || "").trim(),
        college: (existing.college || "").trim(),
        internshipDomain: (existing.program || "").trim(),
        startDate: existing.internshipStartDate,
        endDate: existing.internshipEndDate,
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

      const issued = await issueCertificateForApplication(existing, details, tx);

      const updated = await tx.internshipApplication.update({
        where: { id: existing.id },
        data: {
          registrationNo: details.registrationNo,
          department: details.department,
          college: details.college,
          internshipStartDate: details.startDate,
          internshipEndDate: details.endDate,
          status: "completed",
          completedAt: new Date(),
        },
        include: { certificate: true },
      });

      return { application: updated, certificate: issued };
    }, TX_OPTIONS);

    const responseData = stripScreenshotFromApplication(application);
    responseData.certificate = serializeCertificate(certificate);

    let emailSent = false;
    let emailWarning = null;

    if (certificate && application?.email && !application.certificateEmailedAt) {
      try {
        await sendCertificateEmail({ application, certificate });
        const emailedAt = new Date();
        await prisma.internshipApplication.update({
          where: { id: application.id },
          data: { certificateEmailedAt: emailedAt },
        });
        emailSent = true;
        responseData.certificateEmailedAt = emailedAt;
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

    if (isPrismaUniqueError(error)) {
      return res.status(409).json({
        success: false,
        message: "A certificate already exists for this application",
      });
    }

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

    const existing = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
    });

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

    const application = await prisma.internshipApplication.update({
      where: { id: req.params.id },
      data: {
        paymentStatus,
        paymentVerifiedAt: new Date(),
        status: applicationStatus,
      },
    });

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
    const existing = await prisma.internshipApplication.findUnique({
      where: { id: req.params.id },
      include: { certificate: true },
    });

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

    await prisma.internshipApplication.delete({
      where: { id: req.params.id },
    });

    res.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
