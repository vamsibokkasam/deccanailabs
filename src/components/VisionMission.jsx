import { Eye, Target, Lightbulb, Handshake } from "lucide-react";
import Reveal from "./Reveal";

const pillars = [
  {
    title: "Vision",
    Icon: Eye,
    accent: "from-accent/30 via-accent/10 to-transparent",
    description:
      "To become a leading platform that empowers individuals through innovation, technology, and future-focused learning.",
    points: [
      { label: "Innovation", Icon: Lightbulb },
      { label: "Future learning", Icon: Eye },
    ],
  },
  {
    title: "Mission",
    Icon: Target,
    accent: "from-accent-warm/30 via-accent-warm/10 to-transparent",
    description:
      "To bridge the gap between education and industry through internships, skill development, and innovation programs.",
    points: [
      { label: "Industry bridge", Icon: Handshake },
      { label: "Skill growth", Icon: Target },
    ],
  },
];

function VisionMission() {
  return (
    <section className="theme-section purpose-section">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14 md:mb-16">
          <p className="theme-label mb-4">OUR PURPOSE</p>
          <h2 className="theme-heading">Vision & Mission</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            What guides every internship, mentorship session, and learning
            experience we build.
          </p>
        </Reveal>

        <Reveal className="purpose-grid grid md:grid-cols-2 gap-6 md:gap-8">
          {pillars.map(({ title, Icon, accent, description, points }, index) => (
            <article
              key={title}
              className="home-reveal-item purpose-card group theme-card theme-card-hover relative overflow-hidden p-8 md:p-10"
              style={{ "--i": index }}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${accent}`}
                aria-hidden="true"
              />

              <div className="relative">
                <div className="purpose-icon mb-6">
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                </div>

                <h3 className="card-heading-hover text-2xl md:text-3xl font-semibold text-fg mb-4 transition-colors duration-300">
                  {title}
                </h3>

                <p className="text-muted leading-relaxed text-base md:text-lg">
                  {description}
                </p>

                <ul className="mt-8 flex flex-wrap gap-3">
                  {points.map(({ label, Icon: PointIcon }) => (
                    <li
                      key={label}
                      className="purpose-chip inline-flex items-center gap-2 text-sm text-fg/90"
                    >
                      <PointIcon
                        size={14}
                        strokeWidth={2}
                        className="text-accent"
                        aria-hidden="true"
                      />
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default VisionMission;
