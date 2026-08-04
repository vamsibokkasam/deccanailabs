import Certificate from "../models/Certificate.js";

export async function issueCertificateForApplication(application, details, session) {
  const existing = await Certificate.findOne({
    applicationId: application._id,
  }).session(session);

  if (existing) {
    const appId = application.applicationId?.trim();
    if (appId && existing.certNo !== appId) {
      existing.certNo = appId;
      await existing.save({ session });
    }
    return existing;
  }

  const certNo = application.applicationId?.trim();
  if (!certNo) {
    const missingIdError = new Error(
      "Application ID is required to issue a certificate. This application has no application ID."
    );
    missingIdError.statusCode = 400;
    throw missingIdError;
  }

  const byCertNo = await Certificate.findOne({ certNo }).session(session);
  if (byCertNo) {
    const conflictError = new Error(
      `A certificate already exists with ID ${certNo}`
    );
    conflictError.statusCode = 409;
    throw conflictError;
  }

  const [certificate] = await Certificate.create(
    [
      {
        certNo,
        recipientName: application.fullName,
        registrationNo: details.registrationNo,
        department: details.department,
        college: details.college,
        internshipDomain: details.internshipDomain,
        startDate: details.startDate,
        endDate: details.endDate,
        applicationId: application._id,
      },
    ],
    { session }
  );

  return certificate;
}
