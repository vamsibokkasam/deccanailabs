import { Resend } from "resend";
import { getSiteUrl } from "../config/site.js";
import {
  buildCertificateVerifyUrl,
  renderCertificate,
  resolveDisplayCertNo,
} from "./certificateRenderer.js";

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

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function certificateFilename(certNo) {
  return `${String(certNo || "certificate").replace(/\//g, "-")}.pdf`;
}

function buildCertificateEmailHtml({
  recipientName,
  program,
  certNo,
  college,
  department,
  startDate,
  endDate,
  verifyUrl,
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
                <h1 style="margin:0;font-size:24px;line-height:1.4;font-weight:600;">Internship Certificate Issued</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Dear ${recipientName},</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                  Congratulations on successfully completing your internship with <strong>DECCAN AI LABS</strong>.
                  Your official internship certificate is attached to this email as a PDF.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <p style="margin:0 0 10px;font-size:14px;"><strong>Program:</strong> ${program}</p>
                      <p style="margin:0 0 10px;font-size:14px;"><strong>Certificate ID:</strong> ${certNo}</p>
                      <p style="margin:0 0 10px;font-size:14px;"><strong>College:</strong> ${college}</p>
                      <p style="margin:0 0 10px;font-size:14px;"><strong>Department:</strong> ${department}</p>
                      <p style="margin:0;font-size:14px;"><strong>Internship Period:</strong> ${formatDate(startDate)} – ${formatDate(endDate)}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
                  You can verify your certificate online anytime using the link below:
                </p>
                <p style="margin:0 0 24px;">
                  <a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600;">
                    Verify Certificate
                  </a>
                </p>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#64748b;word-break:break-all;">
                  ${verifyUrl}
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

export async function sendCertificateEmail({ application, certificate }) {
  const client = getResendClient();
  if (!client) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!application?.email?.trim()) {
    throw new Error("Application has no recipient email");
  }

  const from = process.env.MAIL_FROM?.trim() || "onboarding@resend.dev";
  const replyTo = process.env.MAIL_REPLY_TO?.trim() || undefined;
  const displayCertNo = await resolveDisplayCertNo(certificate);
  const verifyUrl = buildCertificateVerifyUrl(displayCertNo);
  const { pdfBuffer } = await renderCertificate(certificate);

  const html = buildCertificateEmailHtml({
    recipientName: application.fullName,
    program: application.program || certificate.internshipDomain,
    certNo: displayCertNo,
    college: certificate.college || application.college || "—",
    department: certificate.department || application.department || "—",
    startDate: certificate.startDate,
    endDate: certificate.endDate,
    verifyUrl,
  });

  const { data, error } = await client.emails.send({
    from,
    to: application.email.trim(),
    replyTo,
    subject: `Your DECCAN AI LABS Internship Certificate – ${application.program || certificate.internshipDomain}`,
    html,
    attachments: [
      {
        filename: certificateFilename(displayCertNo),
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  if (error) {
    throw new Error(error.message || "Failed to send certificate email");
  }

  return data;
}

export function isCertificateEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
