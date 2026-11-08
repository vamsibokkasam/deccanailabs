import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";

function ServiceCtaBand({
  eyebrow = "NEXT STEP",
  title,
  description,
  buttonLabel = "Get a free quote",
  buttonTo = "/contact",
  icon: Icon,
}) {
  return (
    <section className="service-section pt-0">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="service-cta text-center md:text-left md:flex md:items-center md:justify-between md:gap-8">
            <div className="max-w-2xl">
              <p className="theme-label mb-3">{eyebrow}</p>
              <h2 className="theme-heading">{title}</h2>
              <p className="mt-3 text-muted text-base md:text-lg leading-relaxed">
                {description}
              </p>
            </div>
            <Link
              to={buttonTo}
              className="service-hero-btn-primary mt-6 md:mt-0 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/70"
            >
              {Icon ? <Icon size={16} aria-hidden="true" /> : null}
              {buttonLabel}
              {!Icon ? <ArrowRight size={16} aria-hidden="true" /> : null}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default ServiceCtaBand;
