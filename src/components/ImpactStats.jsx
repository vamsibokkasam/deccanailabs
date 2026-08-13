import { useEffect, useState } from "react";
import { Award, Building2, GraduationCap, Users } from "lucide-react";
import { useInView } from "../hooks/useInView";

const stats = [
  {
    value: 100,
    suffix: "+",
    label: "Students Trained",
    hint: "Hands-on learners mentored",
    icon: Users,
  },
  {
    value: 10,
    suffix: "+",
    label: "IT Companies Collaborate",
    hint: "Industry partners engaged",
    icon: Building2,
  },
  {
    value: 150,
    suffix: "+",
    label: "Certificates Issued",
    hint: "Verified skill outcomes",
    icon: Award,
  },
  {
    value: null,
    display: "Industrial",
    label: "Level Training",
    hint: "Real-world curriculum depth",
    icon: GraduationCap,
  },
];

function useCountUp(target, active, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target == null) return undefined;

    let frame = 0;
    let start = 0;
    let timeoutId = 0;

    const tick = (now) => {
      if (!start) start = now;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    timeoutId = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(frame);
    };
  }, [active, target, duration, delay]);

  return value;
}

function StatCard({ stat, index, active }) {
  const counted = useCountUp(stat.value, active, 1400, index * 120);
  const Icon = stat.icon;

  return (
    <article
      className="home-reveal-item impact-stat-card group theme-card theme-card-hover relative overflow-hidden p-6 md:p-8 text-center"
      style={{ "--i": index }}
    >
      <div className="impact-stat-glow" aria-hidden="true" />

      <div className="relative">
        <div className="impact-stat-icon mx-auto mb-5">
          <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
        </div>

        <p className="impact-stat-value text-3xl md:text-4xl font-semibold tracking-tight">
          {stat.display ?? `${counted}${stat.suffix || ""}`}
        </p>

        <p className="text-fg font-medium text-sm md:text-base mt-3">
          {stat.label}
        </p>
        <p className="text-subtle text-xs md:text-sm mt-1.5 leading-snug">
          {stat.hint}
        </p>
      </div>
    </article>
  );
}

function ImpactStats() {
  const [ref, inView] = useInView({ threshold: 0.22 });

  return (
    <section
      ref={ref}
      className={`impact-stats-section home-reveal py-16 md:py-20 px-6 ${
        inView ? "is-inview" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="text-center mb-12 md:mb-14 home-reveal-item"
          style={{ "--i": 0 }}
        >
          <p className="theme-label mb-4">IMPACT STATS</p>
          <h2 className="theme-heading">Our Achievements</h2>
          <p className="mt-5 text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Outcomes that reflect our focus on practical learning, industry
            collaboration, and certified excellence.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              stat={stat}
              index={index + 1}
              active={inView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImpactStats;
