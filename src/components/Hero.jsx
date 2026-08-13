import { Link } from "react-router-dom";
import DeccoMascot from "./decco/DeccoMascot";

/**
 * Equal 50/50 hero: left copy + right Decco video, one viewport tall.
 */
function Hero() {
  return (
    <section className="hero-bg text-fg">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="theme-label mb-1 tracking-wider">DECCAN AI LABS</p>
          <p className="hero-copy-kicker text-muted text-xs uppercase tracking-[0.18em] mb-3">
            Private Limited
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
