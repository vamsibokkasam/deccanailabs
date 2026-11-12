import { useEffect, useId, useState } from "react";
import { useLocation } from "react-router-dom";
import { Send } from "lucide-react";
import FormField from "../FormField";
import SelectField from "../SelectField";
import { inputClass } from "../../utils/themeClasses";
import { sanitizeNameInput, validateServiceQuoteForm } from "../../utils/validation";
import { submitServiceQuote } from "../../services/api";
import { buildWhatsAppUrl } from "../../config/whatsapp";

export const QUOTE_SECTION_ID = "quote";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  serviceType: "",
  projectDetails: "",
  timeline: "",
};

const SERVICE_OPTIONS = [
  { value: "dynamic", label: "Dynamic website" },
  { value: "ecommerce", label: "Ecommerce website" },
  { value: "website-design", label: "Not sure yet — help me choose" },
];

const TIMELINE_OPTIONS = [
  "As soon as possible",
  "2–4 weeks",
  "1–2 months",
  "Flexible",
];

const SERVICE_LABELS = Object.fromEntries(
  SERVICE_OPTIONS.map((option) => [option.value, option.label])
);

export function serviceTypeFromPath(pathname = "") {
  if (pathname.includes("ecommerce")) return "ecommerce";
  if (pathname.includes("dynamic")) return "dynamic";
  if (pathname.includes("website-design") || pathname.startsWith("/services")) {
    return "website-design";
  }
  return "";
}

export function scrollToQuote(event) {
  const target = document.getElementById(QUOTE_SECTION_ID);
  if (!target) return;
  event?.preventDefault?.();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  if (window.location.hash !== `#${QUOTE_SECTION_ID}`) {
    window.history.replaceState(null, "", `#${QUOTE_SECTION_ID}`);
  }
}

function buildQuoteMessage(data) {
  const lines = [
    "New website quote request",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `WhatsApp: ${data.phone}`,
  ];

  if (data.businessName) lines.push(`Business: ${data.businessName}`);
  lines.push(`Service: ${SERVICE_LABELS[data.serviceType] || data.serviceType}`);
  if (data.timeline) lines.push(`Timeline: ${data.timeline}`);
  lines.push("", "Project details:", data.projectDetails);

  return lines.join("\n");
}

function ServiceQuoteForm() {
  const titleId = useId();
  const { pathname } = useLocation();
  const defaultServiceType = serviceTypeFromPath(pathname);
  const [formData, setFormData] = useState({
    ...emptyForm,
    serviceType: defaultServiceType,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      serviceType: prev.serviceType || defaultServiceType,
    }));
  }, [defaultServiceType]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "name") {
      nextValue = sanitizeNameInput(value, 100);
    } else if (name === "businessName") {
      nextValue = value.slice(0, 120);
    } else if (name === "projectDetails") {
      nextValue = value.slice(0, 2000);
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateServiceQuoteForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });
    setFieldErrors({});

    const payload = {
      ...formData,
      sourcePage: pathname,
    };

    try {
      await submitServiceQuote(payload);
      const url = buildWhatsAppUrl(buildQuoteMessage(payload));
      setWhatsappUrl(url);
      setStatus({
        type: "success",
        message:
          "Quote saved. WhatsApp will open so you can send the details to us instantly.",
      });
      window.open(url, "_blank", "noopener,noreferrer");
      setFormData({
        ...emptyForm,
        serviceType: defaultServiceType || "",
      });
    } catch (error) {
      setFieldErrors(error.errors || {});
      setStatus({
        type: "error",
        message: error.message || "Could not send your quote. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="service-quote-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        Quote request form
      </p>
      <div className="service-quote-grid">
        <FormField error={fieldErrors.name}>
          <input
            id="quote-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name *"
            autoComplete="name"
            className={inputClass(fieldErrors.name)}
          />
        </FormField>
        <FormField error={fieldErrors.email}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address *"
            autoComplete="email"
            className={inputClass(fieldErrors.email)}
          />
        </FormField>
        <FormField error={fieldErrors.phone}>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="WhatsApp number (10 digits) *"
            autoComplete="tel"
            inputMode="numeric"
            className={inputClass(fieldErrors.phone)}
          />
        </FormField>
        <FormField error={fieldErrors.businessName}>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Business / brand name"
            autoComplete="organization"
            className={inputClass(fieldErrors.businessName)}
          />
        </FormField>
        <FormField error={fieldErrors.serviceType}>
          <SelectField
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            options={SERVICE_OPTIONS}
            placeholder="Service you need *"
            hasError={Boolean(fieldErrors.serviceType)}
          />
        </FormField>
        <FormField error={fieldErrors.timeline}>
          <SelectField
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            options={TIMELINE_OPTIONS}
            placeholder="Timeline (optional)"
          />
        </FormField>
      </div>

      <FormField error={fieldErrors.projectDetails}>
        <textarea
          name="projectDetails"
          value={formData.projectDetails}
          onChange={handleChange}
          placeholder="Project details — pages, features, examples, or anything we should know *"
          rows={4}
          className={`${inputClass(fieldErrors.projectDetails)} min-h-[7.5rem] resize-y`}
        />
      </FormField>

      {status.message ? (
        <p
          className={`text-sm ${
            status.type === "success" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <div className="service-quote-actions">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="service-hero-btn-primary"
          >
            Open WhatsApp
          </a>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="service-hero-btn-primary disabled:opacity-60"
          >
            <Send size={16} aria-hidden="true" />
            {loading ? "Sending..." : "Submit quote"}
          </button>
        )}
      </div>
    </form>
  );
}

export default ServiceQuoteForm;
