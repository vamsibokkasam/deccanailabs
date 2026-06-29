import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  Mail,
  Phone,
  Upload,
  User,
} from "lucide-react";
import qr399 from "../assets/399.jpg";
import qr499 from "../assets/499.jpg";
import qr599 from "../assets/599.jpg";
import FormField from "../components/FormField";
import { submitApplicationWithPayment } from "../services/api";
import { inputClass } from "../utils/themeClasses";
import {
  sanitizeNameInput,
  sanitizeUpiTransactionId,
  validatePaymentVerificationForm,
  validateRegistrationForm,
} from "../utils/validation";
import {
  courseTitleToSlug,
  KNOWN_COURSE_TITLES,
  resolveCourseTitle,
} from "../utils/courseSlug";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const STEPS = [
  { id: 1, label: "Registration" },
  { id: 2, label: "Payment" },
  { id: 3, label: "Verification" },
  { id: 4, label: "Complete" },
];

const BENEFITS = [
  "Real-Time Projects",
  "Friendly Mentors",
  "Practical Learning",
  "Career Guidance",
];

const courseDetails = {
  "Python Development": {
    title: "Python Development Internship",
    fee: "₹499",
    qrCode: qr499,
    duration: "45 Days",
    description:
      "Learn Python through practical projects, mentor guidance, and hands-on experience that prepares you for real-world development.",
  },
  "Java Development": {
    title: "Java Development Internship",
    fee: "₹499",
    qrCode: qr499,
    duration: "45 Days",
    description:
      "Build strong Java programming skills, work on real-time applications, and gain industry-focused development experience.",
  },
  "Web Development": {
    title: "Web Development Internship",
    fee: "₹399",
    qrCode: qr399,
    duration: "45 Days",
    description:
      "Learn modern web development with HTML, CSS, JavaScript, and project-based learning guided by experienced mentors.",
  },
  "AI & Machine Learning": {
    title: "AI & Machine Learning Internship",
    fee: "₹599",
    qrCode: qr599,
    duration: "45 Days",
    description:
      "Explore Artificial Intelligence and Machine Learning concepts through practical implementation and real-world use cases.",
  },
  "Data Science": {
    title: "Data Science Internship",
    fee: "₹499",
    qrCode: qr499,
    duration: "45 Days",
    description:
      "Learn data analysis, visualization, and problem-solving techniques using industry-relevant tools and datasets.",
  },
  "Cyber Security": {
    title: "Cyber Security Internship",
    fee: "₹499",
    qrCode: qr499,
    duration: "45 Days",
    description:
      "Understand cybersecurity fundamentals, threat detection, and security practices through practical learning.",
  },
};

