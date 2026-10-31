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
      "We are MSME, NCS, ISO, StartupIndia, and AICTE certified — committed to quality standards and trusted learning experiences.",
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
  },
];

function WhyChooseUs() {
  return (
    <section className="why-section theme-section" data-cine>
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14 md:mb-16" data-cine-head>
          <p className="theme-label mb-4">WHY CHOOSE US</p>
          <h2 className="theme-heading">Why Choose DECCAN AI LABS?</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            We focus on innovation, practical learning, mentorship, and
            industry-relevant experiences.
          </p>
        </Reveal>

        <ul className="why-proof">
          {features.map(({ title, description, Icon }, index) => (
            <li key={title} className="why-proof-item why-card">
              <span className="why-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="why-icon">
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WhyChooseUs;
