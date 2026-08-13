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
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import FormField from "../components/FormField";
import { submitApplication } from "../services/api";
import { inputClass } from "../utils/themeClasses";
import {
  sanitizeNameInput,
  validateRegistrationForm,
} from "../utils/validation";
import {
  courseTitleToSlug,
  KNOWN_COURSE_TITLES,
  resolveCourseTitle,
} from "../utils/courseSlug";

const SUBMIT_STATUS = {
  UPLOADING: "Submitting your application...",
  WAKING: "Connecting to server (this can take up to a minute on first request)...",
};

const STEPS = [
  { id: 1, label: "Registration" },
  { id: 2, label: "Complete" },
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
    duration: "45 Days",
    description:
      "Learn Python through practical projects, mentor guidance, and hands-on experience that prepares you for real-world development.",
  },
  "Java Development": {
    title: "Java Development Internship",
    duration: "45 Days",
    description:
      "Build strong Java programming skills, work on real-time applications, and gain industry-focused development experience.",
  },
  "Web Development": {
    title: "Web Development Internship",
    duration: "45 Days",
    description:
      "Learn modern web development with HTML, CSS, JavaScript, and project-based learning guided by experienced mentors.",
  },
  "AI & Machine Learning": {
    title: "AI & Machine Learning Internship",
    duration: "45 Days",
    description:
      "Explore Artificial Intelligence and Machine Learning concepts through practical implementation and real-world use cases.",
  },
  "Data Science": {
    title: "Data Science Internship",
    duration: "45 Days",
    description:
      "Learn data analysis, visualization, and problem-solving techniques using industry-relevant tools and datasets.",
  },
  "Cyber Security": {
    title: "Cyber Security Internship",
    duration: "45 Days",
    description:
      "Understand cybersecurity fundamentals, threat detection, and security practices through practical learning.",
  },
};

function StepIndicator({ step }) {
  return (
    <div className="mb-10 px-2">
      <div className="flex items-start justify-center max-w-md mx-auto">
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
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(SUBMIT_STATUS.UPLOADING);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedApplicationId, setSubmittedApplicationId] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    department: "",
  });

  const resolvedCourseTitle = resolveCourseTitle(courseName, [
    ...Object.keys(courseDetails),
    ...KNOWN_COURSE_TITLES,
  ]);
  const canonicalSlug = courseTitleToSlug(resolvedCourseTitle);

  const selectedCourse =
    courseDetails[resolvedCourseTitle] || courseDetails["Python Development"];

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
    }

    setFormData({ ...formData, [name]: nextValue });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmitApplication = async () => {
    const errors = validateRegistrationForm(formData);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
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
      const result = await submitApplication({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        department: formData.department,
        program: resolvedCourseTitle,
      });

      if (!result?.data?.applicationId) {
        throw new Error("Application submitted but no ID was returned. Please contact support.");
      }

      setSubmittedApplicationId(result.data.applicationId);
      setStep(2);
    } catch (error) {
      setSubmitError(error.message || "Failed to submit application");
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
        <div className="text-center mb-8">
          <p className="theme-label mb-3">Apply Now</p>
          <h1 className="theme-heading">Internship Application</h1>
          {step > 0 && step < 2 && (
            <p className="text-muted mt-3">{selectedCourse.title}</p>
          )}
        </div>

        {step > 0 && step < 2 && <StepIndicator step={step} />}

        {step === 0 && (
          <div className="theme-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-accent via-accent-warm to-accent" />

            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-6">
              DECCAN AI LABS Internship Program
            </span>

            <h2 className="text-3xl md:text-4xl font-medium text-fg mb-4 leading-tight">
              {selectedCourse.title}
            </h2>

            <p className="text-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              {selectedCourse.description}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <StatCard icon={Clock} value={selectedCourse.duration} label="Training" />
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
              Register Now
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 1 && !submitting && (
          <div className="theme-card rounded-3xl p-8 md:p-10">
            <StepHeader
              title="Student Registration"
              subtitle="Please provide your details to complete your internship application."
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

              {submitError && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                  {submitError}
                </p>
              )}
            </div>

            {submitError && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4 max-w-lg mx-auto mt-6">
                {submitError}
              </p>
            )}

            <ActionButtons
              onBack={() => {
                setFieldErrors({});
                setSubmitError("");
                setStep(0);
              }}
              onNext={handleSubmitApplication}
              nextLabel="Submit Application"
              nextLoading={submitting}
            />
          </div>
        )}

        {submitting && step === 1 && (
          <div className="theme-card rounded-3xl p-12 text-center">
            <Loader2 className="text-accent mx-auto mb-6 animate-spin" size={56} />
            <h2 className="text-2xl md:text-3xl font-medium text-fg mb-3">
              Submitting Application
            </h2>
            <p className="text-muted">{submitStatus}</p>
            {submitError && (
              <p className="text-red-400 text-sm mt-6 max-w-md mx-auto">{submitError}</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="theme-card rounded-3xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-green-400" size={40} />
            </div>

            <h2 className="text-3xl md:text-4xl font-medium text-fg mb-4">
              Registration Successful
            </h2>

            <p className="text-muted max-w-lg mx-auto mb-8 leading-relaxed">
              Thank you for applying for the {selectedCourse.title}. Your details
              have been submitted successfully.
            </p>

            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto mb-6 text-left">
              <h3 className="font-medium text-fg mb-4">Submitted Details</h3>
              <SummaryRow label="Name" value={formData.fullName} />
              <SummaryRow label="Email" value={formData.email} />
              <SummaryRow label="Phone" value={formData.phone} />
              <SummaryRow label="College" value={formData.college} />
              <SummaryRow label="Department" value={formData.department} />
            </div>

            <div className="border border-accent/30 bg-accent/5 rounded-2xl p-6 max-w-md mx-auto mb-6">
              <p className="text-subtle text-sm mb-2">Application ID</p>
              <p className="text-2xl md:text-3xl font-semibold text-accent tracking-wide">
                {submittedApplicationId}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto mb-8 text-left">
              <h3 className="font-medium text-fg mb-4">What Happens Next?</h3>
              <ul className="space-y-3">
                {[
                  "Application review by our team",
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
              You will receive an update through email or phone, usually within
              24 hours.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ApplicationPage;
