import FocusAreas from "../components/FocusAreas";
import Framework from "../components/Framework";
import { useInView } from "../hooks/useInView";

function ProgramsPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.2 });

  return (
    <>
      <section
        ref={heroRef}
        className={`strategy-hero ${heroInView ? "is-inview" : ""}`}
      >
        <div className="strategy-hero-glow" aria-hidden="true" />
        <div className="strategy-hero-inner max-w-7xl mx-auto px-6 relative z-10">
          <div className="strategy-hero-copy">
            <p className="theme-label strategy-hero-anim strategy-hero-anim--1 mb-4">
              STRATEGY
            </p>
            <h1 className="strategy-hero-title strategy-hero-anim strategy-hero-anim--2 text-fg">
              Our strategy for{" "}
              <span className="text-accent">future-ready learners</span>
            </h1>
            <p className="strategy-hero-sub strategy-hero-anim strategy-hero-anim--3 text-muted">
              Focused pillars and a proven framework that turn learning into
              real skills, projects, and career confidence.
            </p>
          </div>
        </div>
      </section>

      <FocusAreas />
      <Framework />
    </>
  );
}

export default ProgramsPage;
