import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const DEFAULT_CHIPS = ["Free consultation", "Fast delivery", "MSME certified"];

function ServiceHero({
  className = "",
  eyebrow,
  title,
  accent,
  description,
  breadcrumbs = [],
  primaryLabel = "Get a free quote",
  primaryTo = "/contact",
  secondaryLabel = "Explore my services",
  secondaryTo = "/services",
  chips = DEFAULT_CHIPS,
  visual,
  visualLabel = "Service preview",
}) {
  const [ref, inView] = useInView({ threshold: 0.15 });

  return (
    <header
      ref={ref}
      className={`service-hero ${className} ${inView ? "is-inview" : ""}`.trim()}
    >
      <div className="service-hero-bg" aria-hidden="true">
        <span className="service-hero-orb service-hero-orb--a" />
        <span className="service-hero-orb service-hero-orb--b" />
        <span className="service-hero-grid" />
      </div>

      <div className="service-hero-inner max-w-7xl mx-auto px-6">
        <div className="service-hero-copy">
          {breadcrumbs.length > 0 ? (
            <nav
              className="service-hero-crumbs service-hero-anim service-hero-anim--1"
              aria-label="Breadcrumb"
            >
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                {breadcrumbs.map(({ label, to }, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <li key={`${label}-${index}`} className="flex items-center gap-2">
                      {index > 0 ? (
                        <span className="text-subtle/70" aria-hidden="true">
                          /
                        </span>
                      ) : null}
                      {to && !isLast ? (
                        <Link
                          to={to}
                          className="hover:text-accent-hover transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/60 rounded-sm"
                        >
                          {label}
                        </Link>
                      ) : (
                        <span className={isLast ? "text-muted" : undefined}>
                          {label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}

          <p className="theme-label service-hero-anim service-hero-anim--1 mb-3">
            {eyebrow}
          </p>

          <h1 className="service-hero-title service-hero-anim service-hero-anim--2">
            {title}{" "}
            <span className="text-accent-hover">{accent}</span>
          </h1>

          <p className="service-hero-desc service-hero-anim service-hero-anim--3 text-muted">
            {description}
          </p>

          <div className="service-hero-actions service-hero-anim service-hero-anim--4">
            <Link
              to={primaryTo}
              className="service-hero-btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/70 focus-visible:ring-offset-2 focus-visible:ring-offset-service-bg"
            >
              <Sparkles size={16} aria-hidden="true" />
              {primaryLabel}
            </Link>
            <Link
              to={secondaryTo}
              className="service-hero-btn-secondary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/50 focus-visible:ring-offset-2 focus-visible:ring-offset-service-bg"
            >
              {secondaryLabel}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>

          {chips?.length ? (
            <ul className="service-hero-chips service-hero-anim service-hero-anim--5">
              {chips.map((chip) => (
                <li key={chip} className="service-hero-chip">
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div
          className="service-hero-visual service-hero-anim service-hero-anim--3"
          role="img"
          aria-label={visualLabel}
        >
          {visual}
        </div>
      </div>
    </header>
  );
}

export default ServiceHero;
