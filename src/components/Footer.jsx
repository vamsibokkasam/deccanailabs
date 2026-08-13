import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { BRAND_LEGAL_NAME, ORGANIZATION_CIN } from "../config/branding";
import { ORGANIZATION_LOCATION } from "../config/site";
import { BrandText } from "./Logo";
import { SocialIconRow } from "./SocialLinks";

const legalLinks = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-and-conditions", label: "Terms & Conditions" },
  { to: "/help-support", label: "Help & Support" },
];

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Strategy" },
  { to: "/internships", label: "Internships" },
  { to: "/contact", label: "Contact" },
];

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "careers@deccanailabs.com",
    href: "mailto:careers@deccanailabs.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 9845428526",
    href: "tel:+919845428526",
  },
  {
    icon: MapPin,
    label: "Location",
    value: ORGANIZATION_LOCATION,
  },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block">
              <BrandText className="text-xl" showLegal={false} />
            </Link>
            <p className="text-accent text-sm font-medium mt-3 tracking-wide">
              Innovate • Learn • Transform
            </p>
            <p className="text-muted text-sm mt-4 leading-relaxed max-w-xs">
              Empowering students through AI innovation, internships, and
              industry-focused learning experiences. MSME · NCS · ISO certified.
            </p>
          </div>

          <div>
            <h4 className="text-fg font-medium mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-muted text-sm hover:text-accent transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-fg font-medium mb-4">Contact</h4>
            <ul className="space-y-4">
              {contactDetails.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-3">
                  <Icon size={18} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-subtle text-xs uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-muted text-sm hover:text-accent transition"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-muted text-sm">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-fg font-medium mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-muted text-sm hover:text-accent transition"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-fg font-medium mb-4">Follow Us</h4>
            <p className="text-muted text-sm mb-4">
              Stay connected on social media.
            </p>
            <SocialIconRow variant="inline" />
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted/70 text-sm text-center sm:text-left">
            © {new Date().getFullYear()} {BRAND_LEGAL_NAME}. All Rights Reserved.
            <span className="block sm:inline sm:ml-2">CIN: {ORGANIZATION_CIN}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
