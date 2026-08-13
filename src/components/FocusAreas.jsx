import {
  Brain,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useInView } from "../hooks/useInView";

const areas = [
  {
    title: "Artificial Intelligence & Intelligent Systems",
    description:
      "Driving awareness, adoption, and application of AI-powered technologies across learning and innovation ecosystems.",
    hint: "AI readiness",
    Icon: Brain,
  },
  {
    title: "Technology Education & Skill Development",
    description:
      "Delivering structured learning experiences that equip individuals with practical and industry-relevant competencies.",
    hint: "Skill building",
    Icon: GraduationCap,
  },
  {
    title: "Internship & Experiential Learning",
    description:
      "Creating opportunities for learners to gain hands-on exposure, real-world experience, and professional confidence.",
    hint: "Real exposure",
    Icon: Briefcase,
  },
  {
    title: "Innovation & Digital Transformation",
    description:
      "Supporting the development of innovative solutions that address modern challenges and accelerate growth.",
    hint: "Future systems",
    Icon: Sparkles,
  },
  {
    title: "Build Major or Final Year Project",
    description:
      "Guiding students through end-to-end major and final-year projects with mentorship, real-world problem framing, and industry-aligned outcomes.",
    hint: "Project delivery",
    Icon: FolderKanban,
    wide: true,
  },
];

function FocusAreas() {
  const [sectionRef, inView] = useInView({ threshold: 0.12 });

  return (
    <section
      ref={sectionRef}
      className={`strategy-focus theme-section ${inView ? "is-inview" : ""}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="strategy-focus-head strategy-section-head text-center mb-14 md:mb-16">
          <p className="theme-label tracking-wider mb-4">
            STRATEGIC FOCUS AREAS
          </p>
          <h2 className="theme-heading">What We Focus On</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Five pillars that shape how we teach, mentor, and prepare learners
            for real industry work.
          </p>
        </div>

        <div className="strategy-focus-grid">
          {areas.map(({ title, description, hint, Icon, wide }, index) => (
            <article
              key={title}
              className={`strategy-focus-card group theme-card theme-card-hover ${
                wide ? "strategy-focus-card--wide" : ""
              }`}
              style={{ "--focus-i": index }}
            >
              <div className="strategy-focus-glow" aria-hidden="true" />

              <div className="relative">
                <div className="strategy-focus-card-top">
                  <div className="strategy-focus-icon">
                    <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                </div>

                <p className="strategy-focus-hint mb-2">{hint}</p>

                <h3 className="card-heading-hover text-xl md:text-2xl font-semibold mb-3 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-muted leading-relaxed text-[15px] md:text-base">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FocusAreas;
