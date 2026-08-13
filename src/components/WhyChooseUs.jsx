import {
  Award,
  Briefcase,
  Compass,
  Handshake,
  Layers,
} from "lucide-react";
import Reveal from "./Reveal";

const features = [
  {
    title: "Certified Excellence",
    description:
      "We are MSME, NCS, and ISO certified — committed to quality standards and trusted learning experiences.",
    Icon: Award,
  },
  {
    title: "Industry-Oriented Learning",
    description:
      "Learn through programs designed to align with current industry requirements and emerging technologies.",
    Icon: Briefcase,
  },
  {
    title: "Practical Experience",
    description:
      "Gain hands-on exposure through projects, assignments, and real-world learning opportunities.",
    Icon: Layers,
  },
  {
    title: "Mentorship & Guidance",
    description:
      "Receive support from experienced mentors who help you build confidence and professional skills.",
    Icon: Handshake,
  },
  {
    title: "Future-Ready Skills",
    description:
      "Develop technical and professional competencies that prepare you for future career opportunities.",
    Icon: Compass,
    wide: true,
  },
];

function WhyChooseUs() {
  return (
    <section className="why-section theme-section">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14 md:mb-16">
          <p className="theme-label mb-4">WHY CHOOSE US</p>
          <h2 className="theme-heading">Why Choose DECCAN AI LABS?</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We focus on innovation, practical learning, mentorship, and
            industry-relevant experiences.
          </p>
        </Reveal>

        <Reveal className="why-grid grid md:grid-cols-2 gap-5 md:gap-7">
          {features.map(({ title, description, Icon, wide }, index) => (
            <article
              key={title}
              className={`home-reveal-item why-card group theme-card theme-card-hover relative overflow-hidden p-7 md:p-8 ${
                wide ? "md:col-span-2" : ""
              }`}
              style={{ "--i": index }}
            >
              <div className="why-card-glow" aria-hidden="true" />

              <div className="relative flex items-start gap-4 md:gap-5">
                <div className="why-icon shrink-0">
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="card-heading-hover text-xl md:text-2xl font-semibold text-fg mb-3 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-muted leading-relaxed">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default WhyChooseUs;
