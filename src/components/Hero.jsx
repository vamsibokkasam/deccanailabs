import { Link } from "react-router-dom";
import DeccoMascot from "./decco/DeccoMascot";
import { BRAND_LEGAL_SUFFIX, BRAND_NAME } from "../config/branding.js";

/**
 * Mobile: copy then video stacked, video fills remaining height.
 * Desktop: 35/65 columns. One viewport tall.
 */
function Hero() {
  return (
    <section className="hero-bg text-fg">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-brand" aria-label={`${BRAND_NAME} ${BRAND_LEGAL_SUFFIX}`}>
            <span className="hero-brand-name">
              <span>DECCAN</span>
              <span className="hero-brand-ai">AI</span>
              <span>LABS</span>
            </span>
            <span className="hero-brand-legal">
              <span className="hero-brand-rule" aria-hidden="true" />
              <span className="hero-brand-legal-text">{BRAND_LEGAL_SUFFIX}</span>
              <span className="hero-brand-rule" aria-hidden="true" />
            </span>
          </p>

          <h1 className="hero-copy-title font-medium leading-[1.12] tracking-tight">
            Building The Future With
            <span className="block text-accent">Artificial Intelligence</span>
          </h1>

          <p className="hero-copy-body mt-4 leading-relaxed text-muted">
            Empowering students and professionals through AI innovation,
            internships, research opportunities, and real-world industry
            projects.
          </p>

          <div className="hero-copy-actions mt-6 flex flex-wrap gap-3">
            <Link to="/internships" className="theme-btn-primary">
              Explore Internships
            </Link>
            <Link to="/contact" className="theme-btn-outline">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="hero-decco-stage">
          <DeccoMascot />
        </div>
      </div>
    </section>
  );
}

export default Hero;
