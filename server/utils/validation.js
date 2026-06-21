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
  const { fullName, email, phone, program, message } = data;
  const NAME_REGEX = /^[a-zA-Z\s.'-]{2,100}$/;

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

  if (message?.trim() && message.trim().length > 1000) {
    errors.message = "Message must not exceed 1000 characters";
  }

  return errors;
}

export function validateApplicationWithPayment(data) {
  const errors = validateApplication(data);
  const { college, transactionId, screenshotBase64 } = data;
  const COLLEGE_REGEX = /^[a-zA-Z0-9\s.'&,()-]{2,200}$/;
  const UPI_TXN_REGEX = /^\d{12}$/;

  if (!college?.trim()) {
    errors.college = "College name is required";
  } else if (!COLLEGE_REGEX.test(college.trim())) {
    errors.college = "Enter a valid college name";
  }

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

export function validateProgram(data) {
  const errors = {};
  const { title, description, duration } = data;

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

  if (duration?.trim() && duration.trim().length > 50) {
    errors.duration = "Duration must not exceed 50 characters";
  }

  return errors;
}
