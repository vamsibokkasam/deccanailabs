import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

function ServiceStickyBar({
  label = "Get a free quote",
  to = "/contact",
}) {
  return (
    <div className="service-sticky-bar md:hidden">
      <Link
        to={to}
        className="service-hero-btn-primary w-full justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/70"
      >
        <Sparkles size={16} aria-hidden="true" />
        {label}
      </Link>
    </div>
  );
}

export default ServiceStickyBar;
