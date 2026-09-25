function hasPayment(row) {
  return (
    row.paymentMethod != null ||
    row.paymentTransactionId != null ||
    row.paymentStatus != null ||
    row.paymentScreenshotData != null ||
    row.paymentVerifiedAt != null
  );
}

export function serializePayment(row, { includeScreenshot = true } = {}) {
  if (!hasPayment(row)) return undefined;

  const payment = {
    method: row.paymentMethod ?? undefined,
    transactionId: row.paymentTransactionId ?? undefined,
    status: row.paymentStatus ?? undefined,
    verifiedAt: row.paymentVerifiedAt ?? undefined,
  };

  if (includeScreenshot && row.paymentScreenshotData) {
    payment.screenshotData = row.paymentScreenshotData;
  }

  return payment;
}

export function serializeProgram(row) {
  if (!row) return row;

  return {
    _id: row.id,
    title: row.title,
    description: row.description,
    duration: row.duration,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function serializeBatch(row) {
  if (!row) return row;

  return {
    _id: row.id,
    programId: row.programId,
    programTitle: row.programTitle,
    name: row.name,
    startDate: row.startDate,
    endDate: row.endDate,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.studentCount !== undefined && { studentCount: row.studentCount }),
  };
}

export function serializeCertificate(row) {
  if (!row) return row;

  return {
    _id: row.id,
    certNo: row.certNo,
    recipientName: row.recipientName,
    registrationNo: row.registrationNo,
    department: row.department,
    college: row.college,
    internshipDomain: row.internshipDomain,
    startDate: row.startDate,
    endDate: row.endDate,
    applicationId: row.application
      ? {
          _id: row.application.id,
          applicationId: row.application.applicationId,
          email: row.application.email,
        }
      : row.applicationId,
    status: row.status,
    issuedAt: row.issuedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function serializeApplication(row, { includeScreenshot = true } = {}) {
  if (!row) return row;

  let batchId = row.batchId ?? null;
  if (row.batch) {
    batchId = serializeBatch(row.batch);
  }

  let certificate = null;
  if (row.certificate) {
    certificate = serializeCertificate(row.certificate);
  }

  return {
    _id: row.id,
    applicationId: row.applicationId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    college: row.college,
    registrationNo: row.registrationNo,
    department: row.department,
    internshipStartDate: row.internshipStartDate,
    internshipEndDate: row.internshipEndDate,
    batchId,
    program: row.program,
    message: row.message,
    source: row.source,
    feeAmount: row.feeAmount,
    payment: serializePayment(row, { includeScreenshot }),
    status: row.status,
    completedAt: row.completedAt,
    certificateEmailedAt: row.certificateEmailedAt,
    certificate,
    offerLetter: row.offerLetter
      ? {
          _id: row.offerLetter.id,
          filename: row.offerLetter.filename,
          issuedAt: row.offerLetter.createdAt,
          updatedAt: row.offerLetter.updatedAt,
          emailedAt: row.offerLetter.emailedAt || null,
        }
      : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function serializeContact(row) {
  if (!row) return row;

  return {
    _id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    whatsapp: row.whatsapp,
    internship: row.internship,
    message: row.message,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function stripScreenshotFromApplication(row) {
  return serializeApplication(row, { includeScreenshot: false });
}
