import { BookOpen, Crown, Lightbulb, Rocket } from "lucide-react";
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
      data-cine
    >
      <div className="max-w-7xl mx-auto">
        <div className="strategy-section-head text-center mb-14 md:mb-16" data-cine-head>
          <p className="theme-label mb-4">OUR FRAMEWORK</p>
          <h2 className="theme-heading">Learn. Innovate. Execute. Lead.</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            A clear growth path — from first concepts to confident leadership.
          </p>
        </div>

        <ol className="studio-path">
          {steps.map(({ title, description, hint, Icon }, index) => (
            <li
              key={title}
              className="studio-path-step strategy-framework-step"
              style={{ "--step-i": index }}
            >
              <span className="studio-path-node" aria-hidden="true">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <p className="studio-path-kicker">{hint}</p>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Framework;
