export async function issueCertificateForApplication(application, details, tx) {
  const existing = await tx.certificate.findUnique({
    where: { applicationId: application.id },
  });

  if (existing) {
    const appId = application.applicationId?.trim();
    if (appId && existing.certNo !== appId) {
      return tx.certificate.update({
        where: { id: existing.id },
        data: { certNo: appId },
      });
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

  const byCertNo = await tx.certificate.findUnique({
    where: { certNo },
  });

  if (byCertNo) {
    const conflictError = new Error(`A certificate already exists with ID ${certNo}`);
    conflictError.statusCode = 409;
    throw conflictError;
  }

  return tx.certificate.create({
    data: {
      certNo,
      recipientName: application.fullName,
      registrationNo: details.registrationNo,
      department: details.department,
      college: details.college,
      internshipDomain: details.internshipDomain,
      startDate: details.startDate,
      endDate: details.endDate,
      applicationId: application.id,
    },
  });
}
