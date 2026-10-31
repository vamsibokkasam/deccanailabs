import { useEffect, useState } from "react";
import { Clock, GraduationCap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPrograms, submitApplication } from "../services/api";
import { validateRegistrationForm } from "../utils/validation";
import { inputClass } from "../utils/themeClasses";
import { courseCover } from "../utils/courseCover";
import { courseTitleToSlug } from "../utils/courseSlug";
import FormField from "./FormField";
import ProgramIcon from "./ProgramIcon";
import Reveal from "./Reveal";

const fallbackPrograms = [
  {
    title: "Web Development",
    description:
      "Learn modern web development with HTML, CSS, JavaScript, and project-based learning guided by experienced mentors.",
  },
  {
    title: "Java Development",
    description:
      "Build strong Java programming skills, work on real-time applications, and gain industry-focused development experience.",
  },
  {
    title: "Python Development",
    description:
      "Learn Python through practical projects, mentor guidance, and hands-on experience that prepares you for real roles.",
  },
  {
    title: "AI & Machine Learning",
    description:
      "Explore AI fundamentals, build ML models, and apply intelligent systems through guided internship projects.",
  },
  {
    title: "Data Science",
    description:
      "Work with real datasets, analysis workflows, and visualization projects to build job-ready data skills.",
  },
  {
    title: "Cyber Security",
    description:
      "Learn security fundamentals, practical threat awareness, and defensive techniques through structured modules.",
  },
];

function programDuration(program) {
  return program.duration?.trim() || "45 Days";
}

function InternshipPrograms() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState(fallbackPrograms);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    department: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPrograms()
      .then((result) => {
        if (result.data?.length) {
          setPrograms(result.data);
        }
      })
      .catch(() => {});
  }, []);

  const closeModal = () => {
    setSelectedProgram(null);
    setFieldErrors({});
    setStatus({ type: "", message: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateRegistrationForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStatus({ type: "error", message: "Please fix the errors below" });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });
    setFieldErrors({});

    try {
      const result = await submitApplication({
        ...formData,
        program: selectedProgram.title,
      });
      setStatus({ type: "success", message: result.message });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        college: "",
        department: "",
        message: "",
      });
    } catch (error) {
      setFieldErrors(error.errors || {});
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="internship-section theme-section" data-cine>
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14 md:mb-16" data-cine-head>
          <p className="theme-label mb-4">INTERNSHIP PROGRAMS</p>
          <h2 className="theme-heading">Gain Real-World Experience</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore industry-focused internship opportunities designed to help
            students build practical skills and professional confidence.
          </p>
        </Reveal>

        <ul className="program-grid">
          {programs.map((program, index) => (
            <li
              key={program._id || program.title || index}
              className="program-card internship-card"
            >
              <div className="program-card-cover">
                <img src={courseCover(program.title)} alt="" />
              </div>
              <p className="program-card-kicker">Internship</p>
              <h3>{program.title}</h3>
              <p className="program-card-meta">
                <span>
                  <Clock size={14} aria-hidden="true" />
                  {programDuration(program)}
                </span>
                <span>
                  <GraduationCap size={14} aria-hidden="true" />
                  Mentor-led
                </span>
              </p>
              <button
                type="button"
                className="program-card-apply"
                onClick={() =>
                  navigate(
                    `/internship/apply/${courseTitleToSlug(program.title)}`,
                  )
                }
              >
                Apply
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay px-4">
          <div className="w-full max-w-lg bg-surface border border-border rounded-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted hover:text-fg"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                <ProgramIcon
                  title={selectedProgram.title}
                  className="w-7 h-7"
                />
              </div>
              <h3 className="text-2xl font-medium text-fg">
                Apply for {selectedProgram.title}
              </h3>
            </div>

            <p className="text-muted mb-6">
              Fill in your details and we will get back to you soon.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FormField error={fieldErrors.fullName}>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className={inputClass(fieldErrors.fullName)}
                />
              </FormField>

              <FormField error={fieldErrors.email}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={inputClass(fieldErrors.email)}
                />
              </FormField>

              <FormField error={fieldErrors.phone}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (10 digits)"
                  className={inputClass(fieldErrors.phone)}
                />
              </FormField>

              <FormField error={fieldErrors.college}>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  placeholder="College Name"
                  className={inputClass(fieldErrors.college)}
                />
              </FormField>

              <FormField error={fieldErrors.department}>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department (e.g. Computer Science)"
                  className={inputClass(fieldErrors.department)}
                />
              </FormField>

              <FormField error={fieldErrors.message}>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Why do you want to join? (optional)"
                  className={inputClass(fieldErrors.message)}
                />
              </FormField>

              {status.message && (
                <p
                  className={
                    status.type === "success"
                      ? "text-green-400 text-sm"
                      : "text-red-400 text-sm"
                  }
                >
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full theme-btn-primary disabled:opacity-60 disabled:cursor-not-allowed py-4 font-medium"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default InternshipPrograms;
