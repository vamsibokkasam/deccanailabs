import { ArrowRight, BookOpen, Crown, Lightbulb, Rocket } from "lucide-react";
import { useInView } from "../hooks/useInView";

const steps = [
  {
    title: "Learn",
    description:
      "Acquire knowledge through structured learning and guided mentorship.",
    hint: "Build foundations",
    Icon: BookOpen,
  },
  {
    title: "Innovate",
    description:
      "Apply creativity and critical thinking to solve real-world challenges.",
    hint: "Think differently",
    Icon: Lightbulb,
  },
  {
    title: "Execute",
    description:
      "Transform ideas into practical solutions through projects and implementation.",
    hint: "Ship real work",
    Icon: Rocket,
  },
  {
    title: "Lead",
    description:
      "Develop confidence, competence, and leadership for future success.",
    hint: "Grow with impact",
    Icon: Crown,
  },
];

function Framework() {
  const [sectionRef, inView] = useInView({ threshold: 0.12 });

  return (
    <section
      ref={sectionRef}
      className={`strategy-framework theme-section ${inView ? "is-inview" : ""}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="strategy-section-head text-center mb-14 md:mb-16">
          <p className="theme-label mb-4">OUR FRAMEWORK</p>
          <h2 className="theme-heading">Learn. Innovate. Execute. Lead.</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            A clear growth path — from first concepts to confident leadership.
          </p>
        </div>

        <ol className="strategy-framework-rail">
          {steps.map(({ title, description, hint, Icon }, index) => (
            <li
              key={title}
              className="strategy-framework-step group"
              style={{ "--step-i": index }}
            >
              <article className="strategy-framework-card theme-card theme-card-hover">
                <div className="strategy-framework-glow" aria-hidden="true" />

                <div className="relative">
                  <div className="strategy-framework-icon">
                    <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                  </div>

                  <p className="strategy-framework-hint mb-2">{hint}</p>

                  <h3 className="card-heading-hover text-2xl font-semibold mb-3 transition-colors duration-300">
                    {title}
                  </h3>

                  <p className="text-muted leading-relaxed text-[15px] md:text-base">
                    {description}
                  </p>
                </div>
              </article>

              {index < steps.length - 1 ? (
                <span
                  className="strategy-framework-connector"
                  aria-hidden="true"
                >
                  <ArrowRight size={14} strokeWidth={2.25} />
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Framework;
