import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function getInitials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TeamMemberCard({ name, title, bio, imageSrc, imagePosition = "center top" }) {
  return (
    <article className="group relative theme-card theme-card-hover p-8 md:p-10 flex flex-col items-center text-center overflow-hidden h-full">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative mb-7">
        <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-accent/40 to-accent-warm/40 blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
        <div className="relative rounded-full p-[3px] bg-gradient-to-br from-accent via-accent-warm to-accent shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-shadow duration-500">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-[3px] border-surface bg-surface">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`${name} — ${title}`}
                className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500"
                style={{ objectPosition: imagePosition }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/25 via-surface to-accent-warm/20">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-accent to-accent-warm bg-clip-text text-transparent">
                  {getInitials(name)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-fg tracking-tight">{name}</h3>
      <span className="inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-accent/10 text-accent border border-accent/25">
        {title}
      </span>
      <p className="text-muted text-sm leading-relaxed mt-5 flex-1">{bio}</p>
    </article>
  );
}

const teamMembers = [
  {
    name: "B VAMSI",
    title: "CEO & Founder",
    imageSrc: "/1000354279.jpg",
    imagePosition: "center 18%",
    bio: "Leading DECCAN AI labs with a vision to bridge education and industry through AI-driven innovation and hands-on learning.",
  },
  {
    name: "K GANESH",
    title: "Co-Founder & Marketing",
    imageSrc: "/Ganesh_Professional_Photo.jpg",
    imagePosition: "center 22%",
    bio: "Drives brand growth, outreach, and strategic marketing to connect students with transformative opportunities.",
  },
  {
    name: "U KEERTHI PRIYA",
    title: "MD & HR",
    imageSrc: "/Keerthi_photo.png",
    imagePosition: "center 20%",
    bio: "Oversees operations and human resources, building a strong culture across programs and internal teams.",
  },
  {
    name: "M BALAJI",
    title: "CTO & BDM",
    imageSrc: "/Balaji_Professional_Photo.png",
    imagePosition: "center 20%",
    bio: "Leads technology strategy and business development to create scalable growth and industry partnerships.",
  },
];

function LeadershipTeam() {
  return (
    <section className="relative theme-section min-h-[85vh] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent-warm/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-muted hover:text-accent transition-colors mb-10 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to About
        </Link>

        <div className="text-center mb-16">
          <p className="theme-label mb-4">OUR TEAM</p>
          <h1 className="theme-heading">Leadership Team</h1>
          <div className="mx-auto mt-6 h-1 w-20 rounded-full bg-gradient-to-r from-accent to-accent-warm" />
          <p className="mt-8 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Meet the visionary leaders driving educational innovation and creating
            transformative learning experiences for students across India.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default LeadershipTeam;
