import { Resend } from "resend";
import {
  issueOfferLetterForApplication,
  loadOfferLetterPdf,
} from "./offerLetterIssuance.js";

const MAX_EMAIL_PDF_BYTES = 1_800_000;

let resendClient;

function getResendClient() {
  if (!process.env.RESEND_API_KEY?.trim()) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY.trim());
  }

  return resendClient;
}

function stripEnvQuotes(value) {
  return String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeFilename(value, fallback) {
  const name = String(value || fallback || "Offer-Letter.pdf");
  return name.replace(/[^\w.-]+/g, "-");
}

function asPdfBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value);
}

function buildOfferLetterEmailHtml({
  recipientName,
  program,
  applicationId,
  college,
  department,
  startDate,
  endDate,
}) {
  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#ffffff;">
                <p style="margin:0 0 4px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">DECCAN AI LABS</p>
                <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;opacity:0.7;">Private Limited</p>
                <h1 style="margin:0;font-size:24px;line-height:1.4;font-weight:600;">Internship Offer Letter</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Dear ${escapeHtml(recipientName)},</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                  We are pleased to welcome you to <strong>DECCAN AI LABS</strong>.
                  Your official internship offer letter is attached to this email as a PDF.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <p style="margin:0 0 10px;font-size:14px;"><strong>Program:</strong> ${escapeHtml(program)}</p>
                      <p style="margin:0 0 10px;font-size:14px;"><strong>Registration ID:</strong> ${escapeHtml(applicationId)}</p>
                      <p style="margin:0 0 10px;font-size:14px;"><strong>College:</strong> ${escapeHtml(college)}</p>
                      <p style="margin:0 0 10px;font-size:14px;"><strong>Department:</strong> ${escapeHtml(department)}</p>
                      <p style="margin:0;font-size:14px;"><strong>Internship Period:</strong> ${formatDate(startDate)} – ${formatDate(endDate)}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                  Please review the attached offer letter carefully. We look forward to your participation
                  and a productive learning experience with DECCAN AI LABS.
                </p>
                <p style="margin:24px 0 0;font-size:14px;line-height:1.7;">
                  Best regards,<br />
                  <strong>DECCAN AI LABS Team</strong><br />
                  <a href="mailto:careers@deccanailabs.com" style="color:#2563eb;">careers@deccanailabs.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

function isRetryableResendError(error) {
  const message = String(error?.message || "");
  return /internal server error|unable to process|try again later/i.test(message);
}

async function dispatchResendEmail(client, payload) {
  const { data, error } = await client.emails.send(payload);
  if (!error) return data;

  const wrapped = new Error(error.message || "Failed to send offer letter email");
  wrapped.statusCode = error.statusCode || 502;
  wrapped.cause = error;
  throw wrapped;
}

export async function sendOfferLetterEmail({ application, offerLetter }) {
  const client = getResendClient();
  if (!client) {
    const error = new Error("RESEND_API_KEY is not configured");
    error.statusCode = 503;
    throw error;
  }

  if (!application?.email?.trim()) {
    const error = new Error("Application has no recipient email");
    error.statusCode = 400;
    throw error;
  }

  let letter =
    offerLetter ||
    (await issueOfferLetterForApplication(application));
  let pdfBuffer = asPdfBuffer(loadOfferLetterPdf(application, letter));

  if (pdfBuffer.length > MAX_EMAIL_PDF_BYTES) {
    letter = await issueOfferLetterForApplication(application, { force: true });
    pdfBuffer = asPdfBuffer(loadOfferLetterPdf(application, letter));
  }

  const from = stripEnvQuotes(process.env.MAIL_FROM) || "onboarding@resend.dev";
  const replyTo = stripEnvQuotes(process.env.MAIL_REPLY_TO) || undefined;
  const startDate =
    application.internshipStartDate || application.batch?.startDate;
  const endDate = application.internshipEndDate || application.batch?.endDate;
  const applicationId =
    application.applicationId || letter.applicationRef || application.id;

  const html = buildOfferLetterEmailHtml({
    recipientName: application.fullName,
    program: application.program || letter.program,
    applicationId,
    college: application.college || "—",
    department: application.department || "—",
    startDate,
    endDate,
  });

  const payload = {
    from,
    to: application.email.trim(),
    subject: `Your DECCAN AI LABS Internship Offer Letter – ${application.program || "Internship"}`,
    html,
    attachments: [
      {
        filename: safeFilename(
          letter.filename,
          `Offer-Letter-${applicationId}.pdf`
        ),
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf",
      },
    ],
  };
  if (replyTo) payload.replyTo = replyTo;

  try {
    return await dispatchResendEmail(client, payload);
  } catch (error) {
    if (!isRetryableResendError(error)) throw error;

    letter = await issueOfferLetterForApplication(application, { force: true });
    pdfBuffer = asPdfBuffer(loadOfferLetterPdf(application, letter));
    payload.attachments[0] = {
      filename: safeFilename(letter.filename, `Offer-Letter-${applicationId}.pdf`),
      content: pdfBuffer.toString("base64"),
      contentType: "application/pdf",
    };

    try {
      return await dispatchResendEmail(client, payload);
    } catch (retryError) {
      console.error("Resend offer letter email failed:", {
        name: retryError.cause?.name || retryError.name,
        message: retryError.message,
        pdfBytes: pdfBuffer.length,
      });
      const friendly = new Error(
        "Resend could not send the offer letter PDF. Please try again in a moment."
      );
      friendly.statusCode = 502;
      throw friendly;
    }
  }
}
