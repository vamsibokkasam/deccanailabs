import { Award, Building2, GraduationCap, Users } from "lucide-react";

const stats = [
  {
    value: "100+",
    label: "Students Trained",
    icon: Users,
  },
  {
    value: "10+",
    label: "Companies Collaborate",
    icon: Building2,
  },
  {
    value: "150+",
    label: "Certificates Issued",
    icon: Award,
  },
  {
    value: "Industrial Level",
    label: "Training",
    icon: GraduationCap,
  },
];

function ImpactStats() {
  return (
    <section className="py-14 px-6 bg-gradient-to-r from-surface via-bg to-surface border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="theme-label mb-4">IMPACT STATS</p>
          <h2 className="theme-heading">Our Achievements</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="theme-card theme-card-hover p-6 md:p-8 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <Icon className="text-accent" size={22} />
              </div>
              <p className="text-2xl md:text-3xl font-semibold text-fg tracking-tight">
                {value}
              </p>
              <p className="text-muted text-sm md:text-base mt-2">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImpactStats;
