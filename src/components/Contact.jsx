import { useEffect, useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { getPrograms, submitContact } from "../services/api";
import { ORGANIZATION_LOCATION } from "../config/site";
import { validateContactForm, sanitizeNameInput } from "../utils/validation";
import { inputClass } from "../utils/themeClasses";
import FormField from "./FormField";
import SelectField from "./SelectField";
import SocialLinks from "./SocialLinks";
import Reveal from "./Reveal";

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

const contactDetails = [
  {
    label: "Email",
    value: "careers@deccanailabs.com",
    href: "mailto:careers@deccanailabs.com",
    Icon: Mail,
  },
  {
    label: "Phone",
    value: "+91 9845428526",
    href: "tel:+919845428526",
    Icon: Phone,
  },
  {
    label: "Location",
    value: ORGANIZATION_LOCATION,
    href: null,
    Icon: MapPin,
  },
];

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
    <section className="contact-section theme-section">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14 md:mb-16">
          <p className="theme-label mb-4">CONTACT US</p>
          <h2 className="theme-heading">Let's Connect</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about internships, programs, or partnerships? We'd
            love to hear from you.
          </p>
        </Reveal>

        <Reveal className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          <aside
            className="home-reveal-item contact-panel theme-card relative overflow-hidden p-7 md:p-8 flex flex-col"
            style={{ "--i": 0 }}
          >
            <div className="contact-panel-glow" aria-hidden="true" />

            <div className="relative">
              <p className="theme-label mb-3">Reach us</p>
              <h3 className="text-2xl font-semibold text-fg mb-2">
                Contact details
              </h3>
              <p className="text-muted text-sm leading-relaxed mb-8">
                Prefer a direct line? Email, call, or visit us — or send a
                message through the form.
              </p>

              <ul className="space-y-5">
                {contactDetails.map(({ label, value, href, Icon }) => (
                  <li key={label} className="contact-detail flex gap-4">
                    <div className="contact-detail-icon shrink-0">
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg mb-1">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="text-muted hover:text-accent transition-colors break-words"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-muted leading-relaxed">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-10 pt-8 border-t border-border">
                <p className="text-sm font-medium text-fg mb-4">Follow us</p>
                <SocialLinks />
              </div>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="home-reveal-item contact-panel theme-card relative overflow-hidden p-7 md:p-8 space-y-4"
            style={{ "--i": 1 }}
          >
            <div className="contact-panel-glow contact-panel-glow--form" aria-hidden="true" />

            <div className="relative mb-2">
              <p className="theme-label mb-3">Send a message</p>
              <h3 className="text-2xl font-semibold text-fg mb-1">
                Tell us how we can help
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                Share a few details and our team will get back to you.
              </p>
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="relative space-y-4">
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
                className="theme-btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed py-4 font-medium"
              >
                {loading ? "Sending..." : "Send Message"}
                {!loading && <Send size={16} aria-hidden="true" />}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export default Contact;
