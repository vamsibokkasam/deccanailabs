import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Upload,
  User,
} from "lucide-react";
import FormField from "../components/FormField";
import ProgramIcon from "../components/ProgramIcon";
import {
  formatFee,
  getCourseFee,
  getCourseQrImage,
  UPI_ID,
  UPI_PAYEE_NAME,
} from "../config/payment";
import { COURSES, getCourseBySlug } from "../config/courses";
import { submitApplicationWithPayment } from "../services/api";
import { inputClass } from "../utils/themeClasses";
import { courseTitleToSlug } from "../utils/courseSlug";
import {
  sanitizeNameInput,
  sanitizeUpiTransactionId,
  validatePaymentVerificationForm,
  validateRegistrationForm,
} from "../utils/validation";

const STEPS = [
  { id: 1, label: "Registration" },
  { id: 2, label: "Payment details" },
  { id: 3, label: "Verification" },
  { id: 4, label: "Successfully generated" },
];

const SUBMIT_STATUS = {
  UPLOADING: "Generating your application ID...",
  WAKING: "Connecting to server (this can take up to a minute on first request)...",
};

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const ALLOWED_SCREENSHOT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read the screenshot"));
    reader.readAsDataURL(file);
  });
}

function StepIndicator({ step }) {
  return (
    <div className="mb-10 px-1">
      <ol className="course-register-steps">
        {STEPS.map((item, index) => {
          const isComplete = step > item.id;
          const isActive = step === item.id;

          return (
            <li key={item.id} className="course-register-step">
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    isComplete
                      ? "bg-accent border-accent text-white shadow-lg shadow-accent/30"
                      : isActive
                        ? "bg-accent/15 border-accent text-accent"
                        : "bg-surface border-border text-subtle"
                  }`}
                >
                  {isComplete ? <Check size={18} strokeWidth={2.5} /> : item.id}
                </div>
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-medium text-center leading-tight ${
                    isActive || isComplete ? "text-accent" : "text-subtle"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {index < STEPS.length - 1 ? (
                <div
                  className={`course-register-step-line ${
                    step > item.id ? "is-complete" : ""
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-medium text-fg mb-2">{title}</h2>
      <p className="text-muted max-w-lg mx-auto">{subtitle}</p>
    </div>
  );
}

function ActionButtons({ onBack, onNext, nextLabel, nextDisabled, nextLoading }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-6">
      <button
        type="button"
        onClick={onBack}
        className="theme-btn-outline inline-flex items-center justify-center gap-2 px-6 py-3"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || nextLoading}
        className="theme-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {nextLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            {nextLabel}
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <span className="text-subtle text-sm">{label}</span>
      <span className="text-fg text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function CourseRegistrationPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const course = getCourseBySlug(slug);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(SUBMIT_STATUS.UPLOADING);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedApplicationId, setSubmittedApplicationId] = useState("");
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [screenshotName, setScreenshotName] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    transactionId: "",
    screenshotBase64: "",
  });

  const canonicalSlug = course ? course.slug : courseTitleToSlug(slug || "");

  useEffect(() => {
    const slugExists = COURSES.some((item) => item.slug === canonicalSlug);
    if (slug && canonicalSlug && slug !== canonicalSlug && slugExists) {
      navigate(`/courses/${canonicalSlug}/register`, { replace: true });
    }
  }, [slug, canonicalSlug, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [step]);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const courseFee = getCourseFee(course.title);
  const qrImage = getCourseQrImage(course.title);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "fullName") {
      nextValue = sanitizeNameInput(value, 100);
    } else if (name === "transactionId") {
      nextValue = sanitizeUpiTransactionId(value);
    }

    setFormData({ ...formData, [name]: nextValue });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_SCREENSHOT_TYPES.has(file.type)) {
      setFieldErrors({
        ...fieldErrors,
        screenshotBase64: "Screenshot must be a JPG, PNG, or WebP image",
      });
      return;
    }

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setFieldErrors({
        ...fieldErrors,
        screenshotBase64: "Screenshot must be smaller than 5 MB",
      });
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setScreenshotName(file.name);
      setFormData({ ...formData, screenshotBase64: dataUrl });
      if (fieldErrors.screenshotBase64) {
        setFieldErrors({ ...fieldErrors, screenshotBase64: "" });
      }
    } catch {
      setFieldErrors({
        ...fieldErrors,
        screenshotBase64: "Could not read the screenshot. Try another image.",
      });
    }
  };

  const copyUpiId = async () => {
    if (!UPI_ID) return;
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const goToPayment = () => {
    const errors = validateRegistrationForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError("Please fix the errors below");
      return;
    }

    setFieldErrors({});
    setSubmitError("");
    setStep(2);
  };

  const handleSubmitRegistration = async () => {
    const errors = {
      ...validateRegistrationForm(formData),
      ...validatePaymentVerificationForm(formData),
    };

    if (!formData.screenshotBase64) {
      errors.screenshotBase64 = "Payment screenshot is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitError("Please fix the errors below");
      return;
    }

    setSubmitting(true);
    setSubmitStatus(SUBMIT_STATUS.UPLOADING);
    setSubmitError("");
    setFieldErrors({});

    const wakeUpTimer = window.setTimeout(() => {
      setSubmitStatus(SUBMIT_STATUS.WAKING);
    }, 8000);

    try {
      const result = await submitApplicationWithPayment({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        department: formData.department,
        program: course.title,
        source: "course",
        feeAmount: courseFee,
        transactionId: formData.transactionId,
        screenshotBase64: formData.screenshotBase64,
      });

      if (!result?.data?.applicationId) {
        throw new Error("Submitted but no ID was returned. Please contact support.");
      }

      setSubmittedApplicationId(result.data.applicationId);
      setStep(4);
    } catch (error) {
      setSubmitError(error.message || "Failed to submit registration");
      if (error.errors) {
        setFieldErrors(error.errors);
      }
    } finally {
      window.clearTimeout(wakeUpTimer);
      setSubmitting(false);
      setSubmitStatus(SUBMIT_STATUS.UPLOADING);
    }
  };

  return (
    <section className="theme-section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <Link to={`/courses/${course.slug}`} className="course-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to {course.title}
        </Link>

        <div className="text-center mb-8">
          <p className="theme-label mb-3">Course Registration</p>
          <h1 className="theme-heading">Register in four steps</h1>
          <p className="text-muted mt-3">{course.title}</p>
        </div>

        {step < 4 ? <StepIndicator step={step} /> : null}

        {step === 1 && (
          <div className="theme-card rounded-3xl p-8 md:p-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="internship-icon">
                <ProgramIcon title={course.title} className="w-7 h-7" />
              </div>
            </div>
            <StepHeader
              title="Student Registration"
              subtitle="Enter your details to start this course registration."
            />

            <div className="max-w-lg mx-auto space-y-5">
              <FormField label="Full Name" error={fieldErrors.fullName}>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" size={18} />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    className={`${inputClass(!!fieldErrors.fullName)} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="Email Address" error={fieldErrors.email}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    className={`${inputClass(!!fieldErrors.email)} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="Mobile Number" error={fieldErrors.phone}>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" size={18} />
                  <input
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className={`${inputClass(!!fieldErrors.phone)} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="College Name" error={fieldErrors.college}>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" size={18} />
                  <input
                    type="text"
                    name="college"
                    placeholder="Your college or university"
                    value={formData.college}
                    onChange={handleChange}
                    autoComplete="organization"
                    className={`${inputClass(!!fieldErrors.college)} pl-11`}
                  />
                </div>
              </FormField>

              <FormField label="Department" error={fieldErrors.department}>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" size={18} />
                  <input
                    type="text"
                    name="department"
                    placeholder="e.g. Computer Science & Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    className={`${inputClass(!!fieldErrors.department)} pl-11`}
                  />
                </div>
              </FormField>

              {submitError ? (
                <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                  {submitError}
                </p>
              ) : null}
            </div>

            <ActionButtons
              onBack={() => navigate(`/courses/${course.slug}`)}
              onNext={goToPayment}
              nextLabel="Continue to payment"
            />
          </div>
        )}

        {step === 2 && (
          <div className="theme-card rounded-3xl p-8 md:p-10">
            <StepHeader
              title="Payment details"
              subtitle={`Pay ${formatFee(courseFee)} by UPI, then continue to verification with your transaction ID.`}
            />

            <div className="max-w-lg mx-auto">
              <div className="course-pay-card">
                <p className="theme-label mb-2">Course fee</p>
                <p className="course-pay-amount">{formatFee(courseFee)}</p>
                <p className="text-muted text-sm mt-1">{course.title}</p>
                <p className="text-subtle text-sm mt-1">{UPI_PAYEE_NAME}</p>
              </div>

              <div className="course-pay-qr-wrap">
                {!qrFailed && qrImage ? (
                  <img
                    src={qrImage}
                    alt={`${course.title} UPI payment QR code for ${formatFee(courseFee)}`}
                    className="course-pay-qr"
                    onError={() => setQrFailed(true)}
                  />
                ) : (
                  <div className="course-pay-qr course-pay-qr--empty">
                    Pay {formatFee(courseFee)} with any UPI app, then continue with your
                    transaction ID.
                  </div>
                )}
              </div>

              {UPI_ID ? (
                <div className="flex items-center justify-center gap-2 mt-5">
                  <code className="text-fg bg-surface border border-border rounded-xl px-4 py-2 text-sm">
                    {UPI_ID}
                  </code>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="p-2 rounded-lg border border-border text-muted hover:text-accent hover:border-accent/30 transition"
                    title="Copy UPI ID"
                  >
                    {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} />}
                  </button>
                </div>
              ) : null}

              <ul className="mt-8 space-y-3 text-sm text-muted">
                {[
                  `Pay exactly ${formatFee(courseFee)} using any UPI app`,
                  "Save the 12-digit UPI transaction ID",
                  "Keep a screenshot of the successful payment",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="text-accent shrink-0 mt-0.5" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <ActionButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextLabel="I have paid"
            />
          </div>
        )}

        {step === 3 && !submitting && (
          <div className="theme-card rounded-3xl p-8 md:p-10">
            <StepHeader
              title="Verification"
              subtitle="Enter your UPI transaction ID and upload the payment screenshot. We will generate your application ID next."
            />

            <div className="max-w-lg mx-auto space-y-5">
              <div className="bg-surface border border-border rounded-2xl p-5 text-left">
                <h3 className="font-medium text-fg mb-3">Registration summary</h3>
                <SummaryRow label="Name" value={formData.fullName} />
                <SummaryRow label="Email" value={formData.email} />
                <SummaryRow label="Phone" value={formData.phone} />
                <SummaryRow label="Course" value={course.title} />
                <SummaryRow label="Fee" value={formatFee(courseFee)} />
              </div>

              <FormField label="UPI transaction ID" error={fieldErrors.transactionId}>
                <input
                  type="text"
                  name="transactionId"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="12-digit UPI transaction ID"
                  value={formData.transactionId}
                  onChange={handleChange}
                  className={inputClass(!!fieldErrors.transactionId)}
                />
              </FormField>

              <FormField label="Payment screenshot" error={fieldErrors.screenshotBase64}>
                <label className="course-upload">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleScreenshot}
                    className="sr-only"
                  />
                  {formData.screenshotBase64 ? (
                    <img
                      src={formData.screenshotBase64}
                      alt="Payment screenshot preview"
                      className="course-upload-preview"
                    />
                  ) : (
                    <span className="course-upload-empty">
                      <Upload size={20} />
                      Upload JPG, PNG, or WebP (max 5 MB)
                    </span>
                  )}
                </label>
                {screenshotName ? (
                  <p className="text-subtle text-xs mt-2">{screenshotName}</p>
                ) : null}
              </FormField>

              {submitError ? (
                <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                  {submitError}
                </p>
              ) : null}
            </div>

            <ActionButtons
              onBack={() => {
                setSubmitError("");
                setStep(2);
              }}
              onNext={handleSubmitRegistration}
              nextLabel="Generate application ID"
              nextLoading={submitting}
            />
          </div>
        )}

        {submitting && step === 3 && (
          <div className="theme-card rounded-3xl p-12 text-center">
            <Loader2 className="text-accent mx-auto mb-6 animate-spin" size={56} />
            <h2 className="text-2xl md:text-3xl font-medium text-fg mb-3">
              Generating application ID
            </h2>
            <p className="text-muted">{submitStatus}</p>
          </div>
        )}

        {step === 4 && (
          <div className="theme-card rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-400" size={40} />
            </div>

            <h2 className="text-3xl md:text-4xl font-medium text-fg mb-4">
              Successfully generated
            </h2>

            <p className="text-muted max-w-lg mx-auto mb-8 leading-relaxed">
              Your {course.title} registration is in. Payment is pending review by
              our team.
            </p>

            <div className="border border-accent/30 bg-accent/5 rounded-2xl p-6 max-w-md mx-auto mb-6">
              <p className="text-subtle text-sm mb-2">Application ID</p>
              <p className="text-2xl md:text-3xl font-semibold text-accent tracking-wide">
                {submittedApplicationId}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto mb-6 text-left">
              <h3 className="font-medium text-fg mb-4">Submitted details</h3>
              <SummaryRow label="Name" value={formData.fullName} />
              <SummaryRow label="Email" value={formData.email} />
              <SummaryRow label="Phone" value={formData.phone} />
              <SummaryRow label="College" value={formData.college} />
              <SummaryRow label="Department" value={formData.department} />
              <SummaryRow label="UPI txn ID" value={formData.transactionId} />
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto mb-8 text-left">
              <h3 className="font-medium text-fg mb-4">What happens next?</h3>
              <ul className="space-y-3">
                {[
                  "Our team reviews your payment screenshot",
                  "You receive a confirmation by email or phone",
                  "Course access details are shared after payment is verified",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted">
                    <Check className="text-accent shrink-0 mt-0.5" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-subtle text-sm">
              Keep your application ID handy. Updates usually arrive within 24 hours.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CourseRegistrationPage;
