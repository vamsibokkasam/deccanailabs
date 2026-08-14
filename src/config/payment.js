import qr499 from "../assets/499.jpg";
import qr599 from "../assets/599.jpg";

export const WEB_DEVELOPMENT_FEE = 499;
export const COURSE_FEE_AMOUNT = 599;
export const WEB_DEVELOPMENT_TITLE = "Web Development";

export const UPI_PAYEE_NAME = "DECCAN AI LABS Private Limited";
export const UPI_ID =
  import.meta.env.VITE_UPI_ID?.trim() || "vamsib170-1@okicici";

export function getCourseFee(courseTitle) {
  return String(courseTitle || "").trim() === WEB_DEVELOPMENT_TITLE
    ? WEB_DEVELOPMENT_FEE
    : COURSE_FEE_AMOUNT;
}

export function getCourseQrImage(courseTitle) {
  return getCourseFee(courseTitle) === WEB_DEVELOPMENT_FEE ? qr499 : qr599;
}

export function formatFee(amount = COURSE_FEE_AMOUNT) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}
