const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SHORT_NAME_REGEX = /^[a-zA-Z\s.'-]{2,50}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

export function validateContact(data) {
  const errors = {};
  const { firstName, lastName, email, whatsapp, internship, message } = data;

  if (!firstName?.trim()) {
    errors.firstName = "First name is required";
  } else if (/\d/.test(firstName.trim())) {
    errors.firstName = "First name must not contain numbers";
  } else if (!SHORT_NAME_REGEX.test(firstName.trim())) {
    errors.firstName = "First name must be 2-50 letters only";
  }

  if (!lastName?.trim()) {
    errors.lastName = "Last name is required";
  } else if (/\d/.test(lastName.trim())) {
    errors.lastName = "Last name must not contain numbers";
  } else if (!SHORT_NAME_REGEX.test(lastName.trim())) {
    errors.lastName = "Last name must be 2-50 letters only";
  }

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!email.trim().includes("@")) {
    errors.email = "Email must contain @";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!whatsapp?.trim()) {
    errors.whatsapp = "WhatsApp number is required";
  } else if (!PHONE_REGEX.test(whatsapp.trim().replace(/\s/g, ""))) {
    errors.whatsapp = "Enter a valid 10-digit mobile number";
  }

  if (!internship?.trim()) {
    errors.internship = "Please select an internship";
  }

  if (message?.trim() && message.trim().length > 2000) {
    errors.message = "Message must not exceed 2000 characters";
  }

  return errors;
}

export function validateApplication(data) {
  const errors = {};
  const {
    fullName,
    email,
    phone,
    program,
    message,
    college,
    department,
    selectedDuration,
  } = data;
  const NAME_REGEX = /^[a-zA-Z\s.'-]{2,100}$/;
  const COLLEGE_REGEX = /^[a-zA-Z0-9\s.'&,()-]{2,200}$/;
  const DEPARTMENT_REGEX = /^[a-zA-Z0-9\s.'&,()-]{2,200}$/;

  if (!fullName?.trim()) {
    errors.fullName = "Full name is required";
  } else if (/\d/.test(fullName.trim())) {
    errors.fullName = "Name must not contain numbers";
  } else if (!NAME_REGEX.test(fullName.trim())) {
    errors.fullName = "Name must be 2-100 letters only";
  }

  if (!email?.trim()) {
    errors.email = "Email is required";
  } else if (!email.trim().includes("@")) {
    errors.email = "Email must contain @";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please enter a valid email address";
  }

  if (!phone?.trim()) {
    errors.phone = "Phone number is required";
  } else if (!PHONE_REGEX.test(phone.trim().replace(/\s/g, ""))) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }

  if (!program?.trim()) {
    errors.program = "Program is required";
  }

  if (!college?.trim()) {
    errors.college = "College name is required";
  } else if (!COLLEGE_REGEX.test(college.trim())) {
    errors.college = "Enter a valid college name";
  }

  if (!department?.trim()) {
    errors.department = "Department is required";
  } else if (!DEPARTMENT_REGEX.test(department.trim())) {
    errors.department = "Enter a valid department name";
  }

  if (selectedDuration?.trim() && selectedDuration.trim().length > 50) {
    errors.selectedDuration = "Duration must not exceed 50 characters";
  }

  if (message?.trim() && message.trim().length > 1000) {
    errors.message = "Message must not exceed 1000 characters";
  }

  return errors;
}

export function validateApplicationWithPayment(data) {
  const errors = validateApplication(data);
  const { transactionId, screenshotBase64 } = data;
  const UPI_TXN_REGEX = /^\d{12}$/;

  if (!transactionId?.trim()) {
    errors.transactionId = "UPI transaction ID is required";
  } else if (!UPI_TXN_REGEX.test(transactionId.trim())) {
    errors.transactionId = "Enter a valid 12-digit UPI transaction ID";
  }

  if (!screenshotBase64?.trim()) {
    errors.screenshotBase64 = "Payment screenshot is required";
  }

  return errors;
}

export function validateBatch(data) {
  const errors = {};
  const { programId, name, startDate, endDate } = data;

  if (!programId || !String(programId).trim()) {
    errors.programId = "Program is required";
  }

  if (!name?.trim()) {
    errors.name = "Batch name is required";
  } else if (name.trim().length > 120) {
    errors.name = "Batch name must not exceed 120 characters";
  }

  if (!startDate) {
    errors.startDate = "Start date is required";
  }

  if (!endDate) {
    errors.endDate = "End date is required";
  }

  if (startDate && endDate) {
    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (
      !Number.isNaN(parsedStart.getTime()) &&
      !Number.isNaN(parsedEnd.getTime()) &&
      parsedEnd < parsedStart
    ) {
      errors.endDate = "End date must be on or after the start date";
    }
  }

  return errors;
}

export function validateProgram(data) {
  const errors = {};
  const { title, description, duration, durations } = data;

  if (!title?.trim()) {
    errors.title = "Program title is required";
  } else if (title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  } else if (title.trim().length > 100) {
    errors.title = "Title must not exceed 100 characters";
  }

  if (!description?.trim()) {
    errors.description = "Description is required";
  } else if (description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  } else if (description.trim().length > 500) {
    errors.description = "Description must not exceed 500 characters";
  }

  const durationList = Array.isArray(durations)
    ? durations
    : duration?.trim()
      ? [duration]
      : [];
  const cleaned = durationList
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (cleaned.length === 0) {
    errors.durations = "Add at least one duration option";
  } else if (cleaned.some((value) => value.length > 50)) {
    errors.durations = "Each duration must not exceed 50 characters";
  } else if (cleaned.length > 12) {
    errors.durations = "You can add up to 12 duration options";
  }

  if (duration?.trim() && duration.trim().length > 50) {
    errors.duration = "Duration must not exceed 50 characters";
  }

  return errors;
}
