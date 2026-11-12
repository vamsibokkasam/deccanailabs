import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const DEFAULT_CHIPS = ["Free consultation", "Fast delivery", "MSME certified"];

function ServiceHero({
  className = "",
  eyebrow,
  title,
  accent,
  description,
  breadcrumbs = [],
  primary = { label: "Get a free quote", to: "/contact" },
  secondary = { label: "Explore my services", to: "/services" },
  primaryLabel,
  primaryTo,
  secondaryLabel,
  secondaryTo,
  chips = DEFAULT_CHIPS,
}) {
  const [ref, inView] = useInView({ threshold: 0.12 });

  const primaryCta = {
    label: primary?.label ?? primaryLabel ?? "Get a free quote",
    to: primary?.to ?? primaryTo ?? "/contact",
  };
  const secondaryCta = {
    label: secondary?.label ?? secondaryLabel ?? "Explore my services",
    to: secondary?.to ?? secondaryTo ?? "/services",
  };

  return (
    <header
      ref={ref}
      className={`service-hero service-hero--classic ${className} ${inView ? "is-inview" : ""}`.trim()}
    >
      <div className="service-hero-atmosphere" aria-hidden="true">
        <span className="service-hero-orb service-hero-orb--a" />
        <span className="service-hero-grid" />
      </div>

      <div className="service-hero-inner">
        <div className="service-hero-copy">
          {breadcrumbs.length > 0 ? (
            <nav
              className="service-hero-crumbs service-hero-anim service-hero-anim--1"
              aria-label="Breadcrumb"
            >
              <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
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
              to={primaryCta.to}
              className="service-hero-btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/70 focus-visible:ring-offset-2 focus-visible:ring-offset-service-bg"
            >
              <Sparkles size={16} aria-hidden="true" />
              {primaryCta.label}
            </Link>
            <Link
              to={secondaryCta.to}
              className="service-hero-btn-secondary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hover/50 focus-visible:ring-offset-2 focus-visible:ring-offset-service-bg"
            >
              {secondaryCta.label}
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
                  <Check size={12} strokeWidth={2.5} aria-hidden="true" />
                  {chip}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default ServiceHero;
