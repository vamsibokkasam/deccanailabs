import { useEffect, useState } from "react";
import { getPrograms, submitContact } from "../services/api";
import { validateContactForm, sanitizeNameInput } from "../utils/validation";
import { inputClass } from "../utils/themeClasses";
import FormField from "./FormField";
import SelectField from "./SelectField";
import SocialLinks from "./SocialLinks";

const fallbackInternships = [
  "Web Development",
  "Java Development",
  "Python Development",
  "AI & Machine Learning",
  "Data Science",
  "Cyber Security",
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  whatsapp: "",
  internship: "",
  message: "",
};

function Contact() {
  const [internships, setInternships] = useState(fallbackInternships);
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPrograms()
      .then((result) => {
        if (result.data?.length) {
          setInternships(result.data.map((p) => p.title));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "whatsapp") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "firstName" || name === "lastName") {
      nextValue = sanitizeNameInput(value, 50);
    }

    setFormData({ ...formData, [name]: nextValue });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateContactForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });
    setFieldErrors({});

    try {
      const result = await submitContact(formData);
      setStatus({ type: "success", message: result.message });
      setFormData(emptyForm);
    } catch (error) {
      setFieldErrors(error.errors || {});
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="theme-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="theme-label mb-4">CONTACT US</p>
          <h2 className="theme-heading">Let's Connect</h2>
          <p className="mt-6 text-lg text-muted max-w-3xl mx-auto">
            Have questions about internships, programs, or partnerships?
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="theme-card p-8">
            <div className="mb-8">
              <h3 className="text-xl font-medium text-fg mb-2">Email</h3>
              <p className="text-muted">deccanailabs212@gmail.com</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium text-fg mb-2">Phone</h3>
              <p className="text-muted">+91 63032 07231</p>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium text-fg mb-2">Location</h3>
              <p className="text-muted">Bengaluru, Karnataka, India</p>
            </div>

            <SocialLinks />
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="theme-card p-8 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField error={fieldErrors.firstName}>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name *"
                  required
                  className={inputClass(fieldErrors.firstName)}
                />
              </FormField>

              <FormField error={fieldErrors.lastName}>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name *"
                  required
                  className={inputClass(fieldErrors.lastName)}
                />
              </FormField>
            </div>

            <FormField error={fieldErrors.email}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address *"
                required
                className={inputClass(fieldErrors.email)}
              />
            </FormField>

            <FormField error={fieldErrors.whatsapp}>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="WhatsApp Number (10 digits) *"
                inputMode="numeric"
                maxLength={10}
                required
                className={inputClass(fieldErrors.whatsapp)}
              />
            </FormField>

            <FormField error={fieldErrors.internship}>
              <SelectField
                name="internship"
                value={formData.internship}
                onChange={handleChange}
                options={internships}
                placeholder="Select Internship *"
                hasError={!!fieldErrors.internship}
              />
            </FormField>

            <FormField error={fieldErrors.message}>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Your Message (optional)"
                className={inputClass(fieldErrors.message)}
              ></textarea>
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
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