function StepIndicator({ step }) {
  return (
    <div className="mb-10 px-2">
      <div className="flex items-start justify-center max-w-3xl mx-auto">
        {STEPS.map((item, index) => {
          const isComplete = step > item.id;
          const isActive = step === item.id;

          return (
            <div key={item.id} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center min-w-[72px]">
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
                  className={`mt-2 text-xs font-medium text-center leading-tight ${
                    isActive || isComplete ? "text-accent" : "text-subtle"
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mt-5 mx-1 rounded-full transition-colors duration-300 ${
                    step > item.id ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
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

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="theme-card theme-card-hover px-6 py-5 rounded-2xl text-center min-w-[130px] flex-1 max-w-[180px]">
      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
        <Icon className="text-accent" size={20} />
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-fg">{value}</h3>
      <p className="text-subtle text-sm mt-1">{label}</p>
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

function ApplicationPage() {
  const { courseName } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedApplicationId, setSubmittedApplicationId] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    transactionId: "",
    screenshot: null,
  });

  const resolvedCourseTitle = resolveCourseTitle(courseName, [
    ...Object.keys(courseDetails),
    ...KNOWN_COURSE_TITLES,
  ]);
  const canonicalSlug = courseTitleToSlug(resolvedCourseTitle);

  const selectedCourse =
    courseDetails[resolvedCourseTitle] || courseDetails["Python Development"];

  const feeAmount =
    parseInt(String(selectedCourse.fee).replace(/\D/g, ""), 10) || 599;

  useEffect(() => {
    if (courseName && canonicalSlug && courseName !== canonicalSlug) {
      navigate(`/internship/apply/${canonicalSlug}`, { replace: true });
    }
  }, [courseName, canonicalSlug, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [step]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, screenshot: file });
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      if (fieldErrors.screenshot) {
        setFieldErrors({ ...fieldErrors, screenshot: "" });
      }
    }
  };

  const handleContinueToPayment = () => {
    const errors = validateRegistrationForm(formData);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStep(2);
  };

  const handleSubmitApplication = async () => {
    const errors = validatePaymentVerificationForm(formData);

    if (!formData.screenshot) {
      errors.screenshot = "Payment screenshot is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      const screenshotBase64 = await readFileAsDataUrl(formData.screenshot);
      const result = await submitApplicationWithPayment({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        program: resolvedCourseTitle,
        transactionId: formData.transactionId,
        feeAmount,
        screenshotBase64,
      });

      setSubmittedApplicationId(result.data.applicationId);
      setStep(4);
    } catch (error) {
      setSubmitError(error.message || "Failed to submit application");
      if (error.errors) {
        setFieldErrors(error.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="theme-section relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-8">
          <p className="theme-label mb-3">Apply Now</p>
          <h1 className="theme-heading">Internship Application</h1>
          {step > 0 && step < 4 && (
            <p className="text-muted mt-3">{selectedCourse.title}</p>
          )}
        </div>

        {step > 0 && step < 4 && <StepIndicator step={step} />}

        {step === 0 && (
          <div className="theme-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent via-accent-warm to-accent" />

            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              DECCAN AI labs Internship Program
            </span>

            <h2 className="text-3xl md:text-4xl font-medium text-fg mb-4 leading-tight">
              {selectedCourse.title}
            </h2>

            <p className="text-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              {selectedCourse.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <StatCard icon={Clock} value={selectedCourse.duration} label="Training" />
              <StatCard icon={IndianRupee} value={selectedCourse.fee} label="Fee" />
              <StatCard icon={Award} value="Certificate" label="Provided" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto mb-10 text-left">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface/80 border border-border"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center">
                    <Check className="text-accent" size={14} strokeWidth={2.5} />
                  </span>
                  <span className="text-muted text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="theme-btn-primary px-10 py-4 text-base font-medium inline-flex items-center gap-2"
            >
              Apply Now
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="theme-card rounded-3xl p-8 md:p-10">
            <StepHeader
              title="Student Registration"
              subtitle="Please provide your details to continue with the internship application."
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
            </div>

            <ActionButtons
              onBack={() => {
                setFieldErrors({});
                setStep(0);
              }}
              onNext={handleContinueToPayment}
              nextLabel="Continue to Payment"
            />
          </div>
        )}

        {step === 2 && (
          <div className="theme-card rounded-3xl p-8 md:p-10">
            <StepHeader
              title="Complete Your Registration"
              subtitle="Secure your internship seat by completing the payment."
            />

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <StatCard icon={IndianRupee} value={selectedCourse.fee} label="Internship Fee" />
              <StatCard icon={Clock} value={selectedCourse.duration} label="Duration" />
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 mb-6 max-w-lg mx-auto">
              <h3 className="font-medium text-fg mb-4 flex items-center gap-2">
                <User size={18} className="text-accent" />
                Application Summary
              </h3>
              <SummaryRow label="Name" value={formData.fullName} />
              <SummaryRow label="Email" value={formData.email} />
              <SummaryRow label="Phone" value={formData.phone} />
              <SummaryRow label="College" value={formData.college} />
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 text-center mb-6 max-w-md mx-auto">
              <div className="inline-block p-3 rounded-2xl bg-white mb-4">
                <img
                  src={selectedCourse.qrCode}
                  alt={`UPI QR code for ${selectedCourse.fee}`}
                  className="w-56 md:w-64 rounded-lg"
                />
              </div>
              <p className="font-medium text-lg text-fg">
                Scan & Pay {selectedCourse.fee}
              </p>
              <p className="text-sm text-muted mt-2 max-w-xs mx-auto">
                After payment, continue to upload your transaction ID and screenshot.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-input border border-border">
                <span className="text-subtle text-sm">UPI ID:</span>
                <span className="text-accent font-medium">deccanailabs@upi</span>
              </div>
            </div>

            <ActionButtons
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              nextLabel="I Have Paid"
            />
          </div>
        )}

        {step === 3 && !submitting && (
          <div className="theme-card rounded-3xl p-8 md:p-10">
            <StepHeader
              title="Payment Verification"
              subtitle="Upload your payment screenshot and enter the transaction ID to complete your application."
            />

            <div className="max-w-lg mx-auto space-y-6">
              <FormField label="UPI Transaction ID" error={fieldErrors.transactionId}>
                <input
                  type="text"
                  name="transactionId"
                  placeholder="12-digit UPI ID e.g. 123456789012"
                  value={formData.transactionId}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={12}
                  required
                  className={inputClass(!!fieldErrors.transactionId)}
                />
              </FormField>

              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  fieldErrors.screenshot
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Upload className="text-accent" size={24} />
                </div>
                <h3 className="font-medium text-fg mb-1">Upload Payment Screenshot</h3>
                <p className="text-subtle text-sm mb-4">PNG, JPG or WebP — max 5 MB</p>

                {previewUrl && (
                  <div className="mb-4">
                    <img
                      src={previewUrl}
                      alt="Payment screenshot preview"
                      className="mx-auto rounded-xl border border-border max-h-56 object-contain"
                    />
                  </div>
                )}

                <label className="theme-btn-outline inline-flex items-center gap-2 px-6 py-3 cursor-pointer hover:border-accent transition">
                  <Upload size={18} />
                  {formData.screenshot ? "Change Screenshot" : "Choose Screenshot"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {fieldErrors.screenshot && (
                  <p className="text-red-400 text-sm mt-3">{fieldErrors.screenshot}</p>
                )}
              </div>

              {submitError && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                  {submitError}
                </p>
              )}

              <ActionButtons
                onBack={() => {
                  setFieldErrors({});
                  setSubmitError("");
                  setStep(2);
                }}
                onNext={handleSubmitApplication}
                nextLabel="Verify & Submit"
                nextLoading={submitting}
              />
            </div>
          </div>
        )}

        {submitting && step === 3 && (
          <div className="theme-card rounded-3xl p-12 text-center">
            <Loader2 className="text-accent mx-auto mb-6 animate-spin" size={56} />
            <h2 className="text-2xl md:text-3xl font-medium text-fg mb-3">
              Verifying Application
            </h2>
            <p className="text-muted">Please wait while we process your submission...</p>
          </div>
        )}

        {step === 4 && (
          <div className="theme-card rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-400" size={40} />
            </div>

            <h2 className="text-3xl md:text-4xl font-medium text-fg mb-4">
              Registration Successful
            </h2>

            <p className="text-muted max-w-lg mx-auto mb-8 leading-relaxed">
              Thank you for applying for the {selectedCourse.title}. Your payment
              details have been submitted and are currently under verification.
            </p>

            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto mb-6 text-left">
              <h3 className="font-medium text-fg mb-4">Submitted Details</h3>
              <SummaryRow label="Name" value={formData.fullName} />
              <SummaryRow label="Email" value={formData.email} />
              <SummaryRow label="Phone" value={formData.phone} />
              <SummaryRow label="College" value={formData.college} />
            </div>

            <div className="border border-accent/30 bg-accent/5 rounded-2xl p-6 max-w-md mx-auto mb-6">
              <p className="text-subtle text-sm mb-2">Application ID</p>
              <p className="text-2xl md:text-3xl font-semibold text-accent tracking-wide">
                {submittedApplicationId}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-yellow-400 text-sm font-medium">
                <Clock size={16} />
                Verification Pending
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto mb-8 text-left">
              <h3 className="font-medium text-fg mb-4">What Happens Next?</h3>
              <ul className="space-y-3">
                {[
                  "Payment verification by our team",
                  "Internship enrollment confirmation",
                  "Course access details shared via email",
                  "Internship starts as per schedule",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted">
                    <Check className="text-accent shrink-0 mt-0.5" size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-subtle text-sm">
              Verification usually takes less than 24 hours. You will receive an
              update through email or phone.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ApplicationPage;
